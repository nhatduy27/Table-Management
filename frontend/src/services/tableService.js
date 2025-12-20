import api from "../config/api";

const tableService = {
	// Get all tables
	getAllTables: async () => {
		const response = await api.get("/tables");
		return response.data;
	},

	// Get table by ID
	getTableById: async (id) => {
		const response = await api.get(`/tables/${id}`);
		return response.data;
	},

	// Create new table
	createTable: async (tableData) => {
		const response = await api.post("/tables", tableData);
		return response.data;
	},

	// Update table
	updateTable: async (id, tableData) => {
		const response = await api.put(`/tables/${id}`, tableData);
		return response.data;
	},

	// Update table status
	updateTableStatus: async (id, status) => {
		const response = await api.patch(`/tables/${id}/status`, { status });
		return response.data;
	},

	// QR Code operations
	// Generate QR code for a table
	generateQRCode: async (id) => {
		const response = await api.post(`/tables/${id}/qr/generate`);
		return response.data;
	},

	// Regenerate QR code (invalidate old)
	regenerateQRCode: async (id) => {
		const response = await api.post(`/tables/${id}/qr/regenerate`);
		return response.data;
	},

	// Bulk regenerate QR codes
	bulkRegenerateQRCodes: async (tableIds = null) => {
		const response = await api.post("/tables/qr/regenerate-all", {
			table_ids: tableIds,
		});
		return response.data;
	},

	// Get QR code preview
	getQRPreview: async (id) => {
		const response = await api.get(`/tables/${id}/qr/preview`);
		return response.data;
	},

	// Download QR code (PNG or PDF)
	downloadQRCode: async (id, format = "png") => {
		const response = await api.get(`/tables/${id}/qr/download`, {
			params: { format },
			responseType: "blob",
		});
		return response.data;
	},

	// Download all QR codes (ZIP or PDF)
	downloadAllQRCodes: async (format = "zip") => {
		const response = await api.get("/tables/qr/download-all", {
			params: { format },
			responseType: "blob",
		});
		return response.data;
	},

	// Filter tables by status, location, and search
	filterTables: (tables, filters) => {
		let filtered = [...tables];

		if (filters.status && filters.status !== "all") {
			filtered = filtered.filter(
				(table) => table.status === filters.status
			);
		}

		if (filters.location && filters.location !== "all") {
			filtered = filtered.filter(
				(table) => table.location === filters.location
			);
		}

		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				(table) =>
					table.table_number.toLowerCase().includes(searchLower) ||
					(table.location &&
						table.location.toLowerCase().includes(searchLower)) ||
					(table.description &&
						table.description.toLowerCase().includes(searchLower))
			);
		}

		return filtered;
	},

	sortTables: (tables, sortBy, sortOrder = "asc") => {
		return [...tables].sort((a, b) => {
			let aVal, bVal;

			switch (sortBy) {
				case "table_number":
					aVal = a.table_number;
					bVal = b.table_number;
					break;
				case "capacity":
					aVal = a.capacity;
					bVal = b.capacity;
					break;
				case "created_at":
					aVal = new Date(a.created_at);
					bVal = new Date(b.created_at);
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
			if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
			return 0;
		});
	},
};

export default tableService;
