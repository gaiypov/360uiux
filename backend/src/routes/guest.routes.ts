/**
 * 360° РАБОТА - Guest Routes
 * Public routes for guest user tracking
 */

import { Router } from 'express';
import { GuestViewController } from '../controllers/GuestViewController';

const router = Router();

// Guest view tracking (no auth required)
router.post('/views', GuestViewController.trackView);
router.get('/views/:guestId', GuestViewController.getViewStatus);
router.post('/views/sync', GuestViewController.syncViews);
router.delete('/views/:guestId', GuestViewController.clearViews);

export default router;
