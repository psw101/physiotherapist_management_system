// import WelcomeTemplate from "@/emails/WelcomeTemplate";
// import {Resend} from "resend";
// import {NextResponse} from "next/server";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST(request: Request) {
//     await resend.emails.send({
//         from: "Acme <onboarding@resend.dev>",
//         to: "pulindusathruwan@gmail.com",
//         subject: "Welcome to our service",
//         react: <WelcomeTemplate name="John Doe"/>
//     })
//     return NextResponse.json({message: "Email sent successfully"});

// }


import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import WelcomeTemplate from "@/emails/WelcomeTemplate";
import OTPTemplate from "@/emails/OTPTemplate";

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Switch to use the gmail service config
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(request: Request) {
  try {
    // Parse request body with better error handling
    let body;
    try {
      const text = await request.text();
      console.log("Raw request body:", text);
      
      if (text.trim().length > 0) {
        body = JSON.parse(text);
      } else {
        body = {};
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body", details: String(parseError) },
        { status: 400 }
      );
    }
    
    const { name, email, template, subject, otp } = body || {};
    
    // Input validation
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    
    // Choose template based on the template parameter
    let emailHtml;
    let emailSubject = subject || "Message from PhysioApp";
    
    if (template === "otp") {
      if (!otp) {
        return NextResponse.json(
          { error: "OTP is required for password reset emails" },
          { status: 400 }
        );
      }
      emailHtml = await render(<OTPTemplate name={name || "User"} otp={otp} />);
      emailSubject = subject || "Your Password Reset Code";
    } else {
      // Default to welcome template
      emailHtml = await render(<WelcomeTemplate name={name || "Patient"} />);
      emailSubject = subject || "Welcome to PhysioApp";
    }
    
    // Send email
    const info = await transporter.sendMail({
      from: `"PhysioApp" <${process.env.EMAIL_USERNAME}>`,
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });
    
    console.log("Message sent: %s", info.messageId);
    
    return NextResponse.json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: String(error) },
      { status: 500 }
    );
  }
}