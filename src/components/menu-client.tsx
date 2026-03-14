"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { formatPrice } from "@/lib/format";

const CART_KEY = "menu-cart";

type Dish = {
  id: string;
  name: string;
  category: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
};

type CartItem = {
  dishId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

function readCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  const raw = window.localStorage.getItem(CART_KEY);

  if (!raw) {
    return [] as CartItem[];
  }

  try {
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [] as CartItem[];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function MenuClient({ dishes }: { dishes: Dish[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    setCart(readCart());
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(dishes.map((dish) => dish.category)));
  }, [dishes]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

  function changeQuantity(dish: Dish, delta: number) {
    const existing = readCart();
    const current = existing.find((item) => item.dishId === dish.id);
    const nextQuantity = Math.max(0, (current?.quantity ?? 0) + delta);
    const nextCart = existing
      .map((item) =>
        item.dishId === dish.id
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    if (!current && delta > 0) {
      nextCart.push({
        dishId: dish.id,
        name: dish.name,
        priceCents: dish.priceCents,
        quantity: 1,
      });
    }

    writeCart(nextCart);
    setCart(nextCart);
  }

  function getQuantity(dishId: string) {
    return cart.find((item) => item.dishId === dishId)?.quantity ?? 0;
  }

  return (
    <div className="pb-32">
      <section className="rounded-[2rem] bg-linear-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-8 text-white shadow-lg shadow-orange-500/20">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-orange-100">Home Kitchen</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">朋友点单菜单</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-orange-50 sm:text-base">
          像外卖一样浏览菜单、加入购物车、写备注下单。这个链接只负责点单，后台管理入口已经单独分开。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white/15 px-4 py-2">今日现做</span>
          <span className="rounded-full bg-white/15 px-4 py-2">可备注忌口</span>
          <span className="rounded-full bg-white/15 px-4 py-2">支持后台改价</span>
        </div>
      </section>

      <section className="mt-10 flex flex-wrap gap-3">
        {categories.map((category) => (
          <a
            key={category}
            href={`#${encodeURIComponent(category)}`}
            className="rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-orange-600 transition hover:border-orange-300 hover:bg-orange-50"
          >
            {category}
          </a>
        ))}
      </section>

      <div className="mt-10 space-y-10">
        {categories.map((category) => (
          <section key={category} id={encodeURIComponent(category)} className="scroll-mt-24">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">{category}</h2>
                <p className="mt-1 text-sm text-slate-500">支持加购、备注口味，提交后你会拿到自己的订单状态页。</p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {dishes
                .filter((dish) => dish.category === category)
                .map((dish) => {
                  const quantity = getQuantity(dish.id);

                  return (
                    <article
                      key={dish.id}
                      className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="aspect-[4/3] bg-slate-100">
                        {dish.imageUrl ? (
                          <Image
                            src={dish.imageUrl}
                            alt={dish.name}
                            width={900}
                            height={675}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">暂无图片</div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{dish.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{dish.description}</p>
                          </div>
                          {!dish.isAvailable ? (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                              售罄
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-5 flex items-center justify-between">
                          <div className="text-lg font-semibold text-slate-900">{formatPrice(dish.priceCents)}</div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                              onClick={() => changeQuantity(dish, -1)}
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <span className="min-w-6 text-center text-sm font-medium text-slate-700">{quantity}</span>
                            <button
                              type="button"
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-lg text-white disabled:cursor-not-allowed disabled:bg-slate-200"
                              onClick={() => changeQuantity(dish, 1)}
                              disabled={!dish.isAvailable}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm text-slate-500">购物车</p>
            <p className="text-lg font-semibold text-slate-900">
              {totalItems} 份菜品 · {formatPrice(totalPrice)}
            </p>
          </div>
          <Link
            href="/checkout"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            去下单
          </Link>
        </div>
      </div>
    </div>
  );
}
