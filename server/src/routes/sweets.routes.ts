import { Router } from 'express';
import {
    getSweets,
    createSweet,
    updateSweet,
    deleteSweet,
    purchaseSweet,
    restockSweet,
    searchSweets,
    getPurchaseHistory
} from '../controllers/sweets.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public routes (if any) or Protected
router.use(authenticateToken); // Protect all routes below

router.get('/', getSweets);
router.get('/search', searchSweets);
router.get('/history', getPurchaseHistory); // New endpoint
router.post('/', requireAdmin, createSweet);
router.put('/:id', requireAdmin, updateSweet);
router.delete('/:id', requireAdmin, deleteSweet);
router.post('/:id/purchase', purchaseSweet); // User can purchase
router.post('/:id/restock', requireAdmin, restockSweet); // Admin only

export default router;
