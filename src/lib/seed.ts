import { prisma } from "@/lib/prisma";

const seedDishes = [
  {
    name: "酸甜排骨饭",
    category: "招牌主食",
    description: "糖醋风味，搭配时蔬和米饭，适合作为一人份正餐。",
    priceCents: 1800,
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
  },
  {
    name: "番茄滑蛋盖饭",
    category: "招牌主食",
    description: "酸甜番茄配嫩滑鸡蛋，清爽下饭。",
    priceCents: 1200,
    imageUrl:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
  },
  {
    name: "香煎鸡腿便当",
    category: "人气便当",
    description: "带微焦香气的鸡腿排，适合想吃得饱一点的时候。",
    priceCents: 1680,
    imageUrl:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
  },
  {
    name: "蒜香西兰花",
    category: "小菜",
    description: "现炒时蔬，适合搭配主食加点清爽口感。",
    priceCents: 880,
    imageUrl:
      "https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
  },
  {
    name: "冬瓜老火汤",
    category: "汤品",
    description: "清甜不腻，适合配饭或单独加单。",
    priceCents: 650,
    imageUrl:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
  },
  {
    name: "杨枝甘露",
    category: "甜品饮品",
    description: "芒果、西米和柚子组合，适合饭后。",
    priceCents: 980,
    imageUrl:
      "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=900&q=80",
    isAvailable: false,
  },
];

export async function ensureSeedData() {
  const count = await prisma.dish.count();

  if (count > 0) {
    return;
  }

  await prisma.dish.createMany({
    data: seedDishes,
  });
}
