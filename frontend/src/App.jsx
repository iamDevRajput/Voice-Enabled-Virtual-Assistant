import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize'
import { userDataContext } from './context/UserContext'
import Home from './pages/Home'
import Customize2 from './pages/Customize2'

function App() {

  const {userData,setUserData, authLoading}=useContext(userDataContext)

  if (authLoading) {
    return <div className="w-full h-[100vh] flex justify-center items-center text-white bg-gradient-to-t from-[black] to-[#030353]">Loading...</div>;
  }

  return (
   <>
    <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
    <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home/> :<Navigate to={"/customize"}/>}/>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize/>:<Navigate to={"/signup"}/>}/>
      <Route path='/customize2' element={userData?<Customize2/>:<Navigate to={"/signup"}/>}/>
   </Routes>
   </>
  )
}

export default App

// hum home pe tabhi ja payenga jab user ka data hoga, ya signup/signin and customize karne ke baad
// userData?.assistantImage  && userData?.assistantName : means agar userData me assistantImage and assistantName hai 
// to home pe ja payenge nhi to navigate to customize page

// <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/> : means agar user data nhi h to goto SignUp(/signup) otherwise goto home(/)

// axios package is used to fetch api of signup/login