import axios from 'axios'
import React, { createContext, useEffect, useState } from 'react'

export const userDataContext=createContext()

function UserContext({children}) {

    const serverUrl="http://localhost:5001"

    const [userData,setUserData]=useState(null)
    const [authLoading, setAuthLoading] = useState(true)

    const [frontendImage,setFrontendImage]=useState(null)
    const [backendImage,setBackendImage]=useState(null) // yo img aayegi jo backend me store karayenge
    const [selectedImage,setSelectedImage]=useState(null)

    // Function to fetch current logged-in user data from backend
    const handleCurrentUser=async ()=>{
        try {
          const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
          setUserData(result.data)
          console.log(result.data)
        } catch (error) {
          console.log(error)
        } finally {
          setAuthLoading(false)
        }
    }

  const getGeminiResponse=async (command)=>{

    try {

      const result=await axios.post(`${serverUrl}/api/user/asktoassistant`,{command},{withCredentials:true})

      return result.data

    } catch (error) {
      console.log(error)
      return {
        type: "general",
        userInput: command,
        response: error.response?.data?.response || "I encountered a network error while connecting to my brain."
      };
    }
  }

  // useEffect → runs once when the component loads
  // We call handleCurrentUser() inside it to fetch the user automatically on page load

  useEffect(()=>{
    handleCurrentUser()
  }, []) // empty dependency → runs only 1 time (like componentDidMount)

  const value={ serverUrl,userData,setUserData,backendImage,setBackendImage,frontendImage,setFrontendImage,
    selectedImage,setSelectedImage,getGeminiResponse, authLoading }

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  )
}

export default UserContext
