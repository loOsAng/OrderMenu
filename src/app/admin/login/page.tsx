import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  adminSessionCookieName,
  createAdminSessionValue,
  getAdminSessionCookieOptions,
  verifyAdminPassword,
  verifyAdminSessionValue,
} from "@/lib/auth";

async function loginAdmin(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "").trim();

  if (!verifyAdminPassword(password)) {
    redirect("/admin/login?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(
    adminSessionCookieName,
    createAdminSessionValue(),
    getAdminSessionCookieOptions(),
  );

  redirect("/admin");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);

  if (verifyAdminSessionValue(cookieStore.get(adminSessionCookieName)?.value)) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin Only</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">后台登录</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          这个入口只给你自己使用。顾客只需要首页点单链接，不需要知道后台地址。
        </p>

        <form action={loginAdmin} className="mt-8 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            后台密码
            <input
              name="password"
              type="password"
              placeholder="输入你自己设置的后台密码"
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-orange-200 transition focus:ring"
              required
            />
          </label>

          {params.error ? (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">密码不对，请重试。</div>
          ) : null}

          <button
            type="submit"
            className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            进入后台
          </button>
        </form>
      </div>
    </main>
  );
}
