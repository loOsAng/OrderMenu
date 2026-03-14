import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type OrderRequest = {
  customerName?: string;
  phone?: string;
  note?: string;
  items?: Array<{
    dishId?: string;
    quantity?: number;
  }>;
};

export async function POST(request: Request) {
  const body = (await request.json()) as OrderRequest;
  const customerName = body.customerName?.trim();
  const phone = body.phone?.trim();
  const note = body.note?.trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!customerName || !phone || items.length === 0) {
    return NextResponse.json({ error: "订单信息不完整" }, { status: 400 });
  }

  const groupedItems = new Map<string, number>();

  for (const item of items) {
    if (!item.dishId || !item.quantity || item.quantity <= 0) {
      return NextResponse.json({ error: "订单菜品无效" }, { status: 400 });
    }

    groupedItems.set(item.dishId, (groupedItems.get(item.dishId) ?? 0) + item.quantity);
  }

  const dishes = await prisma.dish.findMany({
    where: {
      id: {
        in: Array.from(groupedItems.keys()),
      },
      isAvailable: true,
    },
  });

  if (dishes.length !== groupedItems.size) {
    return NextResponse.json({ error: "有菜品已下架或不存在，请刷新菜单后重试" }, { status: 400 });
  }

  const orderItems = dishes.map((dish) => ({
    dishId: dish.id,
    dishName: dish.name,
    unitPriceCents: dish.priceCents,
    quantity: groupedItems.get(dish.id) ?? 1,
  }));

  const totalCents = orderItems.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );

  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      note: note || null,
      totalCents,
      items: {
        create: orderItems,
      },
    },
  });

  return NextResponse.json({ orderId: order.id });
}
