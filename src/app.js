const express = require("express");
const app = express();
const mongoose = require('mongoose');
const user = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWTSecret = "asw@saosdoadfigfjsd)@/a#!/";

app.use(express.urlencoded({extended: false}));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/imagens" ,{useNewUrlParser: true, useUnifiedTopology: true})
.then(()=>{
    //console.log('Conectado ao banco');
}).catch((err) =>{
    console.log(err)
});

var User = mongoose.model("User", user);

app.post('/user', async (req, res) =>{
    
    if(req.body.name == "" && req.body.email == "" && req.body.password == ""){
        res.sendStatus(400);
        return;
    }
    
    try{
        let user = await User.findOne({email: req.body.email});

        if(user != undefined){
            res.statusCode = 400;
            res.json({error: "Email já cadastrado"});
            return;
        }

        let password = req.body.password;
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);

        let newUSer = new User({
            name: req.body.name,
            email: req.body.email,
            password : hash
        });

        await newUSer.save();
        res.json({email: req.body.email})
        return true;
    }catch(err){
       res.sendStatus(500);
       console.log("Erro: " + err);
    }
    
});

app.delete('/delete/:id',  async (req, res) =>{
    await User.deleteOne({email: req.params.email});
    res.sendStatus(200);
});

app.post('/auth', async (req, res) =>{
    let {email, password }  = req.body;

    let user = await User.findOne({email: email});
    if(user == undefined){
        res.statusCode = 403;
        res.json({errors: {email: "Email não cadastrado"}});
        return;
    }

    let isPasswordRight = await bcrypt.compare(password, user.password);

    if(!isPasswordRight){
        res.statusCode = 403;
        res.json({errors: { password: "Senha incorreta"}});
        return;
    }



    jwt.sign({email: email, name: user.name, id :user._id}, JWTSecret, {expiresIn: '48h'}, (err, token) =>{
        if(err){
            res.sendStatus(500);
            console.log(err);
            return;
        }

        res.json({token: token});

    })
});



app.get("/", (req, res) =>{
    res.json({});
});

app.listen()

module.exports = app;