const Exchange = require('../models/Exchange');
const Requirement = require('../models/Requirement');
const resourceClient = require('../services/resourceClient');
const { calculateCompatibility } = require('../services/matchingService');

// @desc    Post a material requirement for industrial procurement
// @route   POST /api/requirements
// @access  Private (Company)
const createRequirement = async (req, res, next) => {
  try {
    const {
      title,
      materialCategory,
      specifications,
      requiredQuantity,
      unit,
      acceptableCondition,
      deliveryLocation,
      maxBudget,
      currency,
      requiredByDate,
      additionalHandling
    } = req.body;

    if (!title || !materialCategory || !specifications || !requiredQuantity || !unit || !acceptableCondition || !deliveryLocation?.city) {
      return res.status(400).json({
        success: false,
        message: 'Please complete title, category, specifications, quantity, unit, condition, and delivery location'
      });
    }

    const requirement = await Requirement.create({
      companyId: req.user.id,
      companyName: req.user.name,
      contactEmail: req.user.email,
      title: title.trim(),
      materialCategory,
      specifications: specifications.trim(),
      requiredQuantity: Number(requiredQuantity),
      unit,
      acceptableCondition: acceptableCondition.trim(),
      deliveryLocation: {
        city: deliveryLocation.city.trim(),
        state: deliveryLocation.state.trim(),
        address: deliveryLocation.address || ''
      },
      maxBudget: maxBudget ? Number(maxBudget) : 0,
      currency: currency || 'INR',
      requiredByDate: requiredByDate ? new Date(requiredByDate) : null,
      additionalHandling: additionalHandling ? additionalHandling.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Material requirement published. Circular matching engine is active.',
      data: requirement
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get company requirements
// @route   GET /api/requirements
// @access  Private (Company)
const getRequirements = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.myOnly) {
      query.companyId = req.user.id;
    }
    const requirements = await Requirement.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requirements.length,
      data: requirements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run automated matching engine between a requirement and available resource listings
// @route   GET /api/matches/:requirementId
// @access  Private (Company)
const getMatchesForRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.requirementId);
    if (!requirement) {
      return res.status(404).json({ success: false, message: 'Requirement not found' });
    }

    // Step 1: Inter-service REST call to get available candidate resources from Resource Service
    const candidates = await resourceClient.getCandidateResources(requirement.materialCategory);

    // Step 2: Calculate compatibility scores and breakdown explanations
    const matches = candidates
      .filter((resource) => (resource.supplier?.id || resource.supplier?._id) !== requirement.companyId)
      .map((resource) => {
        const analysis = calculateCompatibility(requirement, resource);
        return {
          resource,
          ...analysis
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({
      success: true,
      count: matches.length,
      requirement: {
        id: requirement._id,
        title: requirement.title,
        materialCategory: requirement.materialCategory,
        requiredQuantity: requirement.requiredQuantity,
        unit: requirement.unit,
        acceptableCondition: requirement.acceptableCondition,
        deliveryLocation: requirement.deliveryLocation,
        maxBudget: requirement.maxBudget
      },
      data: matches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create industrial exchange proposal / procurement request
// @route   POST /api/exchanges
// @access  Private (Company)
const createExchangeRequest = async (req, res, next) => {
  try {
    const {
      resourceId,
      requestedQuantity,
      proposedPricePerUnit,
      deliveryTerms,
      proposalMessage
    } = req.body;

    if (!resourceId || !requestedQuantity || !proposalMessage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource ID, requested quantity, and a proposal message'
      });
    }

    const qty = Number(requestedQuantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity must be a positive number'
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
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    // Step 2: Prevent company from requesting its own resource
    const supplierId = resource.supplier?.id?.toString() || resource.supplier?._id?.toString();
    if (supplierId === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Operation prohibited: You cannot request materials listed by your own facility'
      });
    }

    // Step 3: Validate available quantity
    if (qty > resource.availableQuantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${qty} ${resource.unit}) exceeds currently available unreserved stock (${resource.availableQuantity} ${resource.unit})`
      });
    }

    // Step 4: Check for duplicate active pending request
    const existing = await Exchange.findOne({
      resourceId: resource._id.toString(),
      receiverCompanyId: req.user.id.toString(),
      status: { $in: ['Pending', 'Under Negotiation'] }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Your company already has an active request or negotiation open for this resource'
      });
    }

    const unitPrice = proposedPricePerUnit !== undefined ? Number(proposedPricePerUnit) : resource.indicativePrice;
    const totalAmount = unitPrice * qty;

    const exchange = await Exchange.create({
      resourceId: resource._id,
      resourceTitle: resource.title,
      materialCategory: resource.materialCategory,
      supplierCompanyId: supplierId,
      supplierCompanyName: resource.supplier.name,
      supplierEmail: resource.supplier.email,
      receiverCompanyId: req.user.id,
      receiverCompanyName: req.user.name,
      receiverEmail: req.user.email,
      requestedQuantity: qty,
      unit: resource.unit,
      proposedPricePerUnit: unitPrice,
      currency: resource.currency || 'INR',
      totalProposedAmount: totalAmount,
      proposalMessage: proposalMessage.trim(),
      deliveryTerms: deliveryTerms ? deliveryTerms.trim() : 'Ex-Works pickup arranged by receiver facility',
      status: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          changedAt: new Date(),
          changedBy: req.user.name,
          note: `Procurement proposal submitted for ${qty} ${resource.unit}`
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Exchange proposal submitted successfully to supplier company',
      data: exchange
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sent exchange proposals
// @route   GET /api/exchanges/sent
// @access  Private
const getSentRequests = async (req, res, next) => {
  try {
    const requests = await Exchange.find({ receiverCompanyId: req.user.id.toString() })
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

// @desc    Get received exchange proposals
// @route   GET /api/exchanges/received
// @access  Private
const getReceivedRequests = async (req, res, next) => {
  try {
    const requests = await Exchange.find({ supplierCompanyId: req.user.id.toString() })
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

// @desc    Get single exchange proposal details
// @route   GET /api/exchanges/:id
// @access  Private
const getExchangeById = async (req, res, next) => {
  try {
    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange proposal not found' });
    }

    const currentId = req.user.id.toString();
    if (exchange.receiverCompanyId !== currentId && exchange.supplierCompanyId !== currentId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this proposal' });
    }

    res.json({ success: true, data: exchange });
  } catch (error) {
    next(error);
  }
};

// @desc    Add negotiation note or revised price proposal
// @route   POST /api/exchanges/:id/negotiate
// @access  Private
const addNegotiationNote = async (req, res, next) => {
  try {
    const { message, proposedPrice } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Negotiation message is required' });
    }

    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange proposal not found' });
    }

    const note = {
      senderId: req.user.id,
      senderName: req.user.name,
      message: message.trim(),
      proposedPrice: proposedPrice ? Number(proposedPrice) : undefined,
      timestamp: new Date()
    };

    exchange.negotiationNotes.push(note);
    if (exchange.status === 'Pending') {
      exchange.status = 'Under Negotiation';
      exchange.statusHistory.push({
        status: 'Under Negotiation',
        changedAt: new Date(),
        changedBy: req.user.name,
        note: 'Negotiation started'
      });
    }

    if (proposedPrice) {
      exchange.proposedPricePerUnit = Number(proposedPrice);
      exchange.totalProposedAmount = exchange.requestedQuantity * exchange.proposedPricePerUnit;
    }

    await exchange.save();

    res.json({
      success: true,
      message: 'Negotiation message added',
      data: exchange
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update exchange status with inter-service quantity reservation & tracking
// @route   PATCH /api/exchanges/:id/status
// @access  Private (Supplier or Receiver depending on action)
const updateExchangeStatus = async (req, res, next) => {
  try {
    const { status, note, trackingDetails } = req.body;
    const allowed = ['Under Negotiation', 'Accepted', 'Rejected', 'In Transfer', 'Completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Permitted: ${allowed.join(', ')}`
      });
    }

    const exchange = await Exchange.findById(req.params.id);
    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange not found' });
    }

    const isSupplier = exchange.supplierCompanyId === req.user.id.toString();
    const isReceiver = exchange.receiverCompanyId === req.user.id.toString();

    // Permission checks
    if (status === 'Accepted' || status === 'Rejected') {
      if (!isSupplier && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only the supplier company can Accept or Reject proposals'
        });
      }
    }

    // Coordination with Resource Service for quantity reservation
    if (status === 'Accepted' && exchange.status !== 'Accepted') {
      // Coordinate REST reservation with Resource Service
      try {
        await resourceClient.reserveOrReleaseQuantity(
          exchange.resourceId,
          exchange.requestedQuantity,
          'reserve'
        );
      } catch (err) {
        return res.status(err.statusCode || 409).json({
          success: false,
          message: `Cannot accept proposal: ${err.message}`
        });
      }
    } else if (status === 'Rejected' && exchange.status === 'Accepted') {
      // Release reserved stock back if previously accepted
      try {
        await resourceClient.reserveOrReleaseQuantity(
          exchange.resourceId,
          exchange.requestedQuantity,
          'release'
        );
      } catch (err) {
        console.error('[Exchange Service] Warning: Failed to release stock on reject:', err.message);
      }
    } else if (status === 'Completed' && exchange.status !== 'Completed') {
      // Permanently deduct stock
      try {
        await resourceClient.reserveOrReleaseQuantity(
          exchange.resourceId,
          exchange.requestedQuantity,
          'complete'
        );
      } catch (err) {
        console.error('[Exchange Service] Warning: Stock deduction coordination issue:', err.message);
      }
    }

    if (trackingDetails) {
      exchange.transferTracking = { ...exchange.transferTracking, ...trackingDetails };
    }

    exchange.status = status;
    exchange.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user.name,
      note: note || `Proposal transitioned to "${status}"`
    });

    const updated = await exchange.save();

    res.json({
      success: true,
      message: `Exchange proposal successfully updated to "${status}"`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel exchange proposal
// @route   PATCH /api/exchanges/:id/cancel
// @access  Private (Receiver)
const cancelExchangeRequest = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ success: false, message: 'Exchange proposal not found' });
    }

    if (exchange.receiverCompanyId !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only the requesting company can cancel this proposal'
      });
    }

    if (exchange.status === 'Cancelled' || exchange.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an exchange that is already ${exchange.status}`
      });
    }

    // If proposal was accepted, release reserved quantity back to Resource Service
    if (exchange.status === 'Accepted' || exchange.status === 'In Transfer') {
      try {
        await resourceClient.reserveOrReleaseQuantity(
          exchange.resourceId,
          exchange.requestedQuantity,
          'release'
        );
      } catch (err) {
        console.error('[Exchange Service] Warning: Failed to release stock on cancellation:', err.message);
      }
    }

    exchange.status = 'Cancelled';
    exchange.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      changedBy: req.user.name,
      note: reason || 'Proposal cancelled by receiver'
    });

    const updated = await exchange.save();

    res.json({
      success: true,
      message: 'Exchange proposal cancelled successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
