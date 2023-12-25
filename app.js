//jshint esversion:6
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";
import {Strategy as GoogleStrategy} from'passport-google-oauth20';
import findOrCreate from "mongoose-findorcreate";




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
    password:String,
    googleId:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User=new mongoose.model("User",userSchema);


passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Any kind of authentication other than local auth
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));




app.get("/",(req,res)=>{
    res.render("home");
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ["profile"] 
}));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });


app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",(req,res)=>{

    User.find({"secret":{$ne:null}})
    .then(function(foundUsers){
        if (foundUsers){
            res.render("secrets",{usersWithSecrets:foundUsers})
        }
        
    })
    .catch(function(err){
        console.log(err);
    })



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

app.get("/submit",(req,res)=>{
    if (req.isAuthenticated()){
        res.render("submit");
    }else {
        res.redirect("/login");
    }

});

app.post("/submit",(req,res)=>{
    const submittedSecret=req.body.secret;
    // console.log(req.user._id); //user _ here to get property id

    // User.findById(req.user.id,function(err,foundUser){
    //     if (err){
    //         console.log(err);
    //     }
    //     else {
    //         if (foundUser){
    //             foundUser.secret=submittedSecret;
    //             foundUser.save(function(){
    //                 res.redirect("/secrets");
    //             });
    //         }
    //     }
    // })
    User.findById(req.user._id)
    .then(function(foundUser){
        if (foundUser){
            foundUser.secret=submittedSecret;
            foundUser.save()
            .then(function(){
                res.redirect("/secrets");
            })
        }
    })
    .catch(function(err){
        console.log(err);
    })
    
    

    


});



app.listen(port,function() {
    console.log("Server started on port 3000");
});

