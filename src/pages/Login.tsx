import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"

import AuthShell from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/authContext"

const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = userSchema.safeParse({ email, password })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Login failed")
        return
      }

      toast.success(data.message || "Login successful")
      setUser(data.user ?? data.email ?? email)
      navigate("/")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Student operations"
      title="A calmer way to manage your student roster"
      description="Log in to review records, update academic details, and keep day-to-day admin work moving without friction."
      asideTitle="Designed for quick decisions"
      asideBody="The interface now leads with the most important actions, keeps forms compact, and reduces the back-and-forth required to manage records."
      highlights={[
        "Fast access to roster updates",
        "Clearer form entry and validation",
        "Search and summary-driven dashboard",
      ]}
    >
      <Card className="auth-card border-white/10 bg-black/35 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3">
          <p className="auth-card__kicker">Welcome back</p>
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            Sign in to continue
          </CardTitle>
          <CardDescription className="max-w-sm text-base text-white/70">
            Use your account to access the student management workspace.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-white/90">
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="auth-input"
                />
              </Field>

              <Field>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor="password" className="text-white/90">
                    Password
                  </FieldLabel>
                  <span className="text-sm text-white/50">Required</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="auth-input"
                />
              </Field>

              <Field>
                <Button type="submit" disabled={loading} className="auth-primary-button w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <FieldDescription className="pt-2 text-center text-white/65">
                  New here?{" "}
                  <Link to="/signup" className="font-medium text-[#f4c97a] underline-offset-4 hover:underline">
                    Create an account
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
