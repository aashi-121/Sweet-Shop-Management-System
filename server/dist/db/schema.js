"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchases = exports.sweets = exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.users = (0, sqlite_core_1.sqliteTable)('users', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, sqlite_core_1.text)('email').notNull().unique(),
    password: (0, sqlite_core_1.text)('password').notNull(),
    role: (0, sqlite_core_1.text)('role').default('USER'), // USER or ADMIN
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
exports.sweets = (0, sqlite_core_1.sqliteTable)('sweets', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: (0, sqlite_core_1.text)('name').notNull(),
    category: (0, sqlite_core_1.text)('category').notNull(),
    price: (0, sqlite_core_1.real)('price').notNull(),
    quantity: (0, sqlite_core_1.integer)('quantity').notNull().default(0),
    image: (0, sqlite_core_1.text)('image'), // Optional image URL
    description: (0, sqlite_core_1.text)('description'), // History or description of the sweet
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: (0, sqlite_core_1.integer)('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});
exports.purchases = (0, sqlite_core_1.sqliteTable)('purchases', {
    id: (0, sqlite_core_1.text)('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: (0, sqlite_core_1.text)('user_id').notNull().references(() => exports.users.id),
    sweetId: (0, sqlite_core_1.text)('sweet_id').notNull().references(() => exports.sweets.id),
    quantity: (0, sqlite_core_1.integer)('quantity').notNull(),
    totalPrice: (0, sqlite_core_1.real)('total_price').notNull(),
    createdAt: (0, sqlite_core_1.integer)('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
