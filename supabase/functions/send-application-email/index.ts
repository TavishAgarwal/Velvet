import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    const { type, record, old_record } = await req.json()

    // We only care about UPDATE events where the status changed from pending
    if (type !== 'UPDATE' || old_record.status === record.status || old_record.status !== 'pending') {
      return new Response(JSON.stringify({ message: "Not an application status transition" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    if (!RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY")
      return new Response(JSON.stringify({ error: "Missing API Key" }), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      })
    }

    // Since applications table doesn't store email, we might need to fetch the profile or user email
    // But for a webhook, we might have to pass the email in or fetch it via Supabase client.
    // For simplicity, we assume we fetch the email via Supabase admin client.
    // Or we assume the application has an email field (which we added in step 1 if missing).
    // Let's assume we can fetch it via the Supabase admin API or it's in the record.
    const userEmail = record.email // Assuming 'email' is saved in the application table
    
    if (!userEmail) {
      console.error("No email associated with this application")
      return new Response(JSON.stringify({ error: "No email" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      })
    }

    let subject = ""
    let html = ""

    if (record.status === 'approved') {
      subject = "Your Application has been Approved - Welcome to Velvet"
      html = `
        <div style="font-family: sans-serif; background-color: #111; color: #fff; padding: 40px; text-align: center;">
          <h1 style="color: #d4af37;">Welcome to Velvet</h1>
          <p>We are thrilled to let you know that your application has been approved.</p>
          <p>Please log in to the app to complete your onboarding and start exploring the community.</p>
          <a href="velvet://" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #d4af37; color: #000; text-decoration: none; border-radius: 4px; font-weight: bold;">Open App</a>
        </div>
      `
    } else if (record.status === 'declined') {
      subject = "Update on your Velvet Application"
      html = `
        <div style="font-family: sans-serif; background-color: #111; color: #fff; padding: 40px; text-align: center;">
          <h1 style="color: #fff;">Application Update</h1>
          <p>Thank you for taking the time to apply to Velvet.</p>
          <p>At this time, we are unable to offer you a membership. We wish you the best.</p>
        </div>
      `
    } else {
       return new Response(JSON.stringify({ message: "Status is not approved or declined" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Velvet Admissions <admissions@velvetapp.com>",
        to: [userEmail],
        subject: subject,
        html: html,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
