import axios from 'axios';

// Centralized Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5273/api', //cambiar por la api nueva que toca, esta es de otro proyecto
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export default api;