'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmployeeTable } from '@/components/employees/employee-table'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    fetch('/api/employees')
      .then((res) => res.json())
      .then(setEmployees)
  }, [])

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">社員一覧</h1>
        <Link href="/employees/new">
          <Button>+ 社員登録</Button>
        </Link>
      </div>
      <EmployeeTable employees={employees} />
    </div>
  )
}
