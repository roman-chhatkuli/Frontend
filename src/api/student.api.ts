import Student from '../App.tsx'

const BASE_URL = import.meta.env.VITE_BASE_URL

export const fetchStudents = async () => {
  const response = await fetch(`${BASE_URL}/student`)
  const data = await response.json()
  return data
}

export const updateStudent = async (student: Student) => {
  const response = await fetch(`${BASE_URL}/student/${student.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  })

  if(!response.ok) {
    throw new Error("Failed to update student")
  }

  return response.json()
}

export const createStudent = async (student: Student) => {
  const response = await fetch(`${BASE_URL}/student`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  })
  const data = await response.json()
  return data
}


export const deleteStudent = async (id: number) => {
  const response = await fetch(`${BASE_URL}/student/${id}`, {
    method: "DELETE",
  })
  const data = await response.json()
  return data
}
