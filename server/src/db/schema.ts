import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    role: text('role').default('USER'), // USER or ADMIN
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const sweets = sqliteTable('sweets', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    category: text('category').notNull(),
    price: real('price').notNull(),
    quantity: integer('quantity').notNull().default(0),
    image: text('image'), // Optional image URL
    description: text('description'), // History or description of the sweet
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()),
});

export const purchases = sqliteTable('purchases', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull().references(() => users.id),
    sweetId: text('sweet_id').notNull().references(() => sweets.id),
    quantity: integer('quantity').notNull(),
    totalPrice: real('total_price').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
