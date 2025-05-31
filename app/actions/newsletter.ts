"use server"

import { z } from "zod"

const newsletterSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
})

type NewsletterFormData = z.infer<typeof newsletterSchema>

export async function subscribeToNewsletter(data: NewsletterFormData) {
  try {
    // Validate the data
    const validatedData = newsletterSchema.parse(data)

    // EmailOctopus API integration
    const listId = "a9951d02-3dcc-11f0-93e0-4d8f679dcc28" // Your actual EmailOctopus list ID
    const apiKey = process.env.EMAILOCTOPUS_API_KEY

    if (!apiKey) {
      throw new Error("EmailOctopus API key not configured")
    }

    // Add subscriber to EmailOctopus with name fields
    const response = await fetch(`https://emailoctopus.com/api/1.6/lists/${listId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        email_address: validatedData.email,
        fields: {
          FirstName: validatedData.firstName,
          LastName: validatedData.lastName,
        },
        tags: ["portfolio-newsletter", "website-signup"],
        status: "SUBSCRIBED",
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle specific EmailOctopus errors
      if (result.error && result.error.code === "MEMBER_EXISTS_WITH_EMAIL_ADDRESS") {
        return {
          success: false,
          message: "This email is already subscribed to our newsletter.",
        }
      }

      throw new Error(result.error?.message || "Failed to subscribe to newsletter")
    }

    // Log successful subscription with name
    console.log("Newsletter subscription successful:", {
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      contactId: result.id,
      timestamp: new Date().toISOString(),
      source: "portfolio-footer",
    })

    return {
      success: true,
      message: "Successfully subscribed to newsletter",
      contactId: result.id,
    }
  } catch (error) {
    console.error("Newsletter subscription error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Please check all fields and try again",
        errors: error.errors,
      }
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return {
        success: false,
        message: "Network error. Please check your connection and try again.",
      }
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to subscribe. Please try again.",
    }
  }
}
