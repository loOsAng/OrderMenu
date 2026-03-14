"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { formatPrice } from "@/lib/format";

const CART_KEY = "menu-cart";

type CartItem = {
  dishId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

function loadCart() {
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

export function CheckoutClient() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCart(loadCart());
  }, []);

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  }, [cart]);

  function updateQuantity(dishId: string, delta: number) {
    const nextCart = loadCart()
      .map((item) =>
        item.dishId === dishId
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
            }
          : item,
      )
      .filter((item) => item.quantity > 0);

    window.localStorage.setItem(CART_KEY, JSON.stringify(nextCart));
    setCart(nextCart);
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!customerName.trim() || !phone.trim()) {
      setError("请填写姓名和联系方式");
      return;
    }

    if (cart.length === 0) {
      setError("购物车还是空的，先选几道菜吧");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          phone,
          note,
          items: cart.map((item) => ({
            dishId: item.dishId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { error?: string; orderId?: string };

      if (!response.ok || !data.orderId) {
        throw new Error(data.error ?? "下单失败，请稍后再试");
      }

      window.localStorage.removeItem(CART_KEY);
      router.push(`/orders/${data.orderId}`);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "下单失败，请稍后再试",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">购物车还是空的</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">先回菜单页挑几道菜，再回来提交订单。</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-orange-600"
        >
          返回菜单
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={submitOrder} className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">提交订单</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          填一下姓名、联系方式和备注，我这边就能在后台收到并更新订单状态。
        </p>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            你的名字
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              placeholder="比如：小林"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            联系方式
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              placeholder="微信 / 电话"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            备注
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              placeholder="少辣、不要香菜、几点来拿都可以写"
            />
          </label>
        </div>

        {error ? (
          <div className="mt-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
        ) : null}

        <div className="mt-8 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? "正在下单..." : "确认下单"}
          </button>
          <Link
            href="/"
            className="rounded-full border border-orange-200 px-6 py-3 text-sm font-medium text-orange-600 transition hover:border-orange-300 hover:bg-orange-50"
          >
            返回加菜
          </Link>
        </div>
      </form>

      <aside className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm">
        <h2 className="text-xl font-semibold">订单明细</h2>
        <div className="mt-6 space-y-4">
          {cart.map((item) => (
            <div
              key={item.dishId}
              className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="mt-1 text-sm text-slate-300">{formatPrice(item.priceCents)} / 份</p>
                </div>
                <p className="font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.dishId, -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-lg"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.dishId, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-slate-900"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>共 {cart.reduce((sum, item) => sum + item.quantity, 0)} 份</span>
            <span>现做出餐</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-2xl font-semibold">
            <span>合计</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
