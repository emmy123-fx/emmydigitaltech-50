"use server"

import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  subject: z.string().min(5).max(100),
  message: z.string().min(10).max(1000),
})

type ContactFormData = z.infer<typeof contactSchema>

export async function submitContactForm(data: ContactFormData) {
  try {
    // Validate the data
    const validatedData = contactSchema.parse(data)

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Here you would typically:
    // 1. Send an email using a service like Resend, SendGrid, or Nodemailer
    // 2. Save to a database
    // 3. Send to a CRM or notification service

    // Example email sending logic (commented out):
    /*
    const emailResult = await sendEmail({
      to: "your.email@example.com",
      from: validatedData.email,
      subject: `Portfolio Contact: ${validatedData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Subject:</strong> ${validatedData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
      `,
    })
    */

    // Log the submission (in production, you'd want proper logging)
    console.log("Contact form submission:", {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      timestamp: new Date().toISOString(),
    })

    // Simulate occasional failures for demo purposes
    if (Math.random() < 0.1) {
      throw new Error("Simulated server error")
    }

    return {
      success: true,
      message: "Message sent successfully",
    }
  } catch (error) {
    console.error("Contact form error:", error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Invalid form data",
        errors: error.errors,
      }
    }

    return {
      success: false,
      message: "Failed to send message. Please try again.",
    }
  }
}
