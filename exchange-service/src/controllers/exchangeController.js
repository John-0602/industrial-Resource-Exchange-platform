const Exchange = require('../models/Exchange');
const resourceClient = require('../services/resourceClient');

// @desc    Create a new exchange / borrowing request
// @route   POST /api/exchanges
// @access  Private (Student)
const createExchangeRequest = async (req, res, next) => {
  try {
    const { resourceId, requestMessage, exchangeItemOffered, durationRequested } = req.body;

    if (!resourceId || !requestMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both resourceId and a clear request message'
      });
    }

    // Step 1: Inter-service REST call to verify resource on Resource Service
    let resource;
    try {
      resource = await resourceClient.getResourceDetails(resourceId);
    } catch (err) {
      return res.status(err.statusCode || 500).json({
        success: false,
        message: `Resource verification failed: ${err.message}`
      });
    }

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'The requested resource could not be found'
      });
    }

    // Step 2: Prevent student from requesting their own resource
    const ownerId = resource.owner?.id?.toString() || resource.owner?.id || resource.owner?._id;
    if (ownerId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Operation not allowed: You cannot create an exchange request for your own listed resource'
      });
    }

    // Step 3: Validate resource availability
    if (resource.availabilityStatus !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Resource is currently ${resource.availabilityStatus} and is not accepting new requests`
      });
    }

    // Step 4: Prevent duplicate pending requests for the same resource & requester
    const duplicatePending = await Exchange.findOne({
      resourceId: resourceId.toString(),
      requesterId: req.user.id.toString(),
      status: 'Pending'
    });

    if (duplicatePending) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active pending request for this resource. Please await the owner’s response or cancel your prior request.'
      });
    }

    // Step 5: Create and store exchange request in Exchange Service database
    const exchange = await Exchange.create({
      resourceId: resource._id || resourceId,
      resourceTitle: resource.title,
      resourceCategory: resource.category,
      resourceImageUrl: resource.imageUrl || '',
      requesterId: req.user.id,
      requesterName: req.user.name,
      requesterEmail: req.user.email,
      requesterCollege: req.user.collegeName || 'Apex Engineering Institute',
      requesterDepartment: req.user.department || 'Computer Science and Engineering',
      ownerId: ownerId,
      ownerName: resource.owner.name,
      ownerEmail: resource.owner.email,
      requestMessage: requestMessage.trim(),
      requestType: resource.listingType,
      exchangeItemOffered: exchangeItemOffered ? exchangeItemOffered.trim() : '',
      durationRequested: durationRequested ? durationRequested.trim() : (resource.lendingDuration || ''),
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(),
          changedBy: req.user.name,
          note: 'Request submitted by student'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Exchange request submitted successfully to the resource owner',
      data: exchange
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests sent by the authenticated student
// @route   GET /api/exchanges/sent
// @access  Private
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await Exchange.find({ requesterId: req.user.id.toString() })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all requests received for resources owned by the student
// @route   GET /api/exchanges/received
// @access  Private
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await Exchange.find({ ownerId: req.user.id.toString() })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exchange request details
// @route   GET /api/exchanges/:id
// @access  Private (Requester or Owner only)
const getExchangeById = async (req, res, next) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    const currentUserId = req.user.id.toString();
    if (exchange.requesterId !== currentUserId && exchange.ownerId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not a party to this exchange request'
      });
    }

    res.json({
      success: true,
      data: exchange
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exchange request status (Approve, Reject, Complete)
// @route   PATCH /api/exchanges/:id/status
// @access  Private (Resource Owner)
const updateExchangeStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const allowedStatuses = ['Approved', 'Rejected', 'Completed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted transitions: ${allowedStatuses.join(', ')}`
      });
    }

    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Permission check: only resource owner can approve, reject, or mark completed
    if (exchange.ownerId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the resource owner can approve, reject, or complete this request'
      });
    }

    // Prevent invalid transitions
    if (exchange.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update status: This request was already cancelled by the requester'
      });
    }

    if (exchange.status === 'Completed' && status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify a completed exchange record'
      });
    }

    // Handle status transitions with Resource Service REST coordination
    if (status === 'Approved') {
      // 1. Verify resource is still available on Resource Service
      const resource = await resourceClient.getResourceDetails(exchange.resourceId);
      if (resource.availabilityStatus !== 'available') {
        return res.status(409).json({
          success: false,
          message: `Cannot approve: Resource is currently marked as "${resource.availabilityStatus}"`
        });
      }

      // 2. Determine target availability
      const newAvailability = (exchange.requestType === 'Lend' || exchange.requestType === 'Exchange')
        ? 'reserved'
        : 'exchanged';

      // 3. Update Resource Service availability status via inter-service REST call
      await resourceClient.updateResourceAvailability(exchange.resourceId, newAvailability);

      // 4. Reject other pending requests for the same resource to avoid conflicting bookings
      const conflictingRequests = await Exchange.find({
        resourceId: exchange.resourceId,
        _id: { $ne: exchange._id },
        status: 'Pending'
      });

      for (const conflict of conflictingRequests) {
        conflict.status = 'Rejected';
        conflict.statusHistory.push({
          status: 'Rejected',
          changedAt: new Date(),
          changedBy: 'System',
          note: 'Automatically closed because another request for this item was approved.'
        });
        await conflict.save();
      }
    } else if (status === 'Rejected' && exchange.status === 'Approved') {
      // Restore resource availability if owner rejects a previously approved request
      try {
        await resourceClient.updateResourceAvailability(exchange.resourceId, 'available');
      } catch (err) {
        console.error('[Exchange Service] Warning: Failed to restore resource availability on reject:', err.message);
      }
    } else if (status === 'Completed') {
      // If completed lending item is returned, availability can be set to available
      if (exchange.requestType === 'Lend') {
        try {
          await resourceClient.updateResourceAvailability(exchange.resourceId, 'available');
        } catch (err) {
          console.error('[Exchange Service] Warning: Could not mark resource available on return:', err.message);
        }
      } else {
        try {
          await resourceClient.updateResourceAvailability(exchange.resourceId, 'exchanged');
        } catch (err) {
          console.error('[Exchange Service] Warning: Could not set status to exchanged:', err.message);
        }
      }
    }

    exchange.status = status;
    exchange.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.name,
      note: note || `Status changed to ${status} by resource owner`
    });

    const updated = await exchange.save();

    res.json({
      success: true,
      message: `Request successfully updated to "${status}"`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an eligible pending exchange request
// @route   PATCH /api/exchanges/:id/cancel
// @access  Private (Requester)
const cancelExchangeRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Permission check: only requester can cancel
    if (exchange.requesterId !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the student who submitted the request can cancel it'
      });
    }

    if (exchange.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This request is already cancelled'
      });
    }

    if (exchange.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an exchange that has already completed'
      });
    }

    // If request was approved and user cancels, restore availability in Resource Service
    if (exchange.status === 'Approved') {
      try {
        await resourceClient.updateResourceAvailability(exchange.resourceId, 'available');
        console.log(`[Exchange Service] Restored availability for resource ${exchange.resourceId} to available after request cancellation`);
      } catch (err) {
        console.error('[Exchange Service] Warning: Failed to restore resource availability on cancellation:', err.message);
      }
    }

    exchange.status = 'Cancelled';
    exchange.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      changedBy: req.user.name,
      note: reason || 'Request cancelled by student'
    });

    const updated = await exchange.save();

    res.json({
      success: true,
      message: 'Exchange request cancelled successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExchangeRequest,
  getSentRequests,
  getReceivedRequests,
  getExchangeById,
  updateExchangeStatus,
  cancelExchangeRequest
};
