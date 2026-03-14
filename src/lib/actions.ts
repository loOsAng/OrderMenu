"use server";

import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/auth";
import { parsePriceInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function getStringValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function requireAdminSession() {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(adminSessionCookieName)?.value;

  if (!verifyAdminSessionValue(sessionValue)) {
    redirect("/admin/login");
  }
}

export async function createDish(formData: FormData) {
  await requireAdminSession();

  const name = getStringValue(formData, "name");
  const category = getStringValue(formData, "category");
  const description = getStringValue(formData, "description");
  const imageUrl = getStringValue(formData, "imageUrl");
  const price = getStringValue(formData, "price");
  const isAvailable = formData.get("isAvailable") === "on";

  if (!name || !category || !description) {
    throw new Error("菜品名称、分类和描述不能为空");
  }

  await prisma.dish.create({
    data: {
      name,
      category,
      description,
      imageUrl: imageUrl || null,
      priceCents: parsePriceInput(price),
      isAvailable,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateDish(formData: FormData) {
  await requireAdminSession();

  const id = getStringValue(formData, "id");
  const name = getStringValue(formData, "name");
  const category = getStringValue(formData, "category");
  const description = getStringValue(formData, "description");
  const imageUrl = getStringValue(formData, "imageUrl");
  const price = getStringValue(formData, "price");
  const isAvailable = formData.get("isAvailable") === "on";

  if (!id || !name || !category || !description) {
    throw new Error("菜品信息不完整");
  }

  await prisma.dish.update({
    where: { id },
    data: {
      name,
      category,
      description,
      imageUrl: imageUrl || null,
      priceCents: parsePriceInput(price),
      isAvailable,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function deleteDish(formData: FormData) {
  await requireAdminSession();

  const id = getStringValue(formData, "id");

  if (!id) {
    throw new Error("缺少菜品 ID");
  }

  await prisma.dish.delete({
    where: { id },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdminSession();

  const id = getStringValue(formData, "id");
  const status = getStringValue(formData, "status");

  if (!id || !Object.values(OrderStatus).includes(status as OrderStatus)) {
    throw new Error("订单状态无效");
  }

  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/orders/${id}`);
}
