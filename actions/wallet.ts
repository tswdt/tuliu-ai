"use server";

import { deductCredit as deductCreditFromWallet } from "@/lib/services/wallet";

/**
 * 扣费 - 委托给 COS 存储的钱包服务
 * 与主流程 server/actions 保持一致
 */
export async function deductCredit(userId: string, amount: number) {
  return deductCreditFromWallet(userId, amount);
}
