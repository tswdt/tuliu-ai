import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 创建新用户
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, name, avatarUrl } = body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "用户已存在" },
        { status: 400 }
      );
    }

    // 创建新用户，赠送免费额度
    const freeCredits = parseInt(process.env.FREE_GENERATIONS || "10");
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        name,
        avatarUrl,
        role: "INDIVIDUAL",
        credits: freeCredits,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (error) {
    console.error("创建用户错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 获取用户列表（管理员）
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("获取用户列表错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
