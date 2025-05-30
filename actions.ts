"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { v4 as uuidv4 } from "uuid"
import { saveToMemory, logAgentActivity } from "./memory"

// Classifier Agent
async function classifierAgent(content: string) {
  try {
    // Detect format and intent using AI
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: {
        type: "object",
        properties: {
          format: {
            type: "string",
            enum: ["JSON", "Email", "PDF", "PlainText"],
            description: "The detected format of the input content",
          },
          intent: {
            type: "string",
            enum: ["Invoice", "RFQ", "Complaint", "Regulation", "Query", "Other"],
            description: "The detected intent of the content",
          },
          confidence: {
            type: "number",
            minimum: 0,
            maximum: 1,
            description: "Confidence score of the classification",
          },
          reasoning: {
            type: "string",
            description: "Explanation for the classification decision",
          },
        },
        required: ["format", "intent", "confidence", "reasoning"],
      },
      prompt: `Analyze the following content and determine its format (JSON, Email, PDF, PlainText) and intent (Invoice, RFQ, Complaint, Regulation, Query, Other).
      
      Content:
      ${content.substring(0, 1500)}
      
      Provide your classification with a confidence score and reasoning.`,
    })

    await logAgentActivity(
      "Classifier",
      "Classification",
      `Detected ${object.format} format with ${object.intent} intent (${Math.round(object.confidence * 100)}% confidence)`,
    )

    return object
  } catch (error) {
    console.error("Classifier agent error:", error)

    // Fallback classification if AI fails
    let format = "PlainText"
    let intent = "Other"

    try {
      JSON.parse(content)
      format = "JSON"
      intent = "Query"
    } catch {
      if (content.toLowerCase().includes("from:") || content.toLowerCase().includes("subject:")) {
        format = "Email"
        intent = "Query"
      }
    }

    await logAgentActivity(
      "Classifier",
      "Fallback Classification",
      `Used fallback classification: ${format} format with ${intent} intent`,
    )

    return {
      format,
      intent,
      confidence: 0.5,
      reasoning: "Fallback classification due to AI service unavailability",
    }
  }
}

// JSON Agent
async function jsonAgent(content: string, memoryId: string) {
  try {
    let jsonData
    try {
      jsonData = JSON.parse(content)
    } catch (e) {
      throw new Error("Invalid JSON format")
    }

    // Process JSON using AI
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: {
        type: "object",
        properties: {
          extractedFields: {
            type: "object",
            description: "Key fields extracted from the JSON",
          },
          missingFields: {
            type: "array",
            items: { type: "string" },
            description: "Fields that appear to be missing but would be expected",
          },
          anomalies: {
            type: "array",
            items: { type: "string" },
            description: "Any anomalies or unusual values detected",
          },
          standardizedFormat: {
            type: "object",
            description: "The JSON reformatted to a standard schema",
          },
        },
        required: ["extractedFields", "missingFields", "anomalies", "standardizedFormat"],
      },
      prompt: `Analyze the following JSON data:
      
      ${JSON.stringify(jsonData, null, 2)}
      
      Extract key fields, identify any missing fields that would typically be expected, detect anomalies, and reformat to a standardized schema.`,
    })

    // Save to shared memory
    await saveToMemory(memoryId, {
      agent: "JSON",
      extractedFields: object.extractedFields,
      standardizedFormat: object.standardizedFormat,
    })

    await logAgentActivity(
      "JSON",
      "Processing",
      `Extracted ${Object.keys(object.extractedFields).length} fields, found ${object.missingFields.length} missing fields and ${object.anomalies.length} anomalies`,
    )

    return object
  } catch (error) {
    console.error("JSON agent error:", error)

    // Fallback processing
    let jsonData
    try {
      jsonData = JSON.parse(content)
    } catch (e) {
      throw new Error("Invalid JSON format")
    }

    const fallbackResult = {
      extractedFields: jsonData,
      missingFields: [],
      anomalies: [],
      standardizedFormat: jsonData,
    }

    await saveToMemory(memoryId, {
      agent: "JSON",
      extractedFields: fallbackResult.extractedFields,
      standardizedFormat: fallbackResult.standardizedFormat,
    })

    await logAgentActivity(
      "JSON",
      "Fallback Processing",
      `Used fallback processing for JSON with ${Object.keys(jsonData).length} fields`,
    )

    return fallbackResult
  }
}

// Email Agent
async function emailAgent(content: string, memoryId: string) {
  try {
    // Process email using AI
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: {
        type: "object",
        properties: {
          sender: {
            type: "string",
            description: "The email sender extracted from the From field",
          },
          recipients: {
            type: "array",
            items: { type: "string" },
            description: "List of recipients",
          },
          subject: {
            type: "string",
            description: "The email subject",
          },
          intent: {
            type: "string",
            enum: ["Inquiry", "RFQ", "Complaint", "Information", "Other"],
            description: "The detected intent of the email",
          },
          urgency: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "The urgency level of the email",
          },
          keyPoints: {
            type: "array",
            items: { type: "string" },
            description: "Key points extracted from the email body",
          },
          crmFormat: {
            type: "object",
            description: "The email formatted for CRM usage",
          },
        },
        required: ["sender", "subject", "intent", "urgency", "keyPoints", "crmFormat"],
      },
      prompt: `Analyze the following email content:
      
      ${content}
      
      Extract the sender, recipients, subject, determine the intent and urgency, identify key points, and format for CRM usage.`,
    })

    // Save to shared memory
    await saveToMemory(memoryId, {
      agent: "Email",
      sender: object.sender,
      subject: object.subject,
      intent: object.intent,
      urgency: object.urgency,
      keyPoints: object.keyPoints,
    })

    await logAgentActivity(
      "Email",
      "Processing",
      `Processed email from ${object.sender} with subject "${object.subject}". Intent: ${object.intent}, Urgency: ${object.urgency}`,
    )

    return object
  } catch (error) {
    console.error("Email agent error:", error)

    // Fallback processing
    const lines = content.split("\n")
    const fromLine = lines.find((line) => line.toLowerCase().startsWith("from:"))
    const subjectLine = lines.find((line) => line.toLowerCase().startsWith("subject:"))

    const fallbackResult = {
      sender: fromLine ? fromLine.substring(5).trim() : "unknown@example.com",
      recipients: ["support@company.com"],
      subject: subjectLine ? subjectLine.substring(8).trim() : "No subject",
      intent: "Other" as const,
      urgency: "medium" as const,
      keyPoints: ["Email content analysis"],
      crmFormat: {
        contactEmail: fromLine ? fromLine.substring(5).trim() : "unknown@example.com",
        category: "General",
        priority: "medium",
        summary: "Email processed with fallback method",
      },
    }

    await saveToMemory(memoryId, {
      agent: "Email",
      sender: fallbackResult.sender,
      subject: fallbackResult.subject,
      intent: fallbackResult.intent,
      urgency: fallbackResult.urgency,
      keyPoints: fallbackResult.keyPoints,
    })

    await logAgentActivity(
      "Email",
      "Fallback Processing",
      `Used fallback processing for email from ${fallbackResult.sender}`,
    )

    return fallbackResult
  }
}

// Main processing function
export async function processInput(content: string) {
  // Generate a unique memory ID for this processing session
  const memoryId = `conversation_${uuidv4().substring(0, 8)}`

  try {
    // Step 1: Classify the input
    const classification = await classifierAgent(content)

    // Save classification to memory
    await saveToMemory(memoryId, {
      timestamp: new Date().toISOString(),
      classification: {
        format: classification.format,
        intent: classification.intent,
        confidence: classification.confidence,
      },
    })

    // Step 2: Route to appropriate agent based on format
    let result
    let routedTo

    if (classification.format === "JSON") {
      result = await jsonAgent(content, memoryId)
      routedTo = "JSONAgent"
    } else if (classification.format === "Email" || classification.format === "PlainText") {
      result = await emailAgent(content, memoryId)
      routedTo = "EmailAgent"
    } else {
      throw new Error(`Unsupported format: ${classification.format}`)
    }

    // Return the final result
    return {
      format: classification.format,
      intent: classification.intent,
      routed_to: routedTo,
      memory_id: memoryId,
      details: result,
    }
  } catch (error: any) {
    console.error("Processing error:", error)
    throw new Error(`Failed to process input: ${error.message}`)
  }
}
