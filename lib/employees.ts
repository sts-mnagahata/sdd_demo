import { prisma } from './prisma'

type EmployeeInput = {
  employeeId: string
  name: string
  department: string
  position: string
  hireDate: string
  mailAddress: string
}

export async function getEmployees() {
  return prisma.employee.findMany({
    orderBy: { employeeId: 'asc' },
  })
}

export async function getEmployee(id: number) {
  return prisma.employee.findUnique({ where: { id } })
}

export async function createEmployee(data: EmployeeInput) {
  return prisma.employee.create({
    data: {
      ...data,
      hireDate: new Date(data.hireDate),
    },
  })
}

export async function updateEmployee(id: number, data: Partial<EmployeeInput>) {
  const updateData: Record<string, unknown> = { ...data }
  if (data.hireDate) {
    updateData.hireDate = new Date(data.hireDate)
  }
  return prisma.employee.update({ where: { id }, data: updateData })
}

export async function deleteEmployee(id: number) {
  return prisma.employee.delete({ where: { id } })
}
