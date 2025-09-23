import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting (for basic protection)
const submissions = new Map<string, number[]>();

// Rate limiting function
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3; // 3 submissions per 15 minutes

  if (!submissions.has(ip)) {
    submissions.set(ip, []);
  }

  const userSubmissions = submissions.get(ip)!;
  // Remove old submissions outside the window
  const recentSubmissions = userSubmissions.filter(time => now - time < windowMs);
  submissions.set(ip, recentSubmissions);

  if (recentSubmissions.length >= maxAttempts) {
    return true; // Rate limited
  }

  // Add current submission
  recentSubmissions.push(now);
  submissions.set(ip, recentSubmissions);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait 15 minutes before trying again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, comment } = body as { 
      name: string; 
      email: string; 
      comment: string; 
    };

    // Validate input
    if (!name || !email || !comment) {
      return NextResponse.json(
        { error: 'Name, email, and comment are required' },
        { status: 400 }
      );
    }

    // Verify Turnstile token if configured
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      const turnstileResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${turnstileSecret}&response=${turnstileToken}&remoteip=${ip}`,
      });

      const turnstileResult = await turnstileResponse.json() as { success: boolean };
      if (!turnstileResult.success) {
        return NextResponse.json(
          { error: 'Security verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Discord webhook URL - should be set as environment variable
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!discordWebhookUrl) {
      console.log('Discord webhook not configured - Contact form submission:', { name, email, comment });
      return NextResponse.json(
        { message: 'Contact form submitted successfully (webhook not configured)' },
        { status: 200 }
      );
    }

    // Create Discord embed message
    const discordPayload = {
      embeds: [
        {
          title: '📧 New Contact Form Submission',
          color: 0x5865F2, // Discord blue color
          fields: [
            {
              name: '👤 Name',
              value: name,
              inline: true
            },
            {
              name: '📧 Email',
              value: email,
              inline: true
            },
            {
              name: '💬 Message',
              value: comment,
              inline: false
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Contact Form Submission'
          }
        }
      ]
    };

    // Send to Discord webhook
    const discordResponse = await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (discordResponse.ok) {
      return NextResponse.json(
        { message: 'Contact form submitted successfully' },
        { status: 200 }
      );
    } else {
      throw new Error(`Discord webhook failed: ${discordResponse.statusText}`);
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}