/**
 * 360° РАБОТА - Guest View Tracking Controller
 * Tracks guest user views server-side for 20-video limit
 */
import { Request, Response } from 'express';
export declare class GuestViewController {
    /**
     * Track a guest view
     * POST /api/v1/guests/views
     */
    static trackView(req: Request, res: Response): Promise<void>;
    /**
     * Get guest view status
     * GET /api/v1/guests/views/:guestId
     */
    static getViewStatus(req: Request, res: Response): Promise<void>;
    /**
     * Sync guest views (batch)
     * POST /api/v1/guests/views/sync
     */
    static syncViews(req: Request, res: Response): Promise<void>;
    /**
     * Clear guest views (for testing)
     * DELETE /api/v1/guests/views/:guestId
     */
    static clearViews(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=GuestViewController.d.ts.map