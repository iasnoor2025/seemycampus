import { db } from "@/db"
import { employees } from "@/db/schema"
import { eq } from "drizzle-orm"

/**
 * Check if employee session is valid
 * Returns true if employee can use the app, false if they were logged out by admin
 */
export async function isEmployeeSessionValid(employeeId: string): Promise<boolean> {
  try {
    const employee = await db
      .select({
        lastLogin: employees.lastLogin,
        lastLogout: employees.lastLogout,
        isActive: employees.isActive,
      })
      .from(employees)
      .where(eq(employees.employeeId, employeeId))
      .limit(1)

    if (employee.length === 0) {
      return false
    }

    const emp = employee[0]

    // Employee must be active
    if (!emp.isActive) {
      return false
    }

    // If lastLogout exists and is after lastLogin, session is invalid
    if (emp.lastLogout && emp.lastLogin) {
      // Session is valid only if lastLogin is after lastLogout
      return emp.lastLogin > emp.lastLogout
    }

    // If lastLogout exists but no lastLogin, session is invalid
    if (emp.lastLogout && !emp.lastLogin) {
      return false
    }

    // Session is valid
    return true
  } catch (error) {
    console.error("Error checking employee session:", error)
    return false
  }
}

/**
 * Check if employee session is valid by employee ID (database ID)
 */
export async function isEmployeeSessionValidById(id: number): Promise<boolean> {
  try {
    const employee = await db
      .select({
        lastLogin: employees.lastLogin,
        lastLogout: employees.lastLogout,
        isActive: employees.isActive,
      })
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1)

    if (employee.length === 0) {
      return false
    }

    const emp = employee[0]

    // Employee must be active
    if (!emp.isActive) {
      return false
    }

    // If lastLogout exists and is after lastLogin, session is invalid
    if (emp.lastLogout && emp.lastLogin) {
      // Session is valid only if lastLogin is after lastLogout
      return emp.lastLogin > emp.lastLogout
    }

    // If lastLogout exists but no lastLogin, session is invalid
    if (emp.lastLogout && !emp.lastLogin) {
      return false
    }

    // Session is valid
    return true
  } catch (error) {
    console.error("Error checking employee session:", error)
    return false
  }
}
