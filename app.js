//jshint esversion:6
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";





const app=express();
const port=3000;
// console.log(process.env.secret);


app.use(bodyParser.urlencoded({extended :true}));
app.use(express.static("public"));
app.set('view engine','ejs');

app.use(session({
    secret:"Ourlittlesecret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());





mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);


const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",(req,res)=>{
    if (req.isAuthenticated()){
        res.render("secrets");
    }else {
        res.render("login");
    }
});

app.get("/logout",(req,res)=>{
    req.logOut(function(err){
        if (err){
            console.log(err);
        }
    });
    res.redirect("/");
})

app.post("/register",(req,res)=>{

    User.register({username:req.body.username},req.body.password,function(err,user){
        if (err){
            console.log(err);
            res.redirect("/register");

        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })




});
app.post("/login",(req,res)=>{

    const user=new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if (err){
            console.log(err);
        }
        else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });

});



app.listen(port,function() {
    console.log("Server started on port 3000");
});

