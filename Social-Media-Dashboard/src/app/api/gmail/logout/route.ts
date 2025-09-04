import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Successfully logged out from Gmail.',
    });

    // Clear the Gmail tokens from cookies
    response.cookies.delete('gmail_access_token');
    response.cookies.delete('gmail_refresh_token');

    console.log('Gmail logout: Cleared Gmail authentication cookies.');

    return response;
  } catch (error) {
    console.error('Gmail Logout Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout from Gmail' },
      { status: 500 }
    );
  }
} 