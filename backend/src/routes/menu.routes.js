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

import { 
  createModifierGroup,
  updateModifierGroup,
  createModifierOption,
  updateModifierOption,
  attachModifierGroup
} from '../controllers/modifier.controller.js';

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

// ============= Modifier Routes =============
//POST	/api/admin/menu/modifier-groups
router.post('/modifier-groups', createModifierGroup);

// POST	/api/admin/menu/modifier-groups/:id/options
router.post('/modifier-groups/:id/options', createModifierOption);

//PUT	/api/admin/menu/modifier-groups/:id
router.put('/modifier-groups/:id', updateModifierGroup);

//PUT	/api/admin/menu/modifier-options/:id
router.put('/modifier-options/:id', updateModifierOption);

//POST	/api/admin/menu/items/:id/modifier-groups
router.post('/items/:id/modifier-groups', attachModifierGroup);

export default router;