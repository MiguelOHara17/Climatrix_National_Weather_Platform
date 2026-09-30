
const axios = require('axios');

const http = axios.create({
  timeout: 4000,
});

function mlBaseUrl() {
  return process.env.ML_SERVICE_URL || 'http://localhost:8000';
}

async function post(path, body) {
  try {
    const response = await http.post(`${mlBaseUrl()}${path}`, body);

    return response.data;
  } catch (error) {
    console.warn(`[ML] ${path} failed: ${error.message}`);

    return null;
  }
}

module.exports = {
  classifyEvent(text) {
    return post('/classify-event', { text });
  },

  duplicateCheck(body) {
    return post('/duplicate-check', body);
  },

  fakeScore(body) {
    return post('/fake-score', body);
  },

  credibility(body) {
    return post('/credibility', body);
  },
};