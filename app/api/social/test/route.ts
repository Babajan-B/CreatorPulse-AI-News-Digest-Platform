// API Route: Test social media platform connections
import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/lib/social-media-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing social media platform connections...');

    const connectionStatus = await socialMediaService.testConnections();

    return NextResponse.json({
      success: true,
      data: {
        connections: connectionStatus,
        reddit: {
          status: connectionStatus.reddit ? 'connected' : 'failed',
          message: connectionStatus.reddit ? 'Reddit API is working' : 'Reddit API connection failed'
        },
        hackernews: {
          status: connectionStatus.hackernews ? 'connected' : 'failed',
          message: connectionStatus.hackernews ? 'Hacker News RSS is working' : 'Hacker News RSS connection failed'
        },
        lobsters: {
          status: connectionStatus.lobsters ? 'connected' : 'failed',
          message: connectionStatus.lobsters ? 'Lobsters RSS is working' : 'Lobsters RSS connection failed'
        },
        slashdot: {
          status: connectionStatus.slashdot ? 'connected' : 'failed',
          message: connectionStatus.slashdot ? 'Slashdot RSS is working' : 'Slashdot RSS connection failed'
        },
        producthunt: {
          status: connectionStatus.producthunt ? 'connected' : 'failed',
          message: connectionStatus.producthunt ? 'Product Hunt RSS is working' : 'Product Hunt RSS connection failed'
        },
        overall: {
          status: connectionStatus.overall ? 'all_connected' : 'partial_connection',
          message: connectionStatus.overall ? 'All platforms are connected' : 'Some platforms may have connection issues'
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing social media connections:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to test social media connections',
      data: {
        connections: {
          reddit: false,
          hackernews: false,
          lobsters: false,
          slashdot: false,
          producthunt: false,
          overall: false
        },
        reddit: {
          status: 'error',
          message: 'Reddit API test failed'
        },
        hackernews: {
          status: 'error',
          message: 'Hacker News RSS test failed'
        },
        lobsters: {
          status: 'error',
          message: 'Lobsters RSS test failed'
        },
        slashdot: {
          status: 'error',
          message: 'Slashdot RSS test failed'
        },
        producthunt: {
          status: 'error',
          message: 'Product Hunt RSS test failed'
        },
        overall: {
          status: 'error',
          message: 'All platform tests failed'
        }
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
