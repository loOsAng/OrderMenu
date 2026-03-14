import { MenuClient } from "@/components/menu-client";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function Home() {
  if (process.env.NODE_ENV !== "production") {
    await ensureSeedData();
  }

  const dishes = await prisma.dish.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
      priceCents: true,
      imageUrl: true,
      isAvailable: true,
    },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
  });

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <MenuClient dishes={dishes} />
    </main>
  );
}
