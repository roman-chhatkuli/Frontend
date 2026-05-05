import { useMemo, useState, type ChangeEvent, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { BookOpen, LogOut, Pencil, Plus, Search, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

import { createStudent, deleteStudent, fetchStudents, updateStudent } from "@/api/student.api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/context/authContext"

export interface Student {
  id: number
  name: string
  email: string
  age: number
  course: string
  gpa: number
  year: string
}

const BASE_URL = import.meta.env.VITE_BASE_URL

const studentSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .regex(/^[A-Za-z][A-Za-z0-9\s]*$/, "Name must start with a letter and can contain letters, numbers, and spaces"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be greater than 0"),
  course: z.string().min(1, "Course is required"),
  gpa: z.number().min(0, "GPA must be at least 0").max(4, "GPA must be at most 4"),
  year: z.string().min(1, "Year is required"),
})

const initialStudent: Student = {
  id: 0,
  name: "",
  email: "",
  age: 0,
  course: "",
  gpa: 0,
  year: "",
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="dashboard-stat-card">
      <p className="dashboard-stat-card__label">{label}</p>
      <p className="dashboard-stat-card__value">{value}</p>
      <p className="dashboard-stat-card__note">{note}</p>
    </article>
  )
}

export default function App() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { setUser, user } = useAuth()

  const [student, setStudent] = useState<Student>(initialStudent)
  const [isEdit, setIsEdit] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [yearFilter, setYearFilter] = useState("all")

  const { data: students = [], error, isLoading } = useQuery<Student[]>({
    queryKey: ["students"],
    queryFn: fetchStudents,
  })

  const updateMutation = useMutation({
    mutationFn: updateStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setIsEdit(false)
      setIsDialogOpen(false)
      setStudent(initialStudent)
      toast.success("Student updated successfully")
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message)
    },
  })

  const createMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      setIsDialogOpen(false)
      setStudent(initialStudent)
      toast.success("Student added successfully")
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      toast.success("Student deleted successfully")
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message)
    },
  })

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return students.filter((item) => {
      const matchesSearch =
        query.length === 0 ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.course.toLowerCase().includes(query)

      const matchesYear = yearFilter === "all" || item.year === yearFilter

      return matchesSearch && matchesYear
    })
  }, [searchQuery, students, yearFilter])

  const yearOptions = useMemo(
    () => ["all", ...Array.from(new Set(students.map((item) => item.year).filter(Boolean)))],
    [students],
  )

  const averageGpa = students.length
    ? (students.reduce((sum, item) => sum + item.gpa, 0) / students.length).toFixed(2)
    : "0.00"

  const pendingSave = createMutation.isPending || updateMutation.isPending

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const { id, value, type } = e.target

    const newValue = type === "number" ? (value === "" ? 0 : Number(value)) : value

    setStudent((prevStudent) => ({
      ...prevStudent,
      [id]: newValue,
    }))
  }

  function resetDialogState() {
    setStudent(initialStudent)
    setIsEdit(false)
  }

  function openCreateDialog() {
    resetDialogState()
    setIsDialogOpen(true)
  }

  function handleEdit(selectedStudent: Student) {
    setStudent(selectedStudent)
    setIsEdit(true)
    setIsDialogOpen(true)
  }

  function handleDialogChange(open: boolean) {
    setIsDialogOpen(open)
    if (!open) {
      resetDialogState()
    }
  }

  function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = studentSchema.safeParse(student)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    if (isEdit) {
      updateMutation.mutate(student)
      return
    }

    createMutation.mutate(student)
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id)
  }

  async function handleLogout() {
    try {
      const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)
      navigate("/login", { replace: true })
    } catch (logoutError) {
      console.error(logoutError)
      toast.error("Could not log out. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <main className="dashboard-shell dashboard-shell--centered">
        <section className="dashboard-loading-card" aria-live="polite">
          <p className="dashboard-loading-card__eyebrow">Loading workspace</p>
          <h1>Preparing student records...</h1>
          <p>We are fetching the latest roster so the dashboard opens with current data.</p>
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="dashboard-shell dashboard-shell--centered">
        <section className="dashboard-loading-card" aria-live="assertive">
          <p className="dashboard-loading-card__eyebrow">Connection issue</p>
          <h1>We could not load student records</h1>
          <p>{error.message}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-hero">
        <div className="dashboard-hero__copy">
          <p className="dashboard-hero__eyebrow">Student management workspace</p>
          <h1>Keep roster updates clear, fast, and easy to act on.</h1>
          <p className="dashboard-hero__body">
            Search records, review academic signals, and add or update students without losing context.
          </p>
          <div className="dashboard-hero__meta" aria-live="polite">
            <span>Signed in as {user ?? "Team member"}</span>
            <span>{filteredStudents.length} visible record{filteredStudents.length === 1 ? "" : "s"}</span>
          </div>
        </div>

        <div className="dashboard-hero__actions">
          <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>
              <Button className="dashboard-primary-button" onClick={openCreateDialog}>
                <Plus className="size-4" />
                Add student
              </Button>
            </DialogTrigger>

            <DialogContent className="border-white/10 bg-[#111111] text-white sm:max-w-[640px]">
              <DialogHeader>
                <DialogTitle className="text-2xl">{isEdit ? "Edit student" : "Add student"}</DialogTitle>
                <DialogDescription className="text-white/65">
                  Capture the core academic details so the roster stays accurate and easy to scan.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleFormSubmit} className="space-y-5 pt-4">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90">Name</Label>
                    <Input id="name" value={student.name} onChange={handleInputChange} className="auth-input" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input id="email" type="email" value={student.email} onChange={handleInputChange} className="auth-input" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-white/90">Age</Label>
                    <Input id="age" type="number" value={student.age || ""} onChange={handleInputChange} className="auth-input" min="16" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-white/90">Year</Label>
                    <Input id="year" value={student.year} onChange={handleInputChange} className="auth-input" placeholder="Freshman" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-white/90">Course</Label>
                    <Input id="course" value={student.course} onChange={handleInputChange} className="auth-input" placeholder="Computer Science" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpa" className="text-white/90">GPA</Label>
                    <Input id="gpa" type="number" step="0.01" value={student.gpa || ""} onChange={handleInputChange} className="auth-input" min="0" max="4" required />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={pendingSave} className="dashboard-primary-button w-full sm:w-auto">
                    {pendingSave ? "Saving..." : isEdit ? "Save changes" : "Save student"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="dashboard-secondary-button" onClick={handleLogout}>
            <LogOut className="size-4" />
            Log out
          </Button>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Roster summary">
        <StatCard label="Total students" value={String(students.length)} note="Current records in the system" />
        <StatCard label="Visible now" value={String(filteredStudents.length)} note="After search and year filters" />
        <StatCard label="Average GPA" value={averageGpa} note="Based on the full current roster" />
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel__toolbar">
          <div>
            <p className="dashboard-panel__eyebrow">Roster</p>
            <h2>Student records</h2>
          </div>

          <div className="dashboard-filters">
            <label className="dashboard-search" htmlFor="student-search">
              <Search className="size-4" />
              <Input
                id="student-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or course"
                className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </label>

            <label className="dashboard-select-wrap" htmlFor="year-filter">
              <span className="sr-only">Filter by year</span>
              <select
                id="year-filter"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="dashboard-select"
              >
                {yearOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "All years" : option}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="dashboard-empty-state" aria-live="polite">
            <Users className="size-8" />
            <h3>No student records match the current view</h3>
            <p>Try a different search term, change the year filter, or add a new student to begin building the roster.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>GPA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="dashboard-student-cell">
                      <p className="dashboard-student-cell__name">{item.name}</p>
                      <p className="dashboard-student-cell__email">{item.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="dashboard-tag">
                      <BookOpen className="size-3.5" />
                      {item.course}
                    </span>
                  </TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell>{item.age}</TableCell>
                  <TableCell>{item.gpa.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="dashboard-row-actions">
                      <Button variant="outline" className="dashboard-table-button" onClick={() => handleEdit(item)}>
                        <Pencil className="size-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        className="dashboard-delete-button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </main>
  )
}
