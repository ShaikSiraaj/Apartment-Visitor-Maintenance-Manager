const express = require('express');
const router = express.Router();
const { getUsers, updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);
router.use(authorize('Admin'));

router.get('/', getUsers);
router.patch('/:id', updateUser);

module.exports = router;
