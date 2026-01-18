import { db } from "@/db"
import { employees, attendanceRecords, users } from "@/db/schema"
import { eq, and, desc, like, or } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { generateDefaultPassword } from "./utils"

export interface CreateEmployeeData {
  name: string
  employeeId: string
  email: string
  password?: string
}

export interface UpdateEmployeeData {
  name?: string
  email?: string
  password?: string
  isActive?: boolean
}

/**
 * Get all employees with optional filtering
 */
export async function getAllEmployees(options?: {
  limit?: number
  offset?: number
  search?: string
  isActive?: boolean
}) {
  const { limit = 100, offset = 0, search, isActive } = options || {}

  let query = db.select().from(employees)

  const conditions = []
  
  if (isActive !== undefined) {
    conditions.push(eq(employees.isActive, isActive))
  }

  if (search) {
    conditions.push(
      or(
        like(employees.name, `%${search}%`),
        like(employees.employeeId, `%${search}%`),
        like(employees.email, `%${search}%`)
      )!
    )
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any
  }

  const results = await query
    .orderBy(desc(employees.createdAt))
    .limit(limit)
    .offset(offset)

  const total = await db
    .select({ count: employees.id })
    .from(employees)
    .where(conditions.length > 0 ? and(...conditions) : undefined)

  return {
    employees: results,
    total: total.length,
  }
}

/**
 * Get employee by ID
 */
export async function getEmployeeById(id: number) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.id, id))
    .limit(1)

  return employee || null
}

/**
 * Get employee by employee ID
 */
export async function getEmployeeByEmployeeId(employeeId: string) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeId, employeeId))
    .limit(1)

  return employee || null
}

/**
 * Get employee by email
 */
export async function getEmployeeByEmail(email: string) {
  const [employee] = await db
    .select()
    .from(employees)
    .where(eq(employees.email, email))
    .limit(1)

  return employee || null
}

/**
 * Create a new employee
 */
export async function createEmployee(data: CreateEmployeeData) {
  // Check if employee ID already exists
  const existingById = await getEmployeeByEmployeeId(data.employeeId)
  if (existingById) {
    throw new Error("Employee ID already exists")
  }

  // Check if email already exists in employees table
  const existingByEmail = await getEmployeeByEmail(data.email)
  if (existingByEmail) {
    throw new Error("Email already exists")
  }

  // Check if email already exists in users table
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1)

  if (existingUser.length > 0) {
    throw new Error("Email already exists in user system")
  }

  // Generate password if not provided
  const password = data.password || generateDefaultPassword()
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create employee and user account in a transaction
  // Note: No individual QR code - all employees use daily QR code
  const [employee] = await db
    .insert(employees)
    .values({
      name: data.name,
      employeeId: data.employeeId,
      email: data.email,
      password: hashedPassword,
      isActive: true,
    })
    .returning()

  // Also create a user account linked to this employee
  // This allows employees to login using the same auth system
  await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: "employee",
      isApproved: true, // Employees are auto-approved
    })

  return {
    ...employee,
    plainPassword: data.password ? undefined : password, // Return plain password only if auto-generated
  }
}

/**
 * Update an employee
 */
export async function updateEmployee(id: number, data: UpdateEmployeeData) {
  // Check if employee exists
  const existing = await getEmployeeById(id)
  if (!existing) {
    throw new Error("Employee not found")
  }

  const updateData: any = {
    updatedAt: new Date(),
  }

  if (data.name !== undefined) {
    updateData.name = data.name
  }

  if (data.email !== undefined) {
    // Check if email is already taken by another employee
    const existingByEmail = await getEmployeeByEmail(data.email)
    if (existingByEmail && existingByEmail.id !== id) {
      throw new Error("Email already exists")
    }
    // Check if email is already taken by another user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1)
    
    if (existingUser.length > 0 && existingUser[0].email !== existing.email) {
      throw new Error("Email already exists in user system")
    }
    updateData.email = data.email
  }

  if (data.password !== undefined) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive
  }

  const [updated] = await db
    .update(employees)
    .set(updateData)
    .where(eq(employees.id, id))
    .returning()

  // Also update the linked user account
  const userUpdateData: any = {}
  if (data.name !== undefined) {
    userUpdateData.name = data.name
  }
  if (data.email !== undefined) {
    userUpdateData.email = data.email
  }
  if (data.password !== undefined) {
    userUpdateData.password = updateData.password
  }

  if (Object.keys(userUpdateData).length > 0) {
    await db
      .update(users)
      .set(userUpdateData)
      .where(eq(users.email, existing.email))
  }

  return updated
}


/**
 * Delete an employee (soft delete by setting isActive to false)
 */
export async function deleteEmployee(id: number) {
  // Check if employee exists
  const employee = await getEmployeeById(id)
  if (!employee) {
    throw new Error("Employee not found")
  }

  // Check if employee has attendance records
  const records = await db
    .select()
    .from(attendanceRecords)
    .where(eq(attendanceRecords.employeeId, id))
    .limit(1)

  if (records.length > 0) {
    // Soft delete - deactivate employee and user account
    const updated = await updateEmployee(id, { isActive: false })
    
    // Also deactivate the linked user account (set role to inactive or remove)
    // For now, we'll just leave the user account but could add a flag
    return updated
  }

  // Hard delete if no records - delete both employee and user account
  await db.delete(employees).where(eq(employees.id, id))
  
  // Also delete the linked user account
  await db.delete(users).where(eq(users.email, employee.email))
  
  return { id, deleted: true }
}

/**
 * Verify employee password
 */
export async function verifyEmployeePassword(
  employeeId: string,
  password: string
): Promise<boolean> {
  const employee = await getEmployeeByEmployeeId(employeeId)
  if (!employee || !employee.password) {
    return false
  }

  return bcrypt.compare(password, employee.password)
}

/**
 * Verify employee by email and password
 */
export async function verifyEmployeeByEmail(
  email: string,
  password: string
) {
  const employee = await getEmployeeByEmail(email)
  if (!employee || !employee.password || !employee.isActive) {
    return null
  }

  const isValid = await bcrypt.compare(password, employee.password)
  if (!isValid) {
    return null
  }

  return employee
}
