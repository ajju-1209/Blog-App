const express=require('express');
const app=express();
const cors=require('cors');
const { default: mongoose } = require('mongoose');
const User=require('./Models/User');

//configuring inorder to access env variables
require('dotenv').config();


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
const secret='asdojfp;n094uf0sdnvnsdvkdsnvk';
//middleware 
//when passing credentials we need set up additional properties
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());

//connecting to our database using mongoose library
// async ()=>{
//   const c=await mongoose.connect('mongodb+srv://ajju-1209:Yk9MJ2GHBwEVUzOS@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority');
//   return c;
// };

mongoose.connect('mongodb+srv://ajju-1209:Yk9MJ2GHBwEVUzOS@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority');

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
          throw err;
        }
        else{
          // res.json(token);
          //sending token as a cookie so that later user can send it back with
          //http requests so that server can authorize whether it 
          //is same user making requests who logged in.

          res.cookie('token',token).json('ok');
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


app.listen(4000,()=>{
  console.log('server is listening at port 4000.../' );
});
//password and connection string of database
// Yk9MJ2GHBwEVUzOS
//mongodb+srv://ajju-1209:<password>@cluster0.ktyyi0s.mongodb.net/?retryWrites=true&w=majority