'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { EmployeeForm } from '@/components/employees/employee-form'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>()
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    fetch(`/api/employees/${id}`)
      .then((res) => res.json())
      .then(setEmployee)
  }, [id])

  if (!employee) return <div className="container mx-auto py-8">読み込み中...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">社員編集</h1>
      <EmployeeForm employee={employee} />
    </div>
  )
}
