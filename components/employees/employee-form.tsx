'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Employee = {
  id?: number
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export function EmployeeForm({ employee }: { employee?: Employee }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Employee>({
    employeeId: employee?.employeeId ?? '',
    name: employee?.name ?? '',
    department: employee?.department ?? '',
    position: employee?.position ?? '',
    hireDate: employee?.hireDate
      ? new Date(employee.hireDate).toISOString().split('T')[0]
      : '',
    mailAddress: employee?.mailAddress ?? '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const url = employee?.id ? `/api/employees/${employee.id}` : '/api/employees'
    const method = employee?.id ? 'PUT' : 'POST'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/employees')
    router.refresh()
  }

  const fields: { key: keyof Employee; label: string; type?: string }[] = [
    { key: 'employeeId', label: '社員番号' },
    { key: 'name', label: '氏名' },
    { key: 'department', label: '部署' },
    { key: 'position', label: '役職' },
    { key: 'hireDate', label: '入社日', type: 'date' },
    { key: 'mailAddress', label: 'メールアドレス', type: 'email' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {fields.map(({ key, label, type = 'text' }) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={key}>{label}</Label>
          <Input
            id={key}
            type={type}
            required
            value={form[key] as string}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        </div>
      ))}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {employee?.id ? '更新する' : '登録する'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          キャンセル
        </Button>
      </div>
    </form>
  )
}
