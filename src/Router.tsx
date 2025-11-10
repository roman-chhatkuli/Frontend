import App from './App.tsx'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import { useAuth } from './context/authContext.tsx'
import { Loader2 } from "lucide-react";
import { Navigate } from 'react-router-dom';

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
      <Route path="/" element={user ? <App /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />
    </Routes>
  )
}