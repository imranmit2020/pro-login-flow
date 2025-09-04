import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Current password and new password are required'
      }, { status: 400 });
    }

    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the current user's password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({
        success: false,
        error: 'Current password is incorrect'
      }, { status: 400 });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update the password in the database
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedNewPassword })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({
        success: false,
        error: 'Failed to update password'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Error in change password:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred while changing password'
    }, { status: 500 });
  }
} 