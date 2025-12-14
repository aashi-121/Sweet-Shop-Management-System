"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restockSweet = exports.getPurchaseHistory = exports.purchaseSweet = exports.deleteSweet = exports.updateSweet = exports.createSweet = exports.getSweetById = exports.searchSweets = exports.getSweets = void 0;
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const zod_1 = require("zod");
const sweetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    category: zod_1.z.string().min(1),
    price: zod_1.z.number().positive(),
    quantity: zod_1.z.number().int().nonnegative(),
});
const updateSweetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    category: zod_1.z.string().min(1).optional(),
    price: zod_1.z.number().positive().optional(),
    quantity: zod_1.z.number().int().nonnegative().optional(),
});
const getSweets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.db.select().from(schema_1.sweets);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getSweets = getSweets;
const searchSweets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category, minPrice, maxPrice } = req.query;
        const filters = [];
        if (name)
            filters.push((0, drizzle_orm_1.like)(schema_1.sweets.name, `%${name}%`));
        if (category)
            filters.push((0, drizzle_orm_1.like)(schema_1.sweets.category, `%${category}%`));
        if (minPrice)
            filters.push((0, drizzle_orm_1.gte)(schema_1.sweets.price, Number(minPrice)));
        if (maxPrice)
            filters.push((0, drizzle_orm_1.lte)(schema_1.sweets.price, Number(maxPrice)));
        const result = yield db_1.db.select().from(schema_1.sweets)
            .where((0, drizzle_orm_1.and)(...filters));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.searchSweets = searchSweets;
const getSweetById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const sweet = yield db_1.db.select().from(schema_1.sweets).where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id)).get();
        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json(sweet);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getSweetById = getSweetById;
const createSweet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = sweetSchema.parse(req.body);
        const [newSweet] = yield db_1.db.insert(schema_1.sweets).values(data).returning();
        res.status(201).json(newSweet);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createSweet = createSweet;
const updateSweet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const data = updateSweetSchema.parse(req.body);
        const [updatedSweet] = yield db_1.db.update(schema_1.sweets)
            .set(Object.assign(Object.assign({}, data), { updatedAt: new Date() }))
            .where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id))
            .returning();
        if (!updatedSweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json(updatedSweet);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.issues });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateSweet = updateSweet;
const deleteSweet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield db_1.db.delete(schema_1.sweets).where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id)).returning();
        if (!result.length) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        res.json({ message: 'Sweet deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteSweet = deleteSweet;
const purchaseSweet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const sweet = yield db_1.db.select().from(schema_1.sweets).where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id)).get();
        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        if (sweet.quantity < 1) {
            return res.status(400).json({ error: 'Out of stock' });
        }
        const userId = req.user.userId;
        // Verify user exists (handling case where token is valid but DB was reset)
        const user = yield db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, userId)).get();
        if (!user) {
            return res.status(401).json({ error: 'User validation failed. Please login again.' });
        }
        // Transaction to ensure atomicity
        db_1.db.transaction((tx) => {
            tx.update(schema_1.sweets)
                .set({ quantity: sweet.quantity - 1 })
                .where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id))
                .run();
            // Record purchase
            tx.insert(schema_1.purchases).values({
                userId,
                sweetId: id,
                quantity: 1,
                totalPrice: sweet.price // * 1
            }).run();
        });
        res.json({ message: 'Purchase successful' });
    }
    catch (error) {
        console.error('Purchase failed:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.purchaseSweet = purchaseSweet;
const getPurchaseHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.userId;
        const history = yield db_1.db.select({
            id: schema_1.purchases.id,
            sweetName: schema_1.sweets.name,
            totalPrice: schema_1.purchases.totalPrice,
            quantity: schema_1.purchases.quantity,
            createdAt: schema_1.purchases.createdAt
        })
            .from(schema_1.purchases)
            .leftJoin(schema_1.sweets, (0, drizzle_orm_1.eq)(schema_1.purchases.sweetId, schema_1.sweets.id))
            .where((0, drizzle_orm_1.eq)(schema_1.purchases.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.purchases.createdAt));
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getPurchaseHistory = getPurchaseHistory;
const restockSweet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { quantity } = req.body; // Expecting { quantity: number } to add
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ error: 'Invalid quantity' });
        }
        const sweet = yield db_1.db.select().from(schema_1.sweets).where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id)).get();
        if (!sweet) {
            return res.status(404).json({ error: 'Sweet not found' });
        }
        const [updatedSweet] = yield db_1.db.update(schema_1.sweets)
            .set({ quantity: sweet.quantity + quantity, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.sweets.id, id))
            .returning();
        res.json(updatedSweet);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.restockSweet = restockSweet;
