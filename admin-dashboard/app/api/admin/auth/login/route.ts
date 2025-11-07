import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateToken, verifyPassword } from '@/lib/auth';

interface LoginRequest {
  email: string;
  password: string;
}

interface Admin {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'admin' | 'moderator';
  status: string;
}

/**
 * Admin Login API
 *
 * Authenticates admin/moderator and returns JWT token
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    const admin = await db.oneOrNone<Admin>(
      `SELECT id, email, password_hash, name, role, status
       FROM admins
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is inactive or blocked' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, admin.password_hash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await db.none(
      `UPDATE admins
       SET last_login_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [admin.id]
    );

    // Log login action
    await db.none(
      `INSERT INTO admin_actions (admin_id, action_type, details)
       VALUES ($1, 'login', $2)`,
      [admin.id, JSON.stringify({ ip: request.ip || 'unknown' })]
    );

    // Generate JWT token
    const token = await generateToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    // Set HTTP-only cookie for security
    response.cookies.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
