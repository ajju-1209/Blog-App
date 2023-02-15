const express=require('express');
const app=express();
const cors=require('cors');
const { default: mongoose } = require('mongoose');
const User=require('./Models/User');

//It is used to suppress the warnings given by mongoose
//At this point even i don't know what those warnings meant
//so i just suppressed them (May be i'look onto them in future!)
mongoose.set('strictQuery',true);

//configuring inorder to access env variables
require('dotenv').config();

//For reading cookies
const cookieParser=require('cookie-parser');

const multer=require('multer');

const uploadMiddleware=multer({dest:'uploads/'});

const fs=require('fs');//fileSystem module of node

const Post=require("./Models/Post");



//bcrypt
//A library to help you hash passwords.

//storing passwords as plaintext must never be an option.Instead
//we want store them by hashing passwords.
//A more better way to store passwords is adding a salt
//to hashing process.
//salt:adding additional random data to the input of a hashing 
//funtion that makes  password hash unique.

const bcrypt=require('bcryptjs');
//generating salt

const salt=bcrypt.genSaltSync(10);//study about this


const jwt=require('jsonwebtoken');

const path = require('path');

//middleware 
//when passing credentials we need set up additional properties
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());

app.use(cookieParser());

//connecting to our database using mongoose library
// async ()=>{
//   const c=await mongoose.connect('mongodb+srv://ajju-1209:Yk9MJ2GHBwEVUzOS@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority');
//   return c;
// };

mongoose.connect('mongodb+srv://ajju-1209:Yk9MJ2GHBwEVUzOS@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority',{

});

//just for testing purpose
app.get('/',(req,res)=>{
  res.send('Hello MotherFucker!');
});


//if post request comes to '/register' page 
app.post('/register',async (req,res)=>{
  const {username,password}=req.body;
  try {
    // console.log(username,password);
    const userDoc=await User.create({
      username,
      password:bcrypt.hashSync(password,salt),
    });
    res.json(userDoc);
  } 
  catch (error) {
    res.status(400).json(error);
  }
});



//if post request comes to '/login' page 

app.post('/login',async (req,res)=>{
  const {username,password}=req.body;
  try{

    //finding user with 'username' from database
    //so that we can match whether password entered
    //by user now matches password in database or not.

    console.log(username,password);
    const userDoc=await User.findOne({username});

    //comparing the value whether password is matching or not
    //As we have hashed our password while storing in database
    //so we are using bcrypy to unhash it and the compare it with 
    //password entered by user

    const passok=bcrypt.compareSync(password,userDoc.password);

    if(passok){
      //logged in

      //If password entered is correct then generating a (jwt)
      //json web token in order to authorize the request made by
      //same user to access data 
      //and sending token back to user so that he can use it 
      //to access confidential data and routes

      //sending username and id in payload

      jwt.sign({username,id:userDoc._id},process.env.JWT_SECRET,{},(err,token)=>{
        if(err){

          //just for testing purpose
          // console.log('No token generated');
          // console.log(err);
          throw err;
        }
        else{
          // res.json(token);
          //sending token as a cookie so that later user can send it back with
          //http requests so that server can authorize whether it 
          //is same user making requests who logged in.

            console.log('token generated ',userDoc._id);
            res.cookie('token',token).json({
            id:userDoc._id,
            username,
          });
        }
      });
    }
    else{
      //if password was not matched
      res.status(400).json('wrong credentials');
    }
  }catch (error) {
    
  }
});



//Handling get request at route '/profile' 

app.get('/profile',(req,res)=>{

  //client is doing get request in order to display our profile
  //Client is sending jwt along with request.
  //Server will verify whether it is same client whom this token was 
  //provided or token has been altererd.

  //grabbing the token from cookies
  const {token}=req.cookies;
  //verifying the token
  jwt.verify(token,process.env.JWT_SECRET,{},(err,info)=>{
    if(err) throw err;
    res.json(info);
  });
  res.json(req.cookies);//for reading cookies we need a cookie parser
});

//Handling POST request at route '/logout'

app.post('/logout',(req,res)=>{
  res.cookie('token','').json('ok');
});

//Handling POST request at route '/post'

app.post('/post',uploadMiddleware.single('file'),async (req,res)=>{
  console.log(req.file);
  const {originalname,path}=req.file;
  const parts=originalname.split('.');
  const ext=parts[parts.length -1];
  const newPath=path+'.'+ext;
  fs.renameSync(path,newPath);

  const {title,summary,content}=req.body;
  const postDoc=await Post.create({
    title,
    summary,
    content,
    conver:newPath,
  });

  res.json(postDoc);
});

//Request to get all the post present in database

app.get('/post',async (req,res)=>{
  const posts=await Post.find();
  // console.log(posts.length);
  res.json(posts);
})

app.listen(4000,()=>{
  console.log('server is listening at port 4000.../' );
});
//password and connection string of database
// Yk9MJ2GHBwEVUzOS
//mongodb+srv://ajju-1209:<password>@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority