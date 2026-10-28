const express = require('express');
const router = express.Router();
const {
  createVisitor,
  getVisitors,
  getVisitorById,
  recordExit,
  deleteVisitor,
} = require('../controllers/visitorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .post(authorize('Admin', 'Security Guard'), createVisitor)
  .get(getVisitors);

router
  .route('/:id')
  .get(getVisitorById)
  .delete(authorize('Admin'), deleteVisitor);

router.patch('/:id/exit', authorize('Admin', 'Security Guard'), recordExit);

module.exports = router;
