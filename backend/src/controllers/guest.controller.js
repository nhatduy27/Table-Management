import * as guestService from "../services/guest.service.js";

const getGuestMenu = async (req, res) => {
	try {
		const {
			table,
			q,
			categoryId,
			sort,
			chefRecommended,
			page = 1,
			limit = 10,
		} = req.query;

		if (!table) {
			return res.status(400).json({
				success: false,
				message: "table is required",
			});
		}

		if (table) {
			const foundTable = await guestService.getTableById(table);
			if (!foundTable) {
				return res.status(404).json({
					success: false,
					message: "Table not found",
				});
			}
		}

		const result = await guestService.getGuestMenu({
			search: q,
			categoryId,
			sort,
			chefRecommended: chefRecommended === "true",
			page: parseInt(page),
			limit: parseInt(limit),
		});

		return res.status(200).json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error("Error fetching guest menu:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};

export { getGuestMenu };
