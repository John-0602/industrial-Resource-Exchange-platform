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
 * @param {string} resourceId 
 * @returns {Promise<Object>}
 */
const getResourceDetails = async (resourceId) => {
  const client = createClient();
  const endpoint = `/api/resources/${resourceId}`;
  const targetUrl = `${getBaseUrl()}${endpoint}`;

  console.log(`[Exchange Service -> Resource Service] OUTBOUND REST GET: ${targetUrl}`);

  try {
    const response = await client.get(endpoint);
    console.log(`[Exchange Service -> Resource Service] SUCCESS: Retrieved "${response.data.data.title}" (Status: ${response.data.data.availabilityStatus})`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(`[Exchange Service -> Resource Service] FAILED (HTTP ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      const err = new Error(error.response.data.message || 'Resource Service rejected request');
      err.statusCode = error.response.status;
      throw err;
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(`[Exchange Service -> Resource Service] NETWORK ERROR: Unable to connect to Resource Service at ${getBaseUrl()}`);
      const err = new Error('Resource Service is unreachable. Please ensure resource-service is online.');
      err.statusCode = 503;
      throw err;
    } else if (error.code === 'ECONNABORTED') {
      console.error(`[Exchange Service -> Resource Service] TIMEOUT: Request to ${targetUrl} timed out`);
      const err = new Error('Resource Service timed out. Please try again.');
      err.statusCode = 504;
      throw err;
    } else {
      console.error(`[Exchange Service -> Resource Service] UNKNOWN ERROR:`, error.message);
      throw error;
    }
  }
};

/**
 * Update resource availability status on the Resource Service over REST
 * @param {string} resourceId 
 * @param {'available' | 'reserved' | 'exchanged' | 'unavailable'} availabilityStatus 
 * @returns {Promise<Object>}
 */
const updateResourceAvailability = async (resourceId, availabilityStatus) => {
  const client = createClient();
  const endpoint = `/api/resources/${resourceId}/availability`;
  const targetUrl = `${getBaseUrl()}${endpoint}`;

  console.log(`[Exchange Service -> Resource Service] OUTBOUND REST PATCH: ${targetUrl} with status="${availabilityStatus}"`);

  try {
    const response = await client.patch(endpoint, { availabilityStatus });
    console.log(`[Exchange Service -> Resource Service] SUCCESS: Updated availability to "${availabilityStatus}"`);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error(`[Exchange Service -> Resource Service] FAILED AVAILABILITY UPDATE (HTTP ${error.response.status}): ${JSON.stringify(error.response.data)}`);
      const err = new Error(error.response.data.message || 'Failed to update resource availability');
      err.statusCode = error.response.status;
      throw err;
    } else {
      console.error(`[Exchange Service -> Resource Service] NETWORK FAILURE on availability update:`, error.message);
      const err = new Error('Failed to synchronize resource availability with Resource Service.');
      err.statusCode = 503;
      throw err;
    }
  }
};

module.exports = {
  getResourceDetails,
  updateResourceAvailability
};
