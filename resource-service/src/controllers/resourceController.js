const Resource = require('../models/Resource');

// @desc    Create a new resource listing
// @route   POST /api/resources
// @access  Private (Student)
const createResource = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      listingType,
      condition,
      imageUrl,
      exchangePreference,
      lendingDuration,
      location
    } = req.body;

    if (!title || !description || !category || !listingType || !condition || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, listing type, condition, and location'
      });
    }

    const resource = await Resource.create({
      title: title.trim(),
      description: description.trim(),
      category,
      listingType,
      condition,
      imageUrl: imageUrl || '',
      exchangePreference: exchangePreference ? exchangePreference.trim() : '',
      lendingDuration: lendingDuration ? lendingDuration.trim() : '',
      location: location.trim(),
      owner: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        collegeName: req.user.collegeName,
        department: req.user.department
      },
      availabilityStatus: 'available'
    });

    res.status(201).json({
      success: true,
      message: 'Resource listed successfully',
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

    const query = {};

    if (req.query.category && req.query.category !== 'All') {
      query.category = req.query.category;
    }

    if (req.query.listingType && req.query.listingType !== 'All') {
      query.listingType = req.query.listingType;
    }

    if (req.query.condition && req.query.condition !== 'All') {
      query.condition = req.query.condition;
    }

    if (req.query.availability && req.query.availability !== 'All') {
      query.availabilityStatus = req.query.availability;
    }

    if (req.query.ownerId) {
      query['owner.id'] = req.query.ownerId;
    }

    // Sort order
    let sort = { createdAt: -1 };
    if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    } else if (req.query.sort === 'title_asc') {
      sort = { title: 1 };
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

// @desc    Search resources by keyword
// @route   GET /api/resources/search
// @access  Public
const searchResources = async (req, res, next) => {
  try {
    const keyword = (req.query.q || req.query.query || '').trim();
    const category = req.query.category;
    const listingType = req.query.listingType;

    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (listingType && listingType !== 'All') {
      query.listingType = listingType;
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
        message: 'Resource not found with the specified ID'
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

// @desc    Update resource listing (Owner only)
// @route   PUT /api/resources/:id
// @access  Private
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check ownership
    if (resource.owner.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not the owner of this resource listing'
      });
    }

    const {
      title,
      description,
      category,
      listingType,
      condition,
      imageUrl,
      exchangePreference,
      lendingDuration,
      location,
      availabilityStatus
    } = req.body;

    if (title) resource.title = title.trim();
    if (description) resource.description = description.trim();
    if (category) resource.category = category;
    if (listingType) resource.listingType = listingType;
    if (condition) resource.condition = condition;
    if (imageUrl !== undefined) resource.imageUrl = imageUrl;
    if (exchangePreference !== undefined) resource.exchangePreference = exchangePreference.trim();
    if (lendingDuration !== undefined) resource.lendingDuration = lendingDuration.trim();
    if (location) resource.location = location.trim();
    if (availabilityStatus) resource.availabilityStatus = availabilityStatus;

    const updatedResource = await resource.save();

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: updatedResource
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resource listing (Owner only)
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Check ownership
    if (resource.owner.id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not authorized to delete this resource listing'
      });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource listing removed successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource availability (Owner or Exchange Microservice)
// @route   PATCH /api/resources/:id/availability
// @access  Private (Owner or Verified Service)
const updateAvailability = async (req, res, next) => {
  try {
    const { availabilityStatus } = req.body;

    const validStatuses = ['available', 'reserved', 'exchanged', 'unavailable'];
    if (!validStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid availabilityStatus. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // If caller is a user (not internal service call), verify ownership
    if (!req.isServiceCall && req.user) {
      if (resource.owner.id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Only the resource owner or authorized microservice can update availability'
        });
      }
    }

    resource.availabilityStatus = availabilityStatus;
    const updated = await resource.save();

    console.log(
      `[Resource Service] Availability for resource ${resource._id} ("${resource.title}") updated to: ${availabilityStatus} (Triggered by: ${
        req.isServiceCall ? 'Exchange Microservice' : `Owner (${req.user?.name})`
      })`
    );

    res.json({
      success: true,
      message: `Resource availability successfully updated to ${availabilityStatus}`,
      data: updated
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
  updateAvailability
};
