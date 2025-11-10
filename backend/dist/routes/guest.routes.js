"use strict";
/**
 * 360° РАБОТА - Guest Routes
 * Public routes for guest user tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GuestViewController_1 = require("../controllers/GuestViewController");
const router = (0, express_1.Router)();
// Guest view tracking (no auth required)
router.post('/views', GuestViewController_1.GuestViewController.trackView);
router.get('/views/:guestId', GuestViewController_1.GuestViewController.getViewStatus);
router.post('/views/sync', GuestViewController_1.GuestViewController.syncViews);
router.delete('/views/:guestId', GuestViewController_1.GuestViewController.clearViews);
exports.default = router;
//# sourceMappingURL=guest.routes.js.map