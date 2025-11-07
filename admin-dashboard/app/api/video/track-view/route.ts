import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface ViewCountRow {
  count: string;
}

interface VideoInfoRow {
  jobseeker_id: string;
  jobseeker_name: string | null;
}

interface ViewerInfoRow {
  company_name: string | null;
}

/**
 * Get Video View Count
 *
 * Check how many times a user has viewed a video
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

    // Get user ID from middleware headers (employer viewing the video)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Query view count for this video by this user
    const viewCountRow = await db.one<ViewCountRow>(
      `SELECT COUNT(*) as count
       FROM video_views
       WHERE video_id = $1 AND user_id = $2`,
      [videoId, userId]
    );

    const viewCount = parseInt(viewCountRow.count);

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

/**
 * Track Video View - CRITICAL: Implements 2-view limit
 *
 * This endpoint tracks when an employer views a job seeker's video resume.
 * Maximum 2 views allowed per video per employer.
 * After 2 views, the video is permanently deleted/locked by database trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, applicationId } = body;

    if (!videoId || !applicationId) {
      return NextResponse.json(
        { error: 'videoId and applicationId are required' },
        { status: 400 }
      );
    }

    // Get user ID from middleware headers (employer viewing the video)
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check current view count
    const viewCountRow = await db.one<ViewCountRow>(
      `SELECT COUNT(*) as count
       FROM video_views
       WHERE video_id = $1 AND user_id = $2`,
      [videoId, userId]
    );

    const currentViewCount = parseInt(viewCountRow.count);

    // Check if limit already reached
    if (currentViewCount >= 2) {
      return NextResponse.json(
        { error: 'View limit reached. This video can only be viewed 2 times.' },
        { status: 403 }
      );
    }

    // Record the view
    // Note: Database triggers will:
    // 1. Enforce the 2-view limit (BEFORE INSERT trigger)
    // 2. Auto-delete video if this is the 2nd view (AFTER INSERT trigger)
    try {
      await db.none(
        `INSERT INTO video_views (video_id, user_id, application_id, viewed_at, ip_address)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)`,
        [
          videoId,
          userId,
          applicationId,
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        ]
      );
    } catch (dbError: any) {
      // Database trigger will throw exception if view limit reached
      if (dbError.message && dbError.message.includes('View limit reached')) {
        return NextResponse.json(
          { error: 'View limit reached. This video can only be viewed 2 times.' },
          { status: 403 }
        );
      }
      throw dbError;
    }

    const newViewCount = currentViewCount + 1;

    // Get video and viewer information for notification
    const videoInfo = await db.oneOrNone<VideoInfoRow>(
      `SELECT
         a.user_id as jobseeker_id,
         u.name as jobseeker_name
       FROM applications a
       JOIN users u ON u.id = a.user_id
       WHERE a.id = $1`,
      [applicationId]
    );

    const viewerInfo = await db.oneOrNone<ViewerInfoRow>(
      `SELECT company_name FROM users WHERE id = $1`,
      [userId]
    );

    // TODO: Send push notification to job seeker
    if (videoInfo) {
      const employerName = viewerInfo?.company_name || 'Работодатель';
      const viewsRemaining = 2 - newViewCount;

      if (newViewCount === 1) {
        // First view notification
        // await notificationService.send({
        //   userId: videoInfo.jobseeker_id,
        //   title: 'Ваше видео просмотрено!',
        //   body: `${employerName} просмотрел ваше видео-резюме. Осталось ${viewsRemaining} просмотр.`,
        //   type: 'video_viewed',
        //   data: { applicationId, viewsRemaining: 1 }
        // });
      } else if (newViewCount === 2) {
        // Final view notification - video will be auto-deleted by trigger
        // await notificationService.send({
        //   userId: videoInfo.jobseeker_id,
        //   title: 'Лимит просмотров достигнут',
        //   body: `${employerName} просмотрел ваше видео во второй раз. Видео удалено согласно правилам платформы.`,
        //   type: 'video_limit_reached',
        //   data: { applicationId, viewsRemaining: 0 }
        // });
      }
    }

    return NextResponse.json({
      success: true,
      viewCount: newViewCount,
      viewsRemaining: 2 - newViewCount,
      isLocked: newViewCount >= 2,
      message: newViewCount === 2
        ? 'Final view. Video is now locked and will be deleted.'
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
