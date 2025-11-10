import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import * as z from "zod"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/authContext"

export interface Student {
  id: number;
  name: string;
  email: string;
  age: number;
  course: string;
  gpa: number;
  year: string;
}

const studentSchema = z.object({
  name: z.string().min(1, "Name is required")
    .regex(/^[A-Za-z][A-Za-z0-9\s]*$/, "Name must start with a letter and can contain letters, numbers, and spaces"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(1, "Age must be greater than 0"),
  course: z.string().min(1, "Course is required"),
  gpa: z.number().min(0, "GPA must be at least 0").max(4, "GPA must be at most 4"),
  year: z.string().min(1, "Year is required"),
})


export default function App() {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [data, setData] = useState<Student[] | null>(null);
  const [student, setStudent] = useState<Student>({} as Student)
  const [loading, setLoading] = useState<boolean>(true)
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_BASE_URL

  async function fetchData() {
    const response = await fetch(`${BASE_URL}/student`)
    const data = await response.json()
    setData(data.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;

    const newValue = type === 'number' ? (parseFloat(value) || 0) : value;

    setStudent(prevStudent => ({
      ...prevStudent,
      [id]: newValue
    }));
  };

  function handleEdit(student: Student) {
    setStudent(student)
    setIsEdit(true)
    setIsDialogOpen(true)
  }

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const parsed = studentSchema.safeParse(student)

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    if (isEdit) {
      const response = await fetch(`${BASE_URL}/student/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      })
      setIsEdit(false)
      setIsDialogOpen(false)
      toast.success("Student updated successfully")
    }
    else {
      const response = await fetch(`${BASE_URL}/student`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(student),
      })
      const data = await response.json()
      setIsDialogOpen(false)
      toast.success("Student added successfully")
    }
    setStudent({})
    fetchData()
  }

  async function handleDelete(id: number) {
    const response = await fetch(`${BASE_URL}/student/${id}`, {
      method: "DELETE",
    })
    toast.success("Student deleted successfully")
    fetchData()
  }

  async function handleLogout() {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    })
    if (response.ok) {
      setUser(null)
      navigate("/login", { replace: true })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1>Loading...</h1>
      </div>
    )
  }

  return (
    <div className=" h-screen w-screen p-16">

      <div className="flex justify-end items-center mb-10 px-24 ">
       <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
      </div>

      <div className="flex justify-between items-center mb-10 px-24">
        <h1 className="text-3xl font-bold text-center mb-10">Student Management System</h1>
        <Dialog open={isDialogOpen} onOpenChange={() => {
          setIsDialogOpen(!isDialogOpen)
          setStudent({})
        }}>
          <DialogTrigger asChild className="mr-48">
            <Button>Add Student</Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit" : "Add"} Student</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={student.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={student.email}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="age" className="text-right">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={student.age > 0 ? student.age : ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min="16"
                  required
                />
              </div>


              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">Course</Label>
                <Input
                  id="course"
                  value={student.course}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>


              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gpa" className="text-right">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  value={student.gpa > 0 ? student.gpa : ''}
                  onChange={handleInputChange}
                  className="col-span-3"
                  min="0.0"
                  max="4.0"
                  required
                />
              </div>


              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">Year</Label>
                <Input
                  id="year"
                  type="string"
                  value={student.year}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="submit">Save Student</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>GPA</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          {data.map((item: Student) => { 
            return (
              <TableBody key={item.id}>
                <TableRow>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{item.age}</TableCell>
                  <TableCell>{item.course}</TableCell>
                  <TableCell>{item.gpa}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="destructive"
                    onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button></TableCell>
                </TableRow>
              </TableBody>
            )
          })}
        </Table>
      </div>

    </div>
  );
}