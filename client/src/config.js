// Update this URL after you deploy your backend to Render!
const isLocalNetwork = window.location.hostname === "localhost" || 
                       window.location.hostname === "127.0.0.1" || 
                       window.location.hostname.startsWith("192.168.") || 
                       window.location.hostname.startsWith("10.");

export const BASE_URL = isLocalNetwork
  ? `http://${window.location.hostname}:5000`
  : "https://smart-attendance-backend-g4bb.onrender.com"; // <--- Replace with your Render URL after Phase 1