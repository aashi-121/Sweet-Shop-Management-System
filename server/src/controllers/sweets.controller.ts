import { Request, Response } from 'express';
import { db } from '../db';
import { sweets, purchases, users } from '../db/schema';
import { eq, like, gte, lte, and, gt, lt, desc } from 'drizzle-orm';
import { z } from 'zod';

const sweetSchema = z.object({
    name: z.string().min(1),
    category: z.string().min(1),
    price: z.number().positive(),
    quantity: z.number().int().nonnegative(),
});

const updateSweetSchema = z.object({
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    quantity: z.number().int().nonnegative().optional(),
});

export const getSweets = async (req: Request, res: Response) => {
    try {
        const result = await db.select().from(sweets);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const searchSweets = async (req: Request, res: Response) => {
    try {
        const { name, category, minPrice, maxPrice } = req.query;

        const filters = [];
        if (name) filters.push(like(sweets.name, `%${name}%`));
        if (category) filters.push(like(sweets.category, `%${category}%`));
        if (minPrice) filters.push(gte(sweets.price, Number(minPrice)));
        if (maxPrice) filters.push(lte(sweets.price, Number(maxPrice)));

        const result = await db.select().from(sweets)
            .where(and(...filters));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getSweetById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sweet = await db.select().from(sweets).where(eq(sweets.id, id)).get();
        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json(sweet);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createSweet = async (req: Request, res: Response) => {
    try {
        const data = sweetSchema.parse(req.body);
        const [newSweet] = await db.insert(sweets).values(data).returning();
        res.status(201).json(newSweet);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateSweet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = updateSweetSchema.parse(req.body);

        const [updatedSweet] = await db.update(sweets)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(sweets.id, id))
            .returning();

        if (!updatedSweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json(updatedSweet);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteSweet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const result = await db.delete(sweets).where(eq(sweets.id, id)).returning();
        if (!result.length) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json({ message: 'Sweet deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const purchaseSweet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const sweet = await db.select().from(sweets).where(eq(sweets.id, id)).get();

        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }

        if (sweet.quantity < 1) {
            return res.status(400).json({ error: 'Out of stock' });
        }

        const userId = (req as any).user.userId;

        // Verify user exists (handling case where token is valid but DB was reset)
        const user = await db.select().from(users).where(eq(users.id, userId)).get();
        if (!user) {
            return res.status(401).json({ error: 'User validation failed. Please login again.' });
        }

        // Transaction to ensure atomicity
        db.transaction((tx) => {
            tx.update(sweets)
                .set({ quantity: sweet.quantity - 1 })
                .where(eq(sweets.id, id))
                .run();

            // Record purchase
            tx.insert(purchases).values({
                userId,
                sweetId: id,
                quantity: 1,
                totalPrice: sweet.price // * 1
            }).run();
        });

        res.json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getPurchaseHistory = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.userId;

        const history = await db.select({
            id: purchases.id,
            sweetName: sweets.name,
            totalPrice: purchases.totalPrice,
            quantity: purchases.quantity,
            createdAt: purchases.createdAt
        })
            .from(purchases)
            .leftJoin(sweets, eq(purchases.sweetId, sweets.id))
            .where(eq(purchases.userId, userId))
            .orderBy(desc(purchases.createdAt));

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const restockSweet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // Expecting { quantity: number } to add

        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }

        const sweet = await db.select().from(sweets).where(eq(sweets.id, id)).get();
        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }

        const [updatedSweet] = await db.update(sweets)
            .set({ quantity: sweet.quantity + quantity, updatedAt: new Date() })
            .where(eq(sweets.id, id))
            .returning();

        res.json(updatedSweet);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
