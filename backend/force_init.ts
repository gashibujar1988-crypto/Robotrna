import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Forcing robot creation for demo@robotrna.com...');

    const user = await prisma.user.findUnique({
        where: { email: 'demo@robotrna.com' },
    });

    if (!user) {
        console.error('Demo user not found!');
        process.exit(1);
    }

    console.log(`Found user: ${user.id}`);

    const count = await prisma.robot.count({ where: { userId: user.id } });
    console.log(`Current robot count: ${count}`);

    if (count === 0) {
        console.log('Creating robots one by one (SQLite compat)...');
        await prisma.robot.create({ data: { name: "Soshie", type: "social", status: "idle", userId: user.id } });
        await prisma.robot.create({ data: { name: "Brainy", type: "research", status: "idle", userId: user.id } });
        await prisma.robot.create({ data: { name: "Dexter", type: "admin", status: "idle", userId: user.id } });
        console.log('Robots created successfully.');
    } else {
        console.log('Robots already exist.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
