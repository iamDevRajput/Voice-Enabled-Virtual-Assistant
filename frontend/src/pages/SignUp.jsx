import React, { useContext, useState } from 'react'
import bg from "../assets/authBg.png"
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from "axios"

function SignUp() {

  const [showPassword,setShowPassword]=useState(false)

  const {serverUrl,userData,setUserData}=useContext(userDataContext)

  const navigate=useNavigate()

  const [name,setName]=useState("")
  const [email,setEmail]=useState("")

  const [loading,setLoading]=useState(false)

  const [password,setPassword]=useState("")

  const [err,setErr]=useState("") // error show karne ke liye jo backend se aayega

  const handleSignUp=async (e) => {

    e.preventDefault() // Prevent page reload on form submit
    setErr("") // setError ko empty kr denge wapas se

    setLoading(true)

    try {

      let result=await axios.post(`${serverUrl}/api/auth/signup`,{
        name,email,password
      },{withCredentials:true} ); {/* {withCredentials: true} isliye jisse token cookies ke andar easily parse ho*/}

      setUserData(result.data) // backend se jo result aayega

      setLoading(false)

      // navigate("/signin")
      navigate("/customize")

    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      setErr(error.response.data.message) // backend se jo error aayega (eg. Email already exists)
    }
  }

  return (

    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' style={{backgroundImage:`url(${bg})`}} >

      <form className='w-[90%] h-[600px] max-w-[500px] bg-[#00000062] backdrop-blur shadow-lg shadow-black
       flex flex-col items-center justify-center gap-[20px] px-[20px]' onSubmit={handleSignUp}>

        <h1 className='text-white text-[30px] font-semibold mb-[30px]'>
          Register to <span className='text-blue-400'>Virtual Assistant</span>
        </h1>

        <input type="text" placeholder='Enter your Name' className='w-full h-[60px] outline-none border-2 border-white
        bg-transparent  text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
        required onChange={(e)=>setName(e.target.value)} value={name}/>

        <input type="email" placeholder='Email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent
        text-white placeholder-gray-300 px-[20px] py-[10px] rounded-full text-[18px]'
        required onChange={(e)=>setEmail(e.target.value)} value={email}/>

        <div className='w-full h-[60px] border-2 border-white bg-transparent  text-white rounded-full text-[18px] relative'>

          <input type={showPassword?"text":"password"} placeholder='password' className='w-full h-full rounded-full outline-none
          bg-transparent placeholder-gray-300 px-[20px] py-[10px]'
          required onChange={(e)=>setPassword(e.target.value)} value={password}/>

          {!showPassword && <IoEye className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer'
          onClick={()=>setShowPassword(true)}/>} {/* jab showPassword false hoga to ye dikhega*/}
          {showPassword && <IoEyeOff className='absolute top-[18px] right-[20px] w-[25px] h-[25px] text-[white] cursor-pointer'
          onClick={()=>setShowPassword(false)}/>} {/* jab showPassword true hoga to ye dikhega*/}
          
        </div>

        {err.length>0 && <p className='text-red-500 text-[17px]'>
          *{err}
          </p>
        }

        <button className='min-w-[150px] h-[60px] mt-[30px] text-black font-semibold  bg-white rounded-full text-[19px] '
         disabled={loading}>
          {loading?"Loading...":"Sign Up"}
        </button>
        
        <p className='text-white mt-[20px] text-[18px]'>Already have an account? <span className='text-blue-400 cursor-pointer' 
        onClick={() => navigate('/signin')}>Login</span></p>

      </form>
    </div>
  )
}

export default SignUp
