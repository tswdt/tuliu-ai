"use server";

import { prisma } from "@/lib/prisma";
import { deductCredit } from "./wallet";

// 阶段 1: 异步提交任务
export async function submitTask(userId: string, inputUrl: string, maskUrl: string, prompt: string) {
  // 1. 原子扣费
  await deductCredit(userId, 1);

  // 2. 调用 AI Provider (以 SiliconFlow 为例)
  const response = await fetch("https://api.siliconflow.cn/v1/images/generations", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.SILICONFLOW_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "black-forest-labs/FLUX.1-Fill-dev",
      prompt,
      image_url: inputUrl,
      mask_url: maskUrl,
      async: true // 关键：使用异步模式
    })
  });

  const data = await response.json();
  if (!data.id) throw new Error("Failed to submit task to provider");

  // 3. 写入数据库并立即返回
  const generation = await prisma.generation.create({
    data: {
      userId,
      inputUrl,
      maskUrl,
      prompt,
      providerTaskId: data.id,
      status: "PROCESSING"
    }
  });

  return { taskId: generation.id };
}

// 阶段 2: 状态轮询与自动同步
export async function checkStatus(taskId: string) {
  const gen = await prisma.generation.findUnique({ where: { id: taskId } });
  if (!gen || gen.status === "COMPLETED" || gen.status === "FAILED") return gen;

  // 调用 Provider 查询接口
  const response = await fetch(`https://api.siliconflow.cn/v1/tasks/${gen.providerTaskId}`, {
    headers: { "Authorization": `Bearer ${process.env.SILICONFLOW_KEY}` }
  });
  
  const data = await response.json();

  if (data.status === "Succeeded") {
    return await prisma.generation.update({
      where: { id: taskId },
      data: { 
        status: "COMPLETED", 
        resultUrl: data.images[0].url 
      }
    });
  } else if (data.status === "Failed") {
    return await prisma.generation.update({
      where: { id: taskId },
      data: { status: "FAILED", error: data.reason }
    });
  }

  return gen;
}
