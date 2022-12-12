const express = require('express')
const bodyParser = require('body-parser');
const {v4 : uuidv4} = require("uuid");
const { json } = require('body-parser');
const https = require('https')
const fs = require('fs')
const port = 443;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');
const loginAttemptCount = {};



const redisClient = createClient(
//   {
//     //   url:`redis://default:${process.env.REDIS_PASS}@redis-stedi-ronnie:6379`,
//   }
  );

app.use(bodyParser.json());

app.use(express.static("public"))

https.createServer({
    key: fs.readFileSync('./ssl/server.key'),
    cert: fs.readFileSync('./ssl/server.cert'),
    ca: fs.readFileSync('./ssl/chain.pem'),
    
}, app).listen(port, async () => {
    console.log('Listening...')
    try{
        await redisClient.connect();
        console.log('Listening...')}
        catch(error){
        console.log(error)
    }
});



// app.get('/', (req,res)=>{
//     res.send('Hello World!')
// });

app.post('/user', (req,res)=>{
    const newUserRequestObject = req.body;
    const loginPassword = req.body.password;
    const hash = md5(loginPassword);
    console.log(hash);
    newUserRequestObject.password = hash;
    newUserRequestObject.verifyPassword = hash;
    console.log('New User:',JSON.stringify(newUserRequestObject));
    redisClient.hSet('users',req.body.email,JSON.stringify(newUserRequestObject));
    res.send('New User'+newUserRequestObject.email+'added');
});

app.post('/login', async (req,res)=>{
    const loginEmail = req.body.userName;
    console.log(JSON.stringify(req.body));
    console.log('loginEmail', loginEmail);
    const loginPassword = md5(req.body.password);
    console.log('loginPassword', loginPassword);

    const userString=await redisClient.hGet('users',loginEmail);
    console.log('userString', userString);
    const userObject=JSON.parse(userString)

    if (loginAttemptCount.userName == undefined){
        loginAttemptCount.userName = 1
    }

    if (loginAttemptCount.userName > 3){
        res.status(403);
        res.send("Locked");
        console.log(loginAttemptCount.userName, "Login attemps for user", loginEmail, );
    }
    else{
        if (userString=='' || userString==null){
            res.status(404);
            res.send('User not found');
        }

        else if (loginEmail == userObject.userName && loginPassword == userObject.password){
            const token = uuidv4();
            res.send(token);
        } else{
            loginAttemptCount.userName += 1;    
            res.status(401);
            res.send('Invalid user or password');
            
        }
    }
});