//jshint esversion6
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcrypt";


const saltRounds=10;
const app=express();
const port=3000;
// console.log(process.env.secret);


app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set('view engine','ejs');

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});


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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        const newUser=new User({
            email:req.body.username,
            password:hash
        });
        newUser.save()
        .then(function(){
            res.render("secrets");
        })
        .catch(function(err){
            console.log(err)
        });
        
    });
});
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({email:username})
    .then(function(foundUser){
        if (foundUser){
            // Load hash from your password DB.
            bcrypt.compare(password, foundUser.password, function(err, result) {
             if (result===true) {
                res.render("secrets");
                    }   

             });
        }
    })
    .catch(function(err){
        console.log(err);
    })





});



app.listen(port,function() {
    console.log("Server started on port 3000");
});

