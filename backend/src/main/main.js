// src/main.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sequelize from "../config/database.js";
import tableRoutes from "../routes/table.routes.js";
import menuRoutes from "../routes/menu.routes.js";
import guestMenuRoutes from "../routes/guestMenu.routes.js";

//IMPORT CÁC MODELS
import Restaurant from "../models/restaurant.js";
import MenuCategory from "../models/menuCategory.js";
import MenuItem from "../models/menuItem.js";
import ModifierGroup from "../models/modifierGroup.js";
import ModifierOption from "../models/modifierOption.js";
import MenuItemPhoto from "../models/menuItemPhoto.js";
import MenuItemModifierGroup from "../models/menuItemModifierGroup.js";
import Table from "../models/table.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin/tables", tableRoutes);
app.use("/api/admin/menu", menuRoutes);

//Guest Routes
app.use("/api/menu", guestMenuRoutes);

// Test routes
app.get("/connected", (req, res) => {
	res.json({
		status: "OK",
		database: "Connected successfully",
		timestamp: new Date().toISOString(),
	});
});

// ✅ HÀM ĐỂ SETUP ASSOCIATIONS
const setupAssociations = () => {
	console.log("Setting up model associations...");

	// Tạo object chứa tất cả models
	const models = {
		Restaurant,
		MenuCategory,
		MenuItem,
		ModifierGroup,
		ModifierOption,
		MenuItemPhoto,
		MenuItemModifierGroup,
		Table, // Thêm nếu có
	};

	// Gọi hàm associate cho từng model
	Object.values(models).forEach((model) => {
		if (typeof model.associate === "function") {
			console.log(`  - Associating ${model.name}...`);
			model.associate(models);
		}
	});

	console.log("✅ All associations set up successfully!");
};

// Start server
async function startServer() {
	try {
		await sequelize.authenticate();
		console.log(">>> Database connected successfully");

		// ✅ GỌI HÀM SETUP ASSOCIATIONS TRƯỚC KHI SYNC
		setupAssociations();

		await sequelize.sync({ alter: true });
		console.log(">>> Database synced");

		app.listen(PORT, () => {
			console.log(`>>> Server running at http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error("Unable to start server:", error);
		process.exit(1);
	}
}

startServer();
