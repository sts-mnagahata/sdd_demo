'use client'

import { EmployeeForm } from '@/components/employees/employee-form'

export default function NewEmployeePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">社員登録</h1>
      <EmployeeForm />
    </div>
  )
}
