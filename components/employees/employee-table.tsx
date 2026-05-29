'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteButton } from './delete-button'

type Employee = {
  id: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string | Date
  mailAddress: string
}

export function EmployeeTable({ employees }: { employees: Employee[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>社員番号</TableHead>
          <TableHead>氏名</TableHead>
          <TableHead>部署</TableHead>
          <TableHead>役職</TableHead>
          <TableHead>入社日</TableHead>
          <TableHead>メール</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.id}>
            <TableCell>{emp.employeeId}</TableCell>
            <TableCell>{emp.name}</TableCell>
            <TableCell>{emp.department}</TableCell>
            <TableCell>{emp.position}</TableCell>
            <TableCell>
              {new Date(emp.hireDate).toLocaleDateString('ja-JP')}
            </TableCell>
            <TableCell>{emp.mailAddress}</TableCell>
            <TableCell className="flex gap-2">
              <Link href={`/employees/${emp.id}/edit`}>
                <Button variant="outline" size="sm">編集</Button>
              </Link>
              <DeleteButton id={emp.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
