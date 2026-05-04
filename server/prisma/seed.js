const prisma = require("../lib/prisma");

async function main() {
  const plans = [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Basic",
      price: 0,
      features: {
        forecast: false,
        addUser: false,
        maxWarehouses: 1,
      },
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
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
