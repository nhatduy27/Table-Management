// src/services/menuService.js
import { adminApi, publicApi } from "../config/api.js";

const menuService = {
	// ============= Category Methods =============
	// Get all categories with items
	getCategories: async () => {
		try {
			const response = await adminApi.get("/menu/categories", {
				params: {
					include_items: true,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching categories:", error);
			throw error;
		}
	},

	// Create category
	createCategory: async (categoryData) => {
		try {
			const response = await adminApi.post(
				"/menu/categories",
				categoryData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating category:", error);
			throw error;
		}
	},

	// Update category
	updateCategory: async (id, updateData) => {
		try {
			const response = await adminApi.put(
				`/menu/categories/${id}`,
				updateData
			);
			return response.data;
		} catch (error) {
			console.error("Error updating category:", error);
			throw error;
		}
	},

	// Update category status
	updateCategoryStatus: async (id, status) => {
		try {
			const response = await adminApi.patch(
				`/menu/categories/${id}/status`,
				{ status }
			);
			return response.data;
		} catch (error) {
			console.error("Error updating category status:", error);
			throw error;
		}
	},

	// Delete category (soft delete)
	deleteCategory: async (id) => {
		try {
			const response = await adminApi.patch(
				`/menu/categories/${id}/delete`
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting category:", error);
			throw error;
		}
	},

	// ============= Item Methods =============
	// Get all items
	getAllItems: async (params = {}) => {
		try {
			const response = await adminApi.get("/menu/items", { params });
			return response.data;
		} catch (error) {
			console.error("Error fetching items:", error);
			throw error;
		}
	},

	// Get item by ID
	getItemById: async (id) => {
		try {
			const response = await adminApi.get(`/menu/items/${id}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching item:", error);
			throw error;
		}
	},

	// Create item
	createItem: async (itemData) => {
		try {
			const response = await adminApi.post("/menu/items", itemData);
			return response.data;
		} catch (error) {
			console.error("Error creating item:", error);
			throw error;
		}
	},

	// Update item
	updateItem: async (id, updateData) => {
		try {
			const response = await adminApi.put(
				`/menu/items/${id}`,
				updateData
			);
			return response.data;
		} catch (error) {
			console.error("Error updating item:", error);
			throw error;
		}
	},

	// Delete item
	deleteItem: async (id) => {
		try {
			const response = await adminApi.delete(`/menu/items/${id}`);
			return response.data;
		} catch (error) {
			console.error("Error deleting item:", error);
			throw error;
		}
	},

	// ============= Customer Menu Methods =============
	// Get active menu for customers
	getActiveMenu: async (restaurantId) => {
		try {
			// This endpoint might need to be created on backend
			// For now, we'll use getAllItems with filter
			const response = await publicApi.get("/menu/items", {
				params: {
					restaurant_id: restaurantId,
					status: "available",
				},
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching active menu:", error);
			throw error;
		}
	},

	// Get items by category (for customer view)
	getItemsByCategory: async (categoryId, params = {}) => {
		try {
			const response = await publicApi.get("/menu/items", {
				params: {
					category_id: categoryId,
					status: "available",
					...params,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching items by category:", error);
			throw error;
		}
	},

	// Search items
	searchItems: async (restaurantId, searchTerm, options = {}) => {
		try {
			const response = await publicApi.get("/menu/items", {
				params: {
					restaurant_id: restaurantId,
					search: searchTerm,
					...options,
				},
			});
			return response.data;
		} catch (error) {
			console.error("Error searching items:", error);
			throw error;
		}
	},

	// ============= Modifier Methods =============
	// Create modifier group
	createModifierGroup: async (groupData) => {
		try {
			const response = await adminApi.post(
				"/menu/modifier-groups",
				groupData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating modifier group:", error);
			throw error;
		}
	},

	// Update modifier group
	updateModifierGroup: async (id, updateData) => {
		try {
			const response = await adminApi.put(
				`/menu/modifier-groups/${id}`,
				updateData
			);
			return response.data;
		} catch (error) {
			console.error("Error updating modifier group:", error);
			throw error;
		}
	},

	// Create modifier option
	createModifierOption: async (groupId, optionData) => {
		try {
			const response = await adminApi.post(
				`/menu/modifier-groups/${groupId}/options`,
				optionData
			);
			return response.data;
		} catch (error) {
			console.error("Error creating modifier option:", error);
			throw error;
		}
	},

	// Update modifier option
	updateModifierOption: async (id, updateData) => {
		try {
			const response = await adminApi.put(
				`/menu/modifier-options/${id}`,
				updateData
			);
			return response.data;
		} catch (error) {
			console.error("Error updating modifier option:", error);
			throw error;
		}
	},

	// Attach modifier groups to item
	attachModifierGroups: async (itemId, groupIds) => {
		try {
			const response = await adminApi.post(
				`/menu/items/${itemId}/modifier-groups`,
				{
					groupIds: groupIds,
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error attaching modifier groups:", error);
			throw error;
		}
	},

	// Get all modifier groups
	getModifierGroups: async () => {
		try {
			const response = await adminApi.get("/menu/modifier-groups");
			return response.data;
		} catch (error) {
			console.error("Error fetching modifier groups:", error);
			throw error;
		}
	},

	// Get modifier group by ID
	getModifierGroupById: async (id) => {
		try {
			const response = await adminApi.get(`/menu/modifier-groups/${id}`);
			return response.data;
		} catch (error) {
			console.error("Error fetching modifier group:", error);
			throw error;
		}
	},

	// Delete modifier group
	deleteModifierGroup: async (id) => {
		try {
			const response = await adminApi.delete(
				`/menu/modifier-groups/${id}`
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting modifier group:", error);
			throw error;
		}
	},

	// Delete modifier option
	deleteModifierOption: async (id) => {
		try {
			const response = await adminApi.delete(
				`/menu/modifier-options/${id}`
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting modifier option:", error);
			throw error;
		}
	},

	// ============= Photo Methods =============
	// Upload photos for menu item
	uploadPhotos: async (itemId, files) => {
		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append("photos", file);
			});
			const response = await adminApi.post(
				`/menu/items/${itemId}/photos`,
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data;
		} catch (error) {
			console.error("Error uploading photos:", error);
			throw error;
		}
	},

	// Delete photo
	deletePhoto: async (itemId, photoId) => {
		try {
			const response = await adminApi.delete(
				`/menu/items/${itemId}/photos/${photoId}`
			);
			return response.data;
		} catch (error) {
			console.error("Error deleting photo:", error);
			throw error;
		}
	},

	// Set primary photo
	setPrimaryPhoto: async (itemId, photoId) => {
		try {
			const response = await adminApi.patch(
				`/menu/items/${itemId}/photos/${photoId}/primary`
			);
			return response.data;
		} catch (error) {
			console.error("Error setting primary photo:", error);
			throw error;
		}
	},

	// Get photos for menu item
	getItemPhotos: async (itemId) => {
		try {
			const response = await adminApi.get(`/menu/items/${itemId}/photos`);
			return response.data;
		} catch (error) {
			console.error("Error fetching photos:", error);
			throw error;
		}
	},
};

export default menuService;
