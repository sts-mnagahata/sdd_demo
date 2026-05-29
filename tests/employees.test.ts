import { describe, it, expect } from 'vitest'
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../lib/employees'

const sampleEmployee = {
  employeeId: 'EMP001',
  name: '山田太郎',
  department: '開発部',
  position: 'エンジニア',
  hireDate: '2024-04-01',
  mailAddress: 'yamada@example.com',
}

describe('createEmployee', () => {
  it('社員を登録できる', async () => {
    const employee = await createEmployee(sampleEmployee)
    expect(employee.employeeId).toBe('EMP001')
    expect(employee.name).toBe('山田太郎')
    expect(employee.mailAddress).toBe('yamada@example.com')
  })
})

describe('getEmployees', () => {
  it('社員一覧を社員番号順で取得できる', async () => {
    await createEmployee(sampleEmployee)
    await createEmployee({
      employeeId: 'EMP002',
      name: '田中花子',
      department: '営業部',
      position: 'マネージャー',
      hireDate: '2023-04-01',
      mailAddress: 'tanaka@example.com',
    })
    const employees = await getEmployees()
    expect(employees).toHaveLength(2)
    expect(employees[0].employeeId).toBe('EMP001')
  })
})

describe('getEmployee', () => {
  it('IDで社員を1件取得できる', async () => {
    const created = await createEmployee(sampleEmployee)
    const employee = await getEmployee(created.id)
    expect(employee?.name).toBe('山田太郎')
  })

  it('存在しないIDはnullを返す', async () => {
    const employee = await getEmployee(999)
    expect(employee).toBeNull()
  })
})

describe('updateEmployee', () => {
  it('社員情報を更新できる', async () => {
    const created = await createEmployee(sampleEmployee)
    const updated = await updateEmployee(created.id, { department: '営業部' })
    expect(updated.department).toBe('営業部')
  })
})

describe('deleteEmployee', () => {
  it('社員を削除できると一覧から消える', async () => {
    const created = await createEmployee(sampleEmployee)
    await deleteEmployee(created.id)
    const employee = await getEmployee(created.id)
    expect(employee).toBeNull()
  })
})
