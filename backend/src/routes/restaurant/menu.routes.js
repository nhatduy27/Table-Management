import express from "express";
import {
  getAllCategory,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from "../../controllers/restaurant/category.controller.js";
import {
  getAllItem,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "../../controllers/restaurant/item.controller.js";

import {
  getAllModifierGroups,
  getModifierGroupById,
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
  createModifierOption,
  updateModifierOption,
  deleteModifierOption,
  attachModifierGroup,
} from "../../controllers/restaurant/modifier.controller.js";

import {
  uploadMenuItemPhotos,
  handleUploadErrors,
} from "../../middlewares/uploadMiddleware.js";

const router = express.Router();

// ============= Category CRUD Routes =============
// GET	/api/admin/menu/categories
router.get("/categories", getAllCategory);

//POST	/api/admin/menu/categories
router.post("/categories", createCategory);

//PUT	/api/admin/menu/categories/:id
router.put("/categories/:id", updateCategory);

//PATCH	/api/admin/menu/categories/:id/status
router.patch("/categories/:id/status", updateCategoryStatus);

//PATCH	/api/admin/menu/categories/:id/delete
router.patch("/categories/:id/delete", deleteCategory);

// ============= iTEM Routes =============
// GET	/api/admin/menu/items
router.get("/items", getAllItem);

//GET	/api/admin/menu/items/:id
router.get("/items/:id", getItemById);

//POST	/api/admin/menu/items (hỗ trợ cả JSON và multipart/form-data với photos)
router.post("/items", uploadMenuItemPhotos, handleUploadErrors, createItem);

// PUT	/api/admin/menu/items/:id
router.put("/items/:id", updateItem);

// DELETE	/api/admin/menu/items/:id
router.delete("/items/:id", deleteItem);

// ============= Modifier Routes =============
// GET /api/admin/menu/modifier-groups
router.get("/modifier-groups", getAllModifierGroups);

// GET /api/admin/menu/modifier-groups/:id
router.get("/modifier-groups/:id", getModifierGroupById);

//POST	/api/admin/menu/modifier-groups
router.post("/modifier-groups", createModifierGroup);

//PUT	/api/admin/menu/modifier-groups/:id
router.put("/modifier-groups/:id", updateModifierGroup);

// DELETE /api/admin/menu/modifier-groups/:id
router.delete("/modifier-groups/:id", deleteModifierGroup);

// POST	/api/admin/menu/modifier-groups/:id/options
router.post("/modifier-groups/:id/options", createModifierOption);

//PUT	/api/admin/menu/modifier-options/:id
router.put("/modifier-options/:id", updateModifierOption);

// DELETE /api/admin/menu/modifier-options/:id
router.delete("/modifier-options/:id", deleteModifierOption);

//POST	/api/admin/menu/items/:id/modifier-groups
router.post("/items/:id/modifier-groups", attachModifierGroup);

export default router;
