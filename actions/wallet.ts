"use server";

import { prisma } from "@/lib/prisma";

export async function deductCredit(userId: string, amount: number) {
  return await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { balance: true }
    });

    if (!user || user.balance < amount) {
      throw new Error("Insufficient balance");
    }

    return await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } }
    });
  });
}
