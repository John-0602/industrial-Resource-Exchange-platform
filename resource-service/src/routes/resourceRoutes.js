const express = require('express');
const router = express.Router();
const {
  createResource,
  getResources,
  searchResources,
  getResourceById,
  updateResource,
  deleteResource,
  updateAvailability,
  reserveOrReleaseQuantity,
  getMatchingCandidates
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');
const { verifyServiceOrUser } = require('../middleware/serviceAuthMiddleware');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);

router.get('/matches', getMatchingCandidates);
router.get('/search', searchResources);

router.route('/')
  .post(protect, createResource)
  .get(getResources);

router.route('/:id')
  .get(getResourceById)
  .put(protect, updateResource)
  .delete(protect, deleteResource);

router.patch('/:id/availability', verifyServiceOrUser, updateAvailability);
router.patch('/:id/reserve', verifyServiceOrUser, reserveOrReleaseQuantity);

module.exports = router;
