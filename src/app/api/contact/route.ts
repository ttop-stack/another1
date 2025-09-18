import { NextRequest, NextResponse } from 'next/server';

// This will be available when deployed to Cloudflare Pages
interface Env {
  DB: D1Database;
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, comment } = await request.json();

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

    // Get the D1 database binding (available in Cloudflare Pages)
    const env = process.env as unknown as Env;
    
    if (!env.DB) {
      // For local development, return success without storing
      console.log('Local development - Contact form submission:', { name, email, comment });
      return NextResponse.json(
        { message: 'Contact form submitted successfully (local dev)' },
        { status: 200 }
      );
    }

    // Insert into D1 database
    const result = await env.DB.prepare(
      'INSERT INTO contacts (name, email, comment) VALUES (?, ?, ?)'
    ).bind(name, email, comment).run();

    if (result.success) {
      return NextResponse.json(
        { message: 'Contact form submitted successfully' },
        { status: 200 }
      );
    } else {
      throw new Error('Database insertion failed');
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}