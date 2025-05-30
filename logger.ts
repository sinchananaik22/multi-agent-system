"use server"

import { sql } from "@vercel/postgres"
import { v4 as uuidv4 } from "uuid"

// Log agent activity
export async function logAgentActivity(agent: string, action: string, details: string) {
  try {
    const id = uuidv4()

    await sql`
      INSERT INTO agent_logs (id, agent, action, details)
      VALUES (${id}, ${agent}, ${action}, ${details})
    `

    return { success: true, id }
  } catch (error) {
    console.error("Failed to log agent activity:", error)
    return { success: false, error }
  }
}

// Get agent logs
export async function getAgentLogs(limit = 50) {
  try {
    const result = await sql`
      SELECT id, agent, action, details, timestamp
      FROM agent_logs
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `

    return result.rows
  } catch (error) {
    console.error("Failed to get agent logs:", error)
    throw new Error("Failed to retrieve agent logs")
  }
}
