import { NextRequest, NextResponse } from 'next/server';

/**
 * Track Video View - CRITICAL: Implements 2-view limit
 *
 * This endpoint tracks when an employer views a job seeker's video resume.
 * Maximum 2 views allowed per video per employer.
 * After 2 views, the video is permanently deleted/locked.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, applicationId } = body;

    // Get user ID from JWT token (you'll implement auth)
    const userId = 'employer-123'; // TODO: Get from JWT

    // Check current view count from database
    // TODO: Replace with actual database query
    const viewCountQuery = `
      SELECT COUNT(*) as count
      FROM video_views
      WHERE video_id = $1 AND user_id = $2
    `;

    // Mock response for now
    const currentViewCount = 0; // TODO: Get from database

    // Check if limit reached
    if (currentViewCount >= 2) {
      return NextResponse.json(
        { error: 'View limit reached. This video can only be viewed 2 times.' },
        { status: 403 }
      );
    }

    // Record the view
    // TODO: Replace with actual database insert
    const insertViewQuery = `
      INSERT INTO video_views (video_id, user_id, application_id, viewed_at)
      VALUES ($1, $2, $3, NOW())
    `;

    const newViewCount = currentViewCount + 1;

    // If this is the 2nd view, mark video for deletion
    if (newViewCount === 2) {
      // TODO: Trigger video deletion job
      const deleteVideoQuery = `
        UPDATE videos
        SET deleted_at = NOW(), deletion_reason = 'view_limit_reached'
        WHERE id = $1
      `;
    }

    // Send push notification to job seeker
    if (newViewCount === 1) {
      // TODO: Integrate with NotificationService from backend
      // notificationService.notifyVideoViewed({
      //   recipientId: jobseekerId,
      //   viewerName: employerName,
      //   viewsRemaining: 1,
      //   applicationId
      // });
    } else if (newViewCount === 2) {
      // Last view notification
      // notificationService.notifyVideoViewed({
      //   recipientId: jobseekerId,
      //   viewerName: employerName,
      //   viewsRemaining: 0,
      //   applicationId
      // });
    }

    return NextResponse.json({
      success: true,
      viewCount: newViewCount,
      viewsRemaining: 2 - newViewCount,
      isLocked: newViewCount >= 2,
      message: newViewCount === 2
        ? 'Final view. Video is now locked.'
        : `${2 - newViewCount} view(s) remaining.`
    });

  } catch (error) {
    console.error('Error tracking video view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get Video View Count
 *
 * Check how many times an employer has viewed a video
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const applicationId = searchParams.get('applicationId');

    if (!videoId || !applicationId) {
      return NextResponse.json(
        { error: 'videoId and applicationId are required' },
        { status: 400 }
      );
    }

    // Get user ID from JWT token
    const userId = 'employer-123'; // TODO: Get from JWT

    // Query view count
    // TODO: Replace with actual database query
    const viewCount = 0; // Mock value

    return NextResponse.json({
      videoId,
      applicationId,
      viewCount,
      viewsRemaining: Math.max(0, 2 - viewCount),
      isLocked: viewCount >= 2,
    });

  } catch (error) {
    console.error('Error getting video view count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
