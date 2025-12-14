
import { db } from '../src/db';
import { users, sweets } from '../src/db/schema';

async function main() {
    console.log('--- USERS ---');
    const allUsers = await db.select().from(users);
    console.table(allUsers.map(u => ({ ...u, password: '[REDACTED]' })));

    console.log('\n--- SWEETS ---');
    const allSweets = await db.select().from(sweets);
    console.table(allSweets);
}

main().catch(console.error);
