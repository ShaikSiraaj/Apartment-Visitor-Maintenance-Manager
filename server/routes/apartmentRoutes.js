const express = require('express');
const router = express.Router();
const { getApartments, createApartment } = require('../controllers/apartmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(getApartments)
  .post(authorize('Admin'), createApartment);

module.exports = router;
