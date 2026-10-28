const express = require('express');
const router = express.Router();
const { createAlert, getAlerts, resolveAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public / Visitor endpoint to raise alert
router.post('/', createAlert);

// Admin-only endpoints to view and resolve alerts
router.get('/', protect, authorize('Admin'), getAlerts);
router.patch('/:id/resolve', protect, authorize('Admin'), resolveAlert);

module.exports = router;
