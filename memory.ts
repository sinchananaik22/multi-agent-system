"use server"

import { v4 as uuidv4 } from "uuid"

// In-memory storage as fallback
const memoryStore: Record<string, any> = {}
let logsStore: Array<{
  id: string
  agent: string
  action: string
  details: string
  timestamp: string
}> = []

// Check if we have database connection
function hasPostgresConnection() {
  return !!(process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_NON_POOLING)
}

// Initialize the database table if it doesn't exist
export async function initializeDatabase() {
  try {
    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      await sql`
        CREATE TABLE IF NOT EXISTS agent_memory (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      await sql`
        CREATE TABLE IF NOT EXISTS agent_logs (
          id TEXT PRIMARY KEY,
          agent TEXT NOT NULL,
          action TEXT NOT NULL,
          details TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      console.log("Database initialized with Postgres")
    } else {
      console.log("Using in-memory storage (no Postgres connection)")
    }
  } catch (error) {
    console.error("Failed to initialize database, falling back to in-memory storage:", error)
  }
}

// Save data to shared memory
export async function saveToMemory(id: string, data: any) {
  try {
    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      // Check if memory entry exists
      const existingEntry = await sql`
        SELECT data FROM agent_memory WHERE id = ${id}
      `

      if (existingEntry.rows.length > 0) {
        // Update existing entry by merging data
        const existingData = existingEntry.rows[0].data
        const mergedData = { ...existingData, ...data }

        await sql`
          UPDATE agent_memory
          SET data = ${JSON.stringify(mergedData)}
          WHERE id = ${id}
        `
      } else {
        // Create new entry
        await sql`
          INSERT INTO agent_memory (id, data)
          VALUES (${id}, ${JSON.stringify(data)})
        `
      }
    } else {
      // Use in-memory storage
      if (memoryStore[id]) {
        memoryStore[id] = { ...memoryStore[id], ...data }
      } else {
        memoryStore[id] = { ...data, created_at: new Date().toISOString() }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Failed to save to memory:", error)
    // Fallback to in-memory even if Postgres fails
    if (memoryStore[id]) {
      memoryStore[id] = { ...memoryStore[id], ...data }
    } else {
      memoryStore[id] = { ...data, created_at: new Date().toISOString() }
    }
    return { success: true }
  }
}

// Get data from shared memory
export async function getFromMemory(id: string) {
  try {
    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      const result = await sql`
        SELECT data FROM agent_memory WHERE id = ${id}
      `

      if (result.rows.length === 0) {
        return null
      }

      return result.rows[0].data
    } else {
      // Use in-memory storage
      return memoryStore[id] || null
    }
  } catch (error) {
    console.error("Failed to get from memory:", error)
    // Fallback to in-memory
    return memoryStore[id] || null
  }
}

// Get all memory entries
export async function getAllMemory() {
  try {
    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      const result = await sql`
        SELECT id, data, created_at
        FROM agent_memory
        ORDER BY created_at DESC
      `

      return result.rows
    } else {
      // Use in-memory storage
      return Object.entries(memoryStore).map(([id, data]) => ({
        id,
        data,
        created_at: data.created_at || new Date().toISOString(),
      }))
    }
  } catch (error) {
    console.error("Failed to get all memory entries:", error)
    // Fallback to in-memory
    return Object.entries(memoryStore).map(([id, data]) => ({
      id,
      data,
      created_at: data.created_at || new Date().toISOString(),
    }))
  }
}

// Log agent activity
export async function logAgentActivity(agent: string, action: string, details: string) {
  try {
    const id = uuidv4()
    const timestamp = new Date().toISOString()

    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      await sql`
        INSERT INTO agent_logs (id, agent, action, details, timestamp)
        VALUES (${id}, ${agent}, ${action}, ${details}, ${timestamp})
      `
    } else {
      // Use in-memory storage
      logsStore.unshift({
        id,
        agent,
        action,
        details,
        timestamp,
      })

      // Keep only the last 100 logs in memory
      if (logsStore.length > 100) {
        logsStore = logsStore.slice(0, 100)
      }
    }

    return { success: true, id }
  } catch (error) {
    console.error("Failed to log agent activity:", error)
    // Fallback to in-memory
    const id = uuidv4()
    const timestamp = new Date().toISOString()

    logsStore.unshift({
      id,
      agent,
      action,
      details,
      timestamp,
    })

    if (logsStore.length > 100) {
      logsStore = logsStore.slice(0, 100)
    }

    return { success: true, id }
  }
}

// Get agent logs
export async function getAgentLogs(limit = 50) {
  try {
    if (hasPostgresConnection()) {
      const { sql } = await import("@vercel/postgres")

      const result = await sql`
        SELECT id, agent, action, details, timestamp
        FROM agent_logs
        ORDER BY timestamp DESC
        LIMIT ${limit}
      `

      return result.rows || []
    } else {
      // Use in-memory storage
      return logsStore.slice(0, limit)
    }
  } catch (error) {
    console.error("Failed to get agent logs:", error)
    // Fallback to in-memory
    return logsStore.slice(0, limit)
  }
}
