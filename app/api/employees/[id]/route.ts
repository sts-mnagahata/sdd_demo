import { NextRequest, NextResponse } from 'next/server'
import { getEmployee, updateEmployee, deleteEmployee } from '@/lib/employees'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const employee = await getEmployee(Number(id))
    if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const employee = await updateEmployee(Number(id), body)
    return NextResponse.json(employee)
  } catch {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteEmployee(Number(id))
    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
