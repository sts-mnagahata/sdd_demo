import { NextRequest, NextResponse } from 'next/server'
import { getEmployees, createEmployee } from '@/lib/employees'

export async function GET() {
  try {
    const employees = await getEmployees()
    return NextResponse.json(employees)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employee = await createEmployee(body)
    return NextResponse.json(employee, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
