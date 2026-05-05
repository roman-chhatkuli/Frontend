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
  fullName: z.string().min(5, "Full name must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function SignupPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const parsed = userSchema.safeParse({ fullName, email, password })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: fullName, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message || "Signup failed")
        return
      }

      toast.success("Account created successfully")
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
      eyebrow="Guided setup"
      title="Create a workspace account in one step"
      description="Set up your access and move directly into the roster dashboard with a cleaner, more focused onboarding flow."
      asideTitle="Built for smaller admin loops"
      asideBody="We reduce friction by making the next step obvious, keeping password entry compact, and carrying users directly into the dashboard once registration succeeds."
      highlights={[
        "Single-screen account creation",
        "Immediate entry into the dashboard",
        "Clear validation before submission",
      ]}
    >
      <Card className="auth-card border-white/10 bg-black/35 shadow-2xl backdrop-blur-xl">
        <CardHeader className="space-y-3">
          <p className="auth-card__kicker">Create account</p>
          <CardTitle className="text-3xl font-semibold tracking-tight text-white">
            Start managing students
          </CardTitle>
          <CardDescription className="max-w-sm text-base text-white/70">
            Enter a few details below and we will take you straight into the app.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-white/90">
                  Full name
                </FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jordan Lee"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  className="auth-input"
                />
              </Field>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="password" className="text-white/90">
                    Password
                  </FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="auth-input"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password" className="text-white/90">
                    Confirm password
                  </FieldLabel>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="auth-input"
                  />
                </Field>
              </div>

              <FieldDescription className="-mt-2 text-white/55">
                Use at least 6 characters and keep both password fields identical.
              </FieldDescription>

              <Field>
                <Button type="submit" disabled={loading} className="auth-primary-button w-full">
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <FieldDescription className="pt-2 text-center text-white/65">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-[#f4c97a] underline-offset-4 hover:underline">
                    Sign in
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
