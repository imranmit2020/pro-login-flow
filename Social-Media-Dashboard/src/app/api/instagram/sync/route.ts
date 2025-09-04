import { NextRequest, NextResponse } from 'next/server';
import { instagramSyncService } from '@/lib/instagramSyncService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, accessToken, instagramBusinessAccountId, pageId, intervalMs } = body;

    switch (action) {
      case 'start':
        if (!accessToken || !instagramBusinessAccountId) {
          return NextResponse.json({
            success: false,
            error: 'Missing required parameters: accessToken and instagramBusinessAccountId'
          }, { status: 400 });
        }

        // Initialize the service
        instagramSyncService.initialize(accessToken, instagramBusinessAccountId, false, pageId);
        
        // Start syncing
        instagramSyncService.startSync(intervalMs || 30000);

        return NextResponse.json({
          success: true,
          message: 'Instagram sync started successfully',
          status: instagramSyncService.getSyncStatus()
        });

      case 'stop':
        instagramSyncService.stopSync();
        return NextResponse.json({
          success: true,
          message: 'Instagram sync stopped successfully',
          status: instagramSyncService.getSyncStatus()
        });

      case 'sync':
        await instagramSyncService.syncMessages();
        return NextResponse.json({
          success: true,
          message: 'Manual Instagram sync completed successfully',
          status: instagramSyncService.getSyncStatus()
        });

      case 'status':
        return NextResponse.json({
          success: true,
          status: instagramSyncService.getSyncStatus()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: start, stop, sync, or status'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Instagram sync API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      status: instagramSyncService.getSyncStatus()
    });
  } catch (error) {
    console.error('Instagram sync status error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 