import React from 'react'
import Navbar from './components/Navbar'
import {Routes, Route} from "react-router-dom"
import HomePage from './pages/HomePage'
import SignUpPage from './pages/Signup'
import LoginPage from './pages/Login'
import UploadPage from './pages/Upload'
import GamesPage from './pages/Games'
import GameDetail from './pages/GameDetail'
import ProfilePage from './pages/Profile'
import CustomCursor from './components/Cusomcursor'
// import SettingsPage from './pages/SettingsPage'
// import ProfilePage from './pages/ProfilePage'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import {Loader} from "lucide-react" 
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const {authUser,checkAuth,isCheckingAuth}=useAuthStore()
  

  
  
  useEffect(() => {
    checkAuth()
  },[checkAuth])

  if(isCheckingAuth && !authUser){
    return <div className='flex items-center justify-center h-screen'>
      <Loader className="size-10 animate-spin"/>
    </div>
  }
  return (
    <div >
      {authUser && <Navbar/>}

      <Routes>
        <Route path="/" element={authUser?<HomePage/>:<Navigate to="/login"/>}/>
        <Route path="/signup" element={!authUser?<SignUpPage/>:<Navigate to="/"/>}/>
        <Route path="/login" element={!authUser?<LoginPage/>:<Navigate to="/"/>}/>
        <Route path="/upload" element={<UploadPage/>}/>
        <Route path="/games" element={<GamesPage/>}/>
        <Route path="/game/:id" element={<GameDetail/>}/>
        <Route path="/profile" element={authUser?<ProfilePage/>:<Navigate to="/login"/>}/>
      </Routes>
      <CustomCursor/>
      <Toaster/>
    </div>

  )
}
