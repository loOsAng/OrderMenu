export function formatPrice(priceCents: number) {
  return `RM ${(priceCents / 100).toFixed(2)}`;
}

export function parsePriceInput(input: string) {
  const normalized = Number(input);

  if (!Number.isFinite(normalized) || normalized <= 0) {
    throw new Error("请输入正确的价格");
  }

  return Math.round(normalized * 100);
}

export function formatOrderStatus(status: string) {
  switch (status) {
    case "PENDING":
      return "待接单";
    case "COOKING":
      return "制作中";
    case "READY":
      return "已完成";
    case "CANCELLED":
      return "已取消";
    default:
      return status;
  }
}
