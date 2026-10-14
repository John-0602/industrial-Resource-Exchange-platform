const axios = require('axios');

const getBaseUrl = () => {
  return process.env.RESOURCE_SERVICE_URL || 'http://localhost:5001';
};

const getServiceKey = () => {
  return process.env.SERVICE_API_KEY || 'internal_shared_microservice_secret_token_college_2025';
};

const createClient = () => {
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 7000,
    headers: {
      'Content-Type': 'application/json',
      'x-service-api-key': getServiceKey()
    }
  });
};

/**
 * Fetch resource details directly from the Resource Service over REST
 */
const getResourceDetails = async (resourceId) => {
  const client = createClient();
  const endpoint = `/api/resources/${resourceId}`;
  const targetUrl = `${getBaseUrl()}${endpoint}`;

  console.log(`[Exchange Service -> Resource Service] OUTBOUND REST GET: ${targetUrl}`);

  try {
    const response = await client.get(endpoint);
    console.log(`[Exchange Service -> Resource Service] SUCCESS: Retrieved "${response.data.data.title}" (Available: ${response.data.data.availableQuantity} ${response.data.data.unit})`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(`[Exchange Service -> Resource Service] FAILED (HTTP ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      const err = new Error(error.response.data.message || 'Resource Service rejected request');
      err.statusCode = error.response.status;
      throw err;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      const err = new Error('Resource Service is unreachable. Please ensure resource-service is running.');
      err.statusCode = 503;
      throw err;
    } else if (error.code === 'ECONNABORTED') {
      const err = new Error('Resource Service timed out.');
      err.statusCode = 504;
      throw err;
    } else {
      throw error;
    }
  }
};

/**
 * Reserve or release material quantity via inter-service REST call
 * @param {string} resourceId 
 * @param {number} quantity 
 * @param {'reserve' | 'release' | 'complete'} action 
 */
const reserveOrReleaseQuantity = async (resourceId, quantity, action) => {
  const client = createClient();
  const endpoint = `/api/resources/${resourceId}/reserve`;
  const targetUrl = `${getBaseUrl()}${endpoint}`;

  console.log(`[Exchange Service -> Resource Service] OUTBOUND REST PATCH: ${targetUrl} (action="${action}", qty=${quantity})`);

  try {
    const response = await client.patch(endpoint, { quantity, action });
    console.log(`[Exchange Service -> Resource Service] SUCCESS: Executed "${action}" on resource ${resourceId}`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(`[Exchange Service -> Resource Service] FAILED QUANTITY RESERVATION (HTTP ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      const err = new Error(error.response.data.message || 'Quantity reservation failed on Resource Service');
      err.statusCode = error.response.status;
      throw err;
    } else {
      const err = new Error('Network failure while coordinating quantity with Resource Service');
      err.statusCode = 503;
      throw err;
    }
  }
};

/**
 * Query candidate resources from Resource Service for circular matching engine
 */
const getCandidateResources = async (category, unit, minQty) => {
  const client = createClient();
  const endpoint = `/api/resources/matches`;

  console.log(`[Exchange Service -> Resource Service] OUTBOUND REST GET: ${getBaseUrl()}${endpoint}?category=${encodeURIComponent(category || '')}`);

  try {
    const response = await client.get(endpoint, {
      params: { category, unit, minQty }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('[Exchange Service -> Resource Service] Failed to retrieve matching candidates:', error.message);
    return [];
  }
};

module.exports = {
  getResourceDetails,
  reserveOrReleaseQuantity,
  getCandidateResources
};
