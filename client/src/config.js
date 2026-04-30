// Update this URL after you deploy your backend to Render!
console.log('--- CONFIG DEBUG ---');
console.log('Hostname:', window.location.hostname);
console.log('Is Dev Mode:', import.meta.env.DEV);

export const BASE_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:5000` 
  : "https://smart-attendance-backend-g4bb.onrender.com";

console.log('Final BASE_URL:', BASE_URL);
console.log('--------------------');