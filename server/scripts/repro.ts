
import { db } from '../src/db';
import { sweets, users, purchases } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function run() {
    try {
        console.log('--- checking users ---');
        const allUsers = await db.select().from(users);
        if (allUsers.length === 0) {
            console.log('No users found! Creating one...');
            const [newUser] = await db.insert(users).values({
                email: 'test@example.com',
                password: 'hashedpassword',
                role: 'USER'
            }).returning();
            allUsers.push(newUser);
        }
        const user = allUsers[0];
        console.log('User:', user);

        console.log('--- checking sweets ---');
        const allSweets = await db.select().from(sweets);
        const sweet = allSweets.find(s => s.quantity > 0);
        if (!sweet) {
            console.error('No sweets with stock found!');
            return;
        }
        console.log('Sweet:', sweet);

        console.log('--- Attempting Manual Transaction (Simulation) ---');
        // This mimics exactly what the controller does
        db.transaction((tx) => {
            console.log('Updating sweet quantity...');
            tx.update(sweets)
                .set({ quantity: sweet.quantity - 1 })
                .where(eq(sweets.id, sweet.id))
                .run();

            console.log('Inserting purchase...');
            // We manually insert to see if this throws
            const purchaseValues = {
                userId: user.id,
                sweetId: sweet.id,
                quantity: 1,
                totalPrice: sweet.price
            };
            console.log('Values:', purchaseValues);

            tx.insert(purchases).values(purchaseValues).run();
            console.log('Purchase inserted (verified via select later)');
        });

        console.log('Transaction successful!');

        console.log('--- Verifying Purchase Date ---');
        const allPurchases = await db.select().from(purchases);
        console.log('All Purchases:', allPurchases);

    } catch (e) {
        console.error('CRASHED:', e);
    }
}

run();
