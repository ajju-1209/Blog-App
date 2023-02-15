import { useContext, useEffect,useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header(){

  // const [username,setUsername]=useState(null);
  
  const {setUserInfo,userInfo}=useContext(UserContext);
  
  useEffect( ()=>{
    //look more about credentials and fetch api
    fetch('http://localhost:4000/profile',{
      credentials:'include',
    }).then((response)=>{
      response.json().then((userInfo)=>{
        // console.log(userInfo);
        setUserInfo(userInfo);
      });
    });
  },[]);


  function logout(){

    //doing post request and sending token to server 
    //inorder to invalidate it so that we get logged out.
    fetch('http://localhost:4000/logout',{
      credentials:'include',
      method:'POST',
    });

    //as we have logged out so username must be set to null
    setUserInfo(null);
  };

  //because userInfo can be sometime null so adding ? 
  const username=userInfo?.username;

  return(
    <header>
        <Link to="/" className="logo">MyBlog</Link>
        <nav>
          {username && (
            <>
              <Link to="/create">Create new post</Link>
              <a onClick={logout}>Logout</a>
            </> 
          )}
          {!username && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
          
        </nav>
      </header>
  );  
};