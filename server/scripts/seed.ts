import { db } from '../src/db';
import { sweets } from '../src/db/schema';
import { eq } from 'drizzle-orm';

const indianSweets = [
    {
        name: 'Cadbury Dairy Milk',
        category: 'Chocolate',
        price: 45.00,
        quantity: 100,
        image: '/sweets/dairy_milk.png',
        description: "Launched in India in 1948, Cadbury Dairy Milk has become the gold standard of chocolates in the country. It is synonymous with 'meetha' (sweet) for millions of Indians, often marking the start of something good ('Kuch Meetha Ho Jaye')."
    },
    {
        name: 'Cadbury 5 Star',
        category: 'Chocolate',
        price: 20.00,
        quantity: 150,
        image: '/sweets/five_star.png',
        description: "Introduced in 1969, 5 Star was the first chocolate bar to be launched by Cadbury in India. Its unique combination of chocolate, caramel, and nougat has made it a favorite for generations."
    },
    {
        name: 'Nestle Munch',
        category: 'Wafer',
        price: 10.00,
        quantity: 200,
        image: '/sweets/munch.png',
        description: "Munch is India's most loved wafer bar. Launched in 1999, it offers a crunchy treat that has captured the hearts of the youth with its 'Mera Munch Mahaan' campaigns."
    },
    {
        name: 'Nestle KitKat',
        category: 'Wafer',
        price: 25.00,
        quantity: 120,
        image: '/sweets/kitkat.png',
        description: "KitKat, with its iconic 'Have a break' tagline, was launched in India in 1995. Its perfect balance of wafer and chocolate makes it a global favorite with a strong Indian presence."
    },
    {
        name: 'Cadbury Gems',
        category: 'Candy',
        price: 5.00,
        quantity: 300,
        image: '/sweets/gems.png',
        description: "Gems, the colorful button chocolates, have been a childhood favorite since their launch in 1989. They are often associated with fun, vibrancy, and nostalgia."
    },
    {
        name: 'Amul Dark Chocolate',
        category: 'Dark Chocolate',
        price: 150.00,
        quantity: 50,
        image: '/sweets/amul_dark.png',
        description: "Amul, 'The Taste of India', entered the chocolate market in the 1970s. Their Dark Chocolate is made with the finest cocoa beans and is a treat for true chocolate connoisseurs."
    },
    {
        name: 'Ferrero Rocher (4pcs)',
        category: 'Premium',
        price: 149.00,
        quantity: 40,
        image: 'https://placehold.co/600x400?text=Ferrero+Rocher',
        description: "While Italian, Ferrero Rocher has become the ultimate gift for Indian festivals and weddings. It represents luxury and fine taste in the Indian market."
    },
    {
        name: 'Parle Melody',
        category: 'Toffee',
        price: 2.00,
        quantity: 500,
        image: 'https://placehold.co/600x400?text=Parle+Melody',
        description: "'Melody itni chocolaty kyun hai?' (Why is Melody so chocolaty?) - This iconic tagline from the 80s made Melody a household name. It is a caramel toffee with a rich creamy center."
    }
];

async function seed() {
    console.log('Seeding Indian Sweets...');
    try {
        // Upsert logic to preserve Foreign Keys (Purchases)
        for (const sweet of indianSweets) {
            const existing = await db.select().from(sweets).where(eq(sweets.name, sweet.name)).get();

            if (existing) {
                console.log(`Updating ${sweet.name}...`);
                await db.update(sweets)
                    .set({
                        image: sweet.image,
                        description: sweet.description,
                        price: sweet.price,
                        category: sweet.category,
                        quantity: sweet.quantity // Optional: Reset quantity or keep? Let's reset for stock.
                    })
                    .where(eq(sweets.id, existing.id));
            } else {
                console.log(`Inserting ${sweet.name}...`);
                await db.insert(sweets).values(sweet);
            }
        }
        console.log(`Seeding complete! Processed ${indianSweets.length} items.`);
    } catch (e) {
        console.error('Seeding failed:', e);
    }
}

seed();
