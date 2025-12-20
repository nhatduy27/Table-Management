import axios from "axios";

const API_BASE_URL =
	import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Table API
export const tableAPI = {
	// Get all tables
	getAll: (params) => api.get("/tables", { params }),

	// Get table by ID
	getById: (id) => api.get(`/tables/${id}`),

	// Create table
	create: (data) => api.post("/tables", data),

	// Update table
	update: (id, data) => api.put(`/tables/${id}`, data),

	// Update table status
	updateStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
};

// QR Code API
export const qrAPI = {
	// Generate QR code
	generate: (tableId) => api.post(`/tables/${tableId}/qr/generate`),

	// Regenerate QR code
	regenerate: (tableId) => api.post(`/tables/${tableId}/qr/regenerate`),

	// Bulk regenerate all QR codes
	regenerateAll: () => api.post("/tables/qr/regenerate-all"),

	// Download QR code
	download: (tableId, format = "png") =>
		api.get(`/tables/${tableId}/qr/download`, {
			params: { format },
			responseType: "blob",
		}),

	// Download all QR codes
	downloadAll: (format = "zip") =>
		api.get("/tables/qr/download-all", {
			params: { format },
			responseType: "blob",
		}),

	// Get QR preview
	getPreview: (tableId) => api.get(`/tables/${tableId}/qr/preview`),
};

export default api;
