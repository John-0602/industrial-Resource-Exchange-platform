const express = require('express');
const router = express.Router();
const {
  createExchangeRequest,
  getSentRequests,
  getReceivedRequests,
  getExchangeById,
  updateExchangeStatus,
  cancelExchangeRequest
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createExchangeRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);
router.get('/:id', getExchangeById);
router.patch('/:id/status', updateExchangeStatus);
router.patch('/:id/cancel', cancelExchangeRequest);

module.exports = router;
