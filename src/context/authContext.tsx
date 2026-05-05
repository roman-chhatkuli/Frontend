import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface AuthContextValue {
  user: string | null
  setUser: (user: string | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      try {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/profile`, {
          credentials: "include",
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        const data = await response.json()
        setUser(data.user?.email ?? data.email ?? null)
      } catch (error) {
        console.error("Error fetching user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
