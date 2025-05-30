import { NextResponse } from "next/server"
import { getAgentLogs, initializeDatabase } from "@/lib/memory"

// Initialize database on first request
let initialized = false

export async function GET() {
  try {
    if (!initialized) {
      await initializeDatabase()
      initialized = true
    }

    const logs = await getAgentLogs()

    // Ensure logs is always an array
    const logsArray = Array.isArray(logs) ? logs : []

    return NextResponse.json({
      logs: logsArray,
      success: true,
      count: logsArray.length,
    })
  } catch (error) {
    console.error("Logs API error:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve agent logs",
        logs: [],
        success: false,
      },
      { status: 500 },
    )
  }
}
