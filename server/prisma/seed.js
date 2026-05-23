const prisma = require("../lib/prisma");

async function main() {
  const plans = [
    {
      id: "c0de0000-0000-4000-8000-000000000001",
      name: "Basic",
      price: 0,
      features: {
        forecast: false,
        addUser: false,
        maxWarehouses: 1,
      },
    },
    {
      id: "c0de0000-0000-4000-8000-000000000002",
      name: "Pro",
      price: 99000,
      features: {
        forecast: true,
        addUser: true,
        maxWarehouses: 5,
      },
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: {
        name: plan.name,
        price: plan.price,
        features: plan.features,
      },
      create: plan,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
