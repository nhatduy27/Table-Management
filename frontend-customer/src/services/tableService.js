// src/services/tableService.js
import { adminApi, publicApi } from "../config/api";

const tableService = {
  // Get all tables
  getAllTables: async () => {
    const response = await adminApi.get("/tables");
    return response.data;
  },

  // Get table by ID
  getTableById: async (id) => {
    const response = await adminApi.get(`/tables/${id}`);
    return response.data;
  },

  getTableNumberById: async (id) => {
    const response = await publicApi.get(`/public/name/${id}`);
    return response.data;
  },

  // Verify QR code token (public endpoint)
  verifyQRToken: async (tableId, token, filters = {}) => {
    const params = { table: tableId, token };

    // Thêm các filter params nếu có
    if (filters.q) params.q = filters.q;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.chefRecommended)
      params.chefRecommended = filters.chefRecommended;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await publicApi.get("/menu", { params });
    return response.data;
  },

  // Lấy menu với filters (sử dụng token đã lưu)
  getMenuWithFilters: async (tableId, token, filters = {}) => {
    const params = { table: tableId, token };

    if (filters.q) params.q = filters.q;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.chefRecommended)
      params.chefRecommended = filters.chefRecommended;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await publicApi.get("/menu", { params });
    return response.data;
  },

  // Filter tables by status, location, and search (client-side)
  filterTables: (tables, filters) => {
    let filtered = [...tables];

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((table) => table.status === filters.status);
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(
        (table) => table.location === filters.location,
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
            table.description.toLowerCase().includes(searchLower)),
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