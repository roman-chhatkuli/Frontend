import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function fetchUser(){
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/profile`, {
          credentials: 'include'
        })
        const data = await response.json()
        console.log(data)
        setUser(data.email)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])


  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
  { children }
  </AuthContext.Provider>
  )

}

export const useAuth = () => useContext(AuthContext)