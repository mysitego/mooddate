import axios from 'axios';

const BASE_URL = 'https://mooddatabase-a384.restdb.io/';
const API_KEY = '680ec61672702c36a8b3d378';

// Enhanced API key validation
if (!API_KEY || API_KEY.length !== 24) {
  throw new Error('Invalid API key configuration');
}

// Create axios instance with enhanced configuration
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5 seconds timeout
  headers: {
    'x-apikey': API_KEY,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  }
});

// Improved request interceptor
api.interceptors.request.use(
  async (config) => {
    // Add authentication check for protected routes
    if (config.url.includes('/users')) {
      if (!config.headers['x-apikey']) {
        throw new Error('API key missing for protected route');
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Specific handling for unauthorized access
      if (error.config.url.includes('/users')) {
        throw new Error('Invalid credentials or insufficient permissions');
      }
      throw new Error('API authentication failed - please check your API key');
    }
    return Promise.reject(error);
  }
);

// User authentication functions
export const auth = {
  // Login - get user by username
  login: (username) => api.get(`/users?q={"username":"${username}"}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Check if username exists
  checkUsername: (username) => api.get(`/users?q={"username":"${username}"}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Check if email exists
  checkEmail: (email) => api.get(`/users?q={"email":"${email}"}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Register new user
  register: (userData) => api.post('/users', userData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Get user by ID
  getUserById: (userId) => api.get(`/users/${userId}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Update user
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Signup function with better error handling
  signup: (userData) => api.post('/users', userData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};

// Mood definitions functions
export const moodDefinitions = {
  // Get all moods
  getAll: () => api.get('/moods').catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get mood by ID
  getById: (moodId) => api.get(`/moods/${moodId}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get mood by mood ID
  getByMoodId: (moodId) => api.get(`/moods?q={"moodid":${moodId}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get moods by user ID
  getByUserId: (userId) => api.get(`/moods?q={"created_by":{"$elemMatch":{"_id":"${userId}"}}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Create new mood
  create: (moodData) => api.post('/moods', moodData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Update mood
  update: (moodId, moodData) => api.put(`/moods/${moodId}`, moodData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Delete mood
  delete: (moodId) => api.delete(`/moods/${moodId}`).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};

// Activities functions
export const activities = {
  // Get all activities
  getAll: () => api.get('/activities').catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get activity by ID
  getById: (activityId) => api.get(`/activities/${activityId}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get activities by mood ID
  getByMoodId: (moodId) => api.get(`/activities?q={"mood_id":{"$elemMatch":{"_id":"${moodId}"}}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get activities by mood name array
  getByMoodName: (moodId) => api.get(`/activities?q={"name":{"$elemMatch":{"_id":"${moodId}"}}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Create new activity
  create: (activityData) => api.post('/activities', activityData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Update activity
  update: (activityId, activityData) => api.put(`/activities/${activityId}`, activityData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Delete activity
  delete: (activityId) => api.delete(`/activities/${activityId}`).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};

// User moods functions
export const userMoods = {
  // Get all user moods
  getAll: () => api.get('/usermoods').catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get user mood by ID
  getById: (userMoodId) => api.get(`/usermoods/${userMoodId}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Get user moods by user ID
  getByUserId: (userId) => api.get(`/usermoods?q={"user_id":{"$elemMatch":{"_id":"${userId}"}}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Create new user mood
  create: (userMoodData) => api.post('/usermoods', userMoodData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Update user mood
  update: (userMoodId, userMoodData) => api.put(`/usermoods/${userMoodId}`, userMoodData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Delete user mood
  delete: (userMoodId) => api.delete(`/usermoods/${userMoodId}`).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};

// User profile functions
export const profiles = {
  // Get profile by user ID
  getByUserId: (userId) => api.get(`/profiles?q={"userid":{"$elemMatch":{"_id":"${userId}"}}}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Create new profile
  create: (profileData) => api.post('/profiles', profileData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Update profile
  update: (id, profileData) => api.patch(`/profiles/${id}`, profileData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};

// Mood logs functions
export const moodLogs = {
  // Get mood logs by user ID
  getByUserId: (userId) => api.get(`/moodlogs?q={"userid":"${userId}"}`).catch(err => {
    if (err.response?.status === 429) {
      throw new Error('Too many requests, please try again later');
    }
    throw err;
  }),
  
  // Create new mood log
  create: (logData) => api.post('/moodlogs', logData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Update mood log
  update: (id, logData) => api.patch(`/moodlogs/${id}`, logData).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  }),
  
  // Delete mood log
  delete: (id) => api.delete(`/moodlogs/${id}`).catch(err => {
    if (err.response?.status === 401) {
      throw new Error('Invalid API key or unauthorized access');
    }
    throw err;
  })
};