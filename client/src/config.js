// Use local backend in dev mode, and Render backend in production (Vercel/Render)
export const BASE_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:5000` 
  : "https://smart-attendance-backend-g4bb.onrender.com";