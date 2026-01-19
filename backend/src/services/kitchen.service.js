// src/services/kitchenService.js
const updateOrderItemStatus = async (itemId, status) => {
    try {
        const response = await axios.put(`${API_URL}/kitchen/items/${itemId}/status`, { status });
        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || error.message };
    }
};

export default {
    updateOrderItemStatus
};