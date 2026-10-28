const express = require('express');
const router = express.Router();
const {
  createMaintenance,
  getMaintenanceRequests,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
} = require('../controllers/maintenanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .post(createMaintenance)
  .get(getMaintenanceRequests);

router
  .route('/:id')
  .get(getMaintenanceById)
  .patch(authorize('Admin'), updateMaintenance)
  .delete(deleteMaintenance);

module.exports = router;
