const express = require('express');
const router = express.Router();
const {
  createRequirement,
  getRequirements,
  getMatchesForRequirement,
  createExchangeRequest,
  getSentRequests,
  getReceivedRequests,
  getExchangeById,
  addNegotiationNote,
  updateExchangeStatus,
  cancelExchangeRequest
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// Material Requirements & Circular Matching
router.post('/requirements', createRequirement);
router.get('/requirements', getRequirements);
router.get('/matches/:requirementId', getMatchesForRequirement);

// Exchange Proposals & Transfers
router.post('/', createExchangeRequest);
router.get('/sent', getSentRequests);
router.get('/received', getReceivedRequests);
router.get('/:id', getExchangeById);
router.post('/:id/negotiate', addNegotiationNote);
router.patch('/:id/status', updateExchangeStatus);
router.patch('/:id/cancel', cancelExchangeRequest);

module.exports = router;
