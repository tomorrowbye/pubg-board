import { NextResponse } from 'next/server';

export const GET = async () => {
  try {
    // Basic health check response
    return NextResponse.json(
      {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
};

// Make route be called every minute to prevent cold starts
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60 seconds