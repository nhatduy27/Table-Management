import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/admin";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
	(config) => {
		// Add auth token here when authentication is implemented
		// const token = localStorage.getItem('authToken');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response) {
			// Server responded with error status
			const message =
				error.response.data?.message ||
				error.response.data?.error ||
				"An error occurred";
			return Promise.reject(new Error(message));
		} else if (error.request) {
			// Request was made but no response
			return Promise.reject(
				new Error(
					"No response from server. Please check your connection."
				)
			);
		} else {
			// Something else happened
			return Promise.reject(error);
		}
	}
);

export default api;
