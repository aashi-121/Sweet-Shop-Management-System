
import { db } from '../src/db';
import { users } from '../src/db/schema';

async function checkUsers() {
    const allUsers = await db.select().from(users);
    console.log('User count:', allUsers.length);
    console.log('Users:', allUsers);
}

checkUsers();
