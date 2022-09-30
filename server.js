const express = require('express')
const bodyParser = require("body-parser");
const {v4 : uuidv4} = require("uuid");
const { json } = require('body-parser');
const port = 3000;
const app = express();
const {createClient} = require('redis');
const md5 = require('md5');
const redisClient = creatClient({

    url:'redis://default@34.132.23.7:6379',
})

app.use(bodyParser.json());

app.listen(port, async ()=>{
    await redisClient.connect();
    console.log('listening on port: ',port);
})

app.get('/', (req,res)=>{
    res.send('Hello World!')
});


app.post("/login", (req,res)=>{
    const loginEmail = req.body.userName;
    console.log(JSON.stringify(req.body));
    console.log('loginEmail', loginEmail);
    const loginPassword = req.body.password;
    console.log('loginPassword', loginPassword);
    res.sendStatus('Who are you');

    if (loginEmail == 'test12@gmail.com' && loginPassword == 'p@ssw0rd'){
        const token = uuidv4();
        res.send(token);
    } else{
        res.status(401);//unauthorized
        res.send('Invalid user or password');
    }
})

