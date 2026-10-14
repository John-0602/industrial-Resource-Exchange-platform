const Resource = require('../models/Resource');

// @desc    Publish a new industrial resource listing
// @route   POST /api/resources
// @access  Private (Supplier Company)
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      materialCategory,
      resourceType,
      condition,
      chemicalComposition,
      totalQuantity,
      unit,
      minOrderQuantity,
      indicativePrice,
      currency,
      intendedUse,
      handlingStorageInfo,
      complianceInfo,
      pickupLocation,
      imageUrl,
      documentationUrl,
      expiryDate
    } = req.body;

    if (!title || !description || !materialCategory || !resourceType || !condition || !totalQuantity || !unit || !handlingStorageInfo || !pickupLocation?.city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, resource type, condition, quantity, unit, handling info, and pickup location'
      });
    }

    const qty = Number(totalQuantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total quantity must be a positive number'
      });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      materialCategory,
      resourceType,
      condition: condition.trim(),
      chemicalComposition: chemicalComposition ? chemicalComposition.trim() : '',
      totalQuantity: qty,
      availableQuantity: qty,
      reservedQuantity: 0,
      unit,
      minOrderQuantity: minOrderQuantity ? Number(minOrderQuantity) : 1,
      indicativePrice: indicativePrice !== undefined ? Number(indicativePrice) : 0,
      currency: currency || 'INR',
      intendedUse: intendedUse ? intendedUse.trim() : '',
      handlingStorageInfo: handlingStorageInfo.trim(),
      complianceInfo: complianceInfo ? complianceInfo.trim() : 'Compliant with industrial waste regulations',
      pickupLocation: {
        facilityName: pickupLocation.facilityName || req.company.name,
        address: pickupLocation.address || req.company.address,
        city: pickupLocation.city.trim(),
        state: pickupLocation.state.trim(),
        country: pickupLocation.country || 'India',
        pincode: pickupLocation.pincode || ''
      },
      supplier: {
        id: req.company._id,
        name: req.company.name,
        registrationRef: req.company.registrationRef || '',
        email: req.company.email,
        city: req.company.city,
        state: req.company.state,
        verificationStatus: req.company.verificationStatus || 'Pending'
      },
      imageUrl: imageUrl || '',
      documentationUrl: documentationUrl || '',
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      availabilityStatus: 'available',
      moderationStatus: 'Approved'
    });

    res.status(201).json({
      success: true,
      message: 'Industrial resource published successfully on the exchange catalog',
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resources with filters and pagination
// @route   GET /api/resources
// @access  Public
const getResources = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const query = { moderationStatus: { $ne: 'Rejected' } };

    if (req.query.category && req.query.category !== 'All') {
      query.materialCategory = req.query.category;
    }

    if (req.query.resourceType && req.query.resourceType !== 'All') {
      query.resourceType = req.query.resourceType;
    }

    if (req.query.condition && req.query.condition !== 'All') {
      query.condition = req.query.condition;
    }

    if (req.query.availability && req.query.availability !== 'All') {
      query.availabilityStatus = req.query.availability;
    } else if (!req.query.allStatuses) {
      // Default to active available resources
      query.availabilityStatus = { $in: ['available', 'partially_reserved'] };
    }

    if (req.query.supplierId) {
      query['supplier.id'] = req.query.supplierId;
    }

    if (req.query.city) {
      query['pickupLocation.city'] = { $regex: req.query.city, $options: 'i' };
    }

    if (req.query.state) {
      query['pickupLocation.state'] = { $regex: req.query.state, $options: 'i' };
    }

    if (req.query.minQty) {
      query.availableQuantity = { $gte: Number(req.query.minQty) };
    }

    if (req.query.maxPrice) {
      query.indicativePrice = { $lte: Number(req.query.maxPrice) };
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    } else if (req.query.sort === 'price_asc') {
      sort = { indicativePrice: 1 };
    } else if (req.query.sort === 'price_desc') {
      sort = { indicativePrice: -1 };
    } else if (req.query.sort === 'qty_desc') {
      sort = { availableQuantity: -1 };
    }

    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: resources.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search industrial resources by keyword
// @route   GET /api/resources/search
// @access  Public
const searchResources = async (req, res, next) => {
  try {
    const keyword = (req.query.q || req.query.query || '').trim();
    const query = { moderationStatus: { $ne: 'Rejected' } };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { chemicalComposition: { $regex: keyword, $options: 'i' } },
        { intendedUse: { $regex: keyword, $options: 'i' } },
        { 'pickupLocation.city': { $regex: keyword, $options: 'i' } },
        { 'pickupLocation.state': { $regex: keyword, $options: 'i' } }
      ];
    }

    if (req.query.category && req.query.category !== 'All') {
      query.$or = [{ category: req.query.category }, { materialCategory: req.query.category }];
    }

    if (req.query.resourceType && req.query.resourceType !== 'All') {
      query.resourceType = req.query.resourceType;
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 }).limit(30);

    res.json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Industrial resource not found with the specified ID'
      });
    }

    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource listing (Supplier only)
// @route   PUT /api/resources/:id
// @access  Private (Supplier)
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.supplier.id.toString() !== req.company._id.toString() && req.company.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not authorized to edit this resource listing'
      });
    }

    const allowed = [
      'title', 'description', 'materialCategory', 'resourceType',
      'condition', 'chemicalComposition', 'minOrderQuantity',
      'indicativePrice', 'currency', 'intendedUse', 'handlingStorageInfo',
      'complianceInfo', 'imageUrl', 'documentationUrl', 'availabilityStatus'
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        resource[field] = req.body[field];
      }
    });

    if (req.body.pickupLocation) {
      resource.pickupLocation = { ...resource.pickupLocation, ...req.body.pickupLocation };
    }

    if (req.body.totalQuantity !== undefined) {
      const newTotal = Number(req.body.totalQuantity);
      if (newTotal >= resource.reservedQuantity) {
        resource.totalQuantity = newTotal;
        resource.availableQuantity = newTotal - resource.reservedQuantity;
      }
    }

    const updated = await resource.save();

    res.json({
      success: true,
      message: 'Resource specifications updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource listing (Supplier only)
// @route   DELETE /api/resources/:id
// @access  Private (Supplier)
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (resource.supplier.id.toString() !== req.company._id.toString() && req.company.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not authorized to delete this resource listing'
      });
    }

    if (resource.reservedQuantity > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete listing: ${resource.reservedQuantity} ${resource.unit} is currently held in active exchange negotiations`
      });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource listing removed from platform inventory',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource availability directly
// @route   PATCH /api/resources/:id/availability
// @access  Private (Supplier or Service)
const updateAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    resource.availabilityStatus = availabilityStatus;
    await resource.save();

    res.json({
      success: true,
      message: `Resource availability status updated to "${availabilityStatus}"`,
      data: resource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reserve, release, or complete quantity allocation (Inter-Service REST API)
// @route   PATCH /api/resources/:id/reserve
// @access  Verified Microservice OR Supplier
const reserveOrReleaseQuantity = async (req, res, next) => {
  try {
    const { quantity, action } = req.body;
    const qty = Number(quantity);

    if (!qty || qty <= 0 || !['reserve', 'release', 'complete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid positive quantity and action ("reserve", "release", "complete") are required'
      });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (action === 'reserve') {
      if (resource.availableQuantity < qty) {
        return res.status(409).json({
          success: false,
          message: `Insufficient material quantity: Requested ${qty} ${resource.unit}, but only ${resource.availableQuantity} ${resource.unit} is available`
        });
      }

      resource.availableQuantity -= qty;
      resource.reservedQuantity += qty;

      if (resource.availableQuantity <= 0) {
        resource.availabilityStatus = 'reserved';
      } else {
        resource.availabilityStatus = 'partially_reserved';
      }

      console.log(`[Resource Service] Reserved ${qty} ${resource.unit} for resource "${resource.title}". Remaining available: ${resource.availableQuantity} ${resource.unit}`);
    } else if (action === 'release') {
      resource.availableQuantity += qty;
      resource.reservedQuantity = Math.max(0, resource.reservedQuantity - qty);

      if (resource.availableQuantity >= resource.totalQuantity) {
        resource.availabilityStatus = 'available';
      } else {
        resource.availabilityStatus = 'partially_reserved';
      }

      console.log(`[Resource Service] Released ${qty} ${resource.unit} back to inventory for resource "${resource.title}". Available: ${resource.availableQuantity} ${resource.unit}`);
    } else if (action === 'complete') {
      resource.reservedQuantity = Math.max(0, resource.reservedQuantity - qty);
      resource.totalQuantity = Math.max(0, resource.totalQuantity - qty);

      if (resource.availableQuantity <= 0 && resource.reservedQuantity <= 0) {
        resource.availabilityStatus = 'transferred';
      }

      console.log(`[Resource Service] Completed transfer of ${qty} ${resource.unit} for resource "${resource.title}". Remaining total: ${resource.totalQuantity}`);
    }

    const updated = await resource.save();

    res.json({
      success: true,
      message: `Successfully executed "${action}" for ${qty} ${resource.unit}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate resources for automated matching engine
// @route   GET /api/resources/matches
// @access  Public / Internal
const getMatchingCandidates = async (req, res, next) => {
  try {
    const { category, unit, minQty } = req.query;
    const query = {
      availabilityStatus: { $in: ['available', 'partially_reserved'] },
      moderationStatus: { $ne: 'Rejected' }
    };

    if (category) {
      query.$or = [{ category }, { materialCategory: category }];
    }

    if (minQty) {
      query.availableQuantity = { $gte: Number(minQty) };
    }

    const candidates = await Resource.find(query).limit(50);

    res.json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResource,
  getResources,
  searchResources,
  getResourceById,
  updateResource,
  deleteResource,
  updateAvailability,
  reserveOrReleaseQuantity,
  getMatchingCandidates
};
