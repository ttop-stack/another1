import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, comment } = body as { name: string; email: string; comment: string };

    // Validate input
    if (!name || !email || !comment) {
      return NextResponse.json(
        { error: 'Name, email, and comment are required' },
        { status: 400 }
      );
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