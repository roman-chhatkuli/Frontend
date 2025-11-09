import App from './App.tsx'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import { useAuth } from './context/authContext.tsx'
import { Loader2 } from "lucide-react";

export default function Router() {
  const { user,loading } = useAuth()


  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader2 size={35} className="text-yellow-500 animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={user ?  <App /> : <Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}