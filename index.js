require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); 
const connection = require('./db');
const User = require('./models/user');
const jwt = require('jsonwebtoken');

const app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.set('view engine','ejs');

connection();

function createToken(data){
    return jwt.sign(data,process.env.TOKEN)
}

app.get("/",(req,res)=>{
    User.find({},(err,result)=>{
        res.render('Show',{users:result});
    }) 
})



app.get("/addcontact",(req,res)=>{
    let token = createToken({access:true})
    res.render('Addcontactform',{token});
})

app.post("/addbulkcontact",(req,res)=>{
    jwt.verify(req.body.token,process.env.TOKEN,function(err,data){
        if(err){
            res.sendStatus(403);
        }else{
            delete req.body.token;
            const data = req.body.data;
            let err = false;
            data.forEach(ele => {
                if( ele.name == '' || ele.mobileNuber == '' ){
                    err=true;
                }
            });
            if( err===true ){
                res.send({status:false,msg:"Invalid data"});
            }else{
                data.forEach(e=>{
                    const bulkUser = new User({
                        UserName: e.name,
                        MobileNumber: e.mobileNuber,
                    })
                    bulkUser.save();
                })
                res.send({status:true}).status(200);
            }
        }
    })
})
app.get("/update/:id",(req,res)=>{
    User.findById(req.params.id,(err,result)=>{
        if( result ){
            let token = createToken({access:true})
            res.render('Update',{users:result,token});
        }else{
            res.send("Invalid id");
        }
    })
})

app.get("/delete/:id",async(req,res)=>{
    await User.findByIdAndDelete(req.params.id)
    res.redirect('/');
})

app.post("/update/:id",async(req,res)=>{
    await jwt.verify(req.body.token,process.env.TOKEN,function(err,data){
        if(err){
            console.log("dsfef")
            res.sendStatus(err);
        }else{
            delete req.body.token;
            User.findByIdAndUpdate(req.params.id,req.body);
            res.redirect('/');
        }
    })
})

const port = process.env.PORT || 4040;
app.listen(port,()=>{
    console.log(`running on port ${port}`);
})