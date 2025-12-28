/**
 * Email notification utilities
 * Foundation for marketing automation
 */

interface EmailTemplate {
  subject: string
  body: string
  type: "welcome" | "follow-up" | "reminder" | "conversion" | "custom"
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    type: "welcome",
    subject: "Welcome to SeeMyCampus - Your College Search Journey Starts Here!",
    body: `Hi {{name}},

Welcome to SeeMyCampus! We're excited to help you find your perfect college match.

Based on your preferences, we've found some great colleges that might interest you. You can:
- Browse our comprehensive college database
- Use our AI chatbot for instant guidance
- Compare colleges side-by-side
- Track important admission deadlines

Get started: {{baseUrl}}

Best regards,
The SeeMyCampus Team`,
  },
  followUp: {
    type: "follow-up",
    subject: "Continue Your College Search with SeeMyCampus",
    body: `Hi {{name}},

We noticed you started exploring colleges on SeeMyCampus. Don't miss out on finding your perfect match!

Here are some colleges you might like:
{{collegeSuggestions}}

You can also:
- Take our quiz for personalized recommendations
- Use our fee calculator to plan your budget
- Check out available scholarships

Continue your search: {{baseUrl}}

Best regards,
The SeeMyCampus Team`,
  },
  reminder: {
    type: "reminder",
    subject: "Important: Admission Deadline Approaching",
    body: `Hi {{name}},

This is a reminder that the admission deadline for {{examName}} is approaching!

Registration Deadline: {{deadline}}

Don't miss this opportunity. Visit the official website to register:
{{officialWebsite}}

View all important dates: {{baseUrl}}/entrance-exams

Best regards,
The SeeMyCampus Team`,
  },
  conversion: {
    type: "conversion",
    subject: "Congratulations on Your College Decision!",
    body: `Hi {{name}},

Congratulations on taking the next step in your educational journey!

We're here to support you throughout the admission process. If you need any assistance with:
- Application forms
- Document preparation
- Scholarship applications
- Counseling sessions

Please don't hesitate to reach out to us.

Book a counseling session: {{baseUrl}}/career-counseling

Best regards,
The SeeMyCampus Team`,
  },
}

/**
 * Replace template variables with actual values
 */
export function renderEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject
  let body = template.body

  // Replace all variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    subject = subject.replace(regex, value)
    body = body.replace(regex, value)
  })

  return { subject, body }
}

/**
 * Get email template by type
 */
export function getEmailTemplate(type: string): EmailTemplate | null {
  return emailTemplates[type] || null
}

/**
 * Prepare email data for sending
 */
export interface EmailData {
  to: string
  subject: string
  body: string
  name?: string
}

export function prepareEmail(
  templateType: string,
  recipientEmail: string,
  recipientName: string,
  variables: Record<string, string> = {}
): EmailData | null {
  const template = getEmailTemplate(templateType)
  if (!template) return null

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://seemycampus.com"
  const allVariables = {
    name: recipientName,
    email: recipientEmail,
    baseUrl,
    ...variables,
  }

  const { subject, body } = renderEmailTemplate(template, allVariables)

  return {
    to: recipientEmail,
    subject,
    body,
    name: recipientName,
  }
}

