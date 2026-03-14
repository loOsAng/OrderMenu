import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminSessionCookieName, verifyAdminSessionValue } from "@/lib/auth";
import { createDish, deleteDish, updateDish, updateOrderStatus } from "@/lib/actions";
import { formatOrderStatus, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

function getStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700";
    case "COOKING":
      return "bg-sky-100 text-sky-700";
    case "READY":
      return "bg-emerald-100 text-emerald-700";
    case "CANCELLED":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default async function AdminPage() {
  const cookieStore = await cookies();

  if (!verifyAdminSessionValue(cookieStore.get(adminSessionCookieName)?.value)) {
    redirect("/admin/login");
  }

  if (process.env.NODE_ENV !== "production") {
    await ensureSeedData();
  }

  const [dishes, orders] = await Promise.all([
    prisma.dish.findMany({
      orderBy: [{ category: "asc" }, { createdAt: "asc" }],
    }),
    prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-lg shadow-slate-900/10">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin Dashboard</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">私房菜后台</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          这里可以新增菜品、改价格、上下架，还能直接看顾客订单和更新状态。顾客端和后台入口已经分开。
        </p>
        <form action="/admin/logout" method="post" className="mt-6">
          <button
            type="submit"
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
          >
            退出后台
          </button>
        </form>
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">新增菜品</h2>
              <p className="mt-2 text-sm text-slate-500">填完这张表，首页菜单会立刻同步更新。</p>
            </div>
          </div>

          <form action={createDish} className="mt-6 grid gap-4">
            <input
              name="name"
              placeholder="菜名"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              required
            />
            <input
              name="category"
              placeholder="分类，例如：主食 / 汤品 / 甜品"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              required
            />
            <input
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="价格，例如：16.80"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              required
            />
            <input
              name="imageUrl"
              placeholder="图片链接，可留空"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
            />
            <textarea
              name="description"
              placeholder="描述这道菜的口味、配料、份量"
              className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              required
            />

            <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input name="isAvailable" type="checkbox" defaultChecked className="h-4 w-4 accent-orange-500" />
              立即上架
            </label>

            <button
              type="submit"
              className="rounded-full bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              保存菜品
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">菜品管理</h2>
              <p className="mt-2 text-sm text-slate-500">
                当前共 {dishes.length} 道菜，改完后首页菜单和下单页都会直接读最新数据。
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {dishes.map((dish) => (
              <div key={dish.id} className="rounded-[1.75rem] border border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">{dish.category}</p>
                    <h3 className="text-lg font-semibold text-slate-900">{dish.name}</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      dish.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {dish.isAvailable ? "已上架" : "已下架"}
                  </span>
                </div>

                <form action={updateDish} className="grid gap-4">
                  <input type="hidden" name="id" value={dish.id} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      name="name"
                      defaultValue={dish.name}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
                      required
                    />
                    <input
                      name="category"
                      defaultValue={dish.category}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                    <input
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      defaultValue={(dish.priceCents / 100).toFixed(2)}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
                      required
                    />
                    <input
                      name="imageUrl"
                      defaultValue={dish.imageUrl ?? ""}
                      className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
                    />
                  </div>
                  <textarea
                    name="description"
                    defaultValue={dish.description}
                    className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
                    required
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                      <input
                        name="isAvailable"
                        type="checkbox"
                        defaultChecked={dish.isAvailable}
                        className="h-4 w-4 accent-orange-500"
                      />
                      菜品可售
                    </label>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
                      >
                        更新菜品
                      </button>
                      <button
                        type="submit"
                        formAction={deleteDish}
                        className="rounded-full border border-rose-200 px-5 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">订单管理</h2>
            <p className="mt-2 text-sm text-slate-500">这里会显示顾客提交的订单，可以手动切换状态。</p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {orders.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              目前还没有订单，先用首页点一单试试看。
            </div>
          ) : null}

          {orders.map((order) => (
            <div key={order.id} className="rounded-[1.75rem] border border-slate-200 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{order.customerName}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(order.status)}`}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {order.phone} · {new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(order.createdAt)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">备注：{order.note || "无"}</p>
                </div>

                <form action={updateOrderStatus} className="flex items-center gap-3">
                  <input type="hidden" name="id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="rounded-full border border-slate-200 px-4 py-3 text-sm outline-none ring-orange-200 transition focus:ring"
                  >
                    <option value="PENDING">待接单</option>
                    <option value="COOKING">制作中</option>
                    <option value="READY">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-full bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
                  >
                    更新状态
                  </button>
                </form>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-[1.25rem] bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.dishName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatPrice(item.unitPriceCents)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatPrice(item.unitPriceCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200 pt-4 text-right text-lg font-semibold text-slate-900">
                合计 {formatPrice(order.totalCents)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
