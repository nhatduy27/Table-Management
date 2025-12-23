import express from 'express';
import { 
  getAllCategory, 
  createCategory, 
  updateCategory,
  updateCategoryStatus,
  deleteCategory
} from '../controllers/category.controller.js';
import {
  getAllItem,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/item.controller.js';

const router = express.Router();

// ============= Category CRUD Routes =============
// GET	/api/admin/menu/categories
router.get('/categories', getAllCategory);

//POST	/api/admin/menu/categories
router.post('/categories', createCategory);

//PUT	/api/admin/menu/categories/:id
router.put('/categories/:id',   updateCategory,);

//PATCH	/api/admin/menu/categories/:id/status
router.patch('/categories/:id/status', updateCategoryStatus);

//PATCH	/api/admin/categories/:id/delete
router.patch('/categories/:id/delete', deleteCategory);

// ============= iTEM Routes =============
// GET	/api/admin/menu/items
router.get('/items', getAllItem);

//GET	/api/admin/menu/items/:id
router.get('/items/:id', getItemById);

//POST	/api/admin/menu/items
router.post('/items', createItem);

// PUT	/api/admin/menu/items/:id
router.put('/items/:id', updateItem);

// DELETE	/api/admin/menu/items/:id
router.delete('/items/:id', deleteItem);



export default router;