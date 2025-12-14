"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sweets_controller_1 = require("../controllers/sweets.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (if any) or Protected
router.use(auth_middleware_1.authenticateToken); // Protect all routes below
router.get('/', sweets_controller_1.getSweets);
router.get('/search', sweets_controller_1.searchSweets);
router.get('/history', sweets_controller_1.getPurchaseHistory); // New endpoint
router.post('/', auth_middleware_1.requireAdmin, sweets_controller_1.createSweet);
router.put('/:id', auth_middleware_1.requireAdmin, sweets_controller_1.updateSweet);
router.delete('/:id', auth_middleware_1.requireAdmin, sweets_controller_1.deleteSweet);
router.post('/:id/purchase', sweets_controller_1.purchaseSweet); // User can purchase
router.post('/:id/restock', auth_middleware_1.requireAdmin, sweets_controller_1.restockSweet); // Admin only
exports.default = router;
