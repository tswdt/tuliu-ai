import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, prompt, platform, originalImageUrl } = body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }

    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "额度不足，请购买套餐" },
        { status: 400 }
      );
    }

    const generation = await prisma.generation.create({
      data: {
        userId,
        prompt,
        platform: platform || "CUSTOM",
        originalImageUrl,
        sellingPoints: '[]',
        resultUrls: '[]',
        sceneImageUrls: '[]',
        detailImageUrls: '[]',
        sellingPointImageUrls: '[]',
        copyContent: '{}',
        copyText: '',
        status: "QUEUED",
        creditUsed: 1,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: { decrement: 1 },
        totalGenerations: { increment: 1 },
      },
    });

    setTimeout(async () => {
      try {
        const mockResultUrls = [
          "https://placehold.co/800x800/3b82f6/ffffff?text=AI+Generated+1",
          "https://placehold.co/800x800/10b981/ffffff?text=AI+Generated+2",
          "https://placehold.co/800x800/f59e0b/ffffff?text=AI+Generated+3",
          "https://placehold.co/800x800/8b5cf6/ffffff?text=AI+Generated+4",
        ];

        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: "COMPLETED",
            resultUrls: JSON.stringify(mockResultUrls),
          },
        });
      } catch (error) {
        console.error("生成失败:", error);
        await prisma.generation.update({
          where: { id: generation.id },
          data: {
            status: "FAILED",
            errorMessage: "生成过程中发生错误",
          },
        });
      }
    }, 3000);

    return NextResponse.json({
      success: true,
      generationId: generation.id,
      message: "已加入生成队列",
    });
  } catch (error) {
    console.error("生成API错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get("generationId");

    if (!generationId) {
      return NextResponse.json(
        { error: "缺少generationId参数" },
        { status: 400 }
      );
    }

    const generation = await prisma.generation.findUnique({
      where: { id: generationId },
    });

    if (!generation) {
      return NextResponse.json(
        { error: "生成记录不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(generation);
  } catch (error) {
    console.error("获取生成状态错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
