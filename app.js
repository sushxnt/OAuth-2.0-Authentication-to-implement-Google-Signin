//jshint esversion6
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

const app=express();
const port=3000;
console.log(process.env.secret)


app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

//Encryption Key in env


//Encrypting the password field only
userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:['password']});

const User=new mongoose.model("User",userSchema);


app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register",(req,res)=>{
    const newUser=new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save()
    .then(function(){
        res.render("secrets");
    })
    .catch(function(err){
        console.log(err)
    });
    

});
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username})
    .then(function(foundUser){
        if (foundUser){
            if(foundUser.password===password){
                res.render("secrets");
            }
        }
    })
    .catch(function(err){
        console.log(err);
    })





})



app.listen(port,function() {
    console.log("Server started on port 3000");
});

