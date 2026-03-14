import Link from "next/link";
import { notFound } from "next/navigation";

import { formatOrderStatus, formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">订单已提交</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">谢谢，你的订单已经收到</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              你可以把这个页面保留着，后面直接看我更新的制作进度。
            </p>
          </div>
          <span
            className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusClasses(order.status)}`}
          >
            {formatOrderStatus(order.status)}
          </span>
        </div>

        <div className="mt-8 grid gap-4 rounded-[1.5rem] bg-slate-50 p-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">下单人</p>
            <p className="mt-1 font-medium text-slate-900">{order.customerName}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">联系方式</p>
            <p className="mt-1 font-medium text-slate-900">{order.phone}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">订单编号</p>
            <p className="mt-1 break-all text-sm font-medium text-slate-900">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">备注</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{order.note || "无"}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">点的菜</h2>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-[1.5rem] border border-slate-200 px-4 py-4"
              >
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
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6">
          <div>
            <p className="text-sm text-slate-500">合计</p>
            <p className="text-2xl font-semibold text-slate-900">{formatPrice(order.totalCents)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              继续点菜
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
