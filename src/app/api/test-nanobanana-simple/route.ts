import { NextResponse } from 'next/server';
import { generateImageWithWanxiang } from '@/app/utils/ai/wanxiang';

export async function GET() {
  try {
    console.log("=== 开始测试通义万相 ===");
    
    const testPrompt = "800x800电商商品图，白色背景，高清";
    
    console.log("测试提示词:", testPrompt);
    
    const imageUrl = await generateImageWithWanxiang(testPrompt, "V1", "1024*1024");
    
    console.log("=== 测试成功 ===");
    console.log("生成的图片URL:", imageUrl);
    
    return NextResponse.json({
      success: true,
      message: "通义万相 测试成功",
      imageUrl,
      prompt: testPrompt
    });
    
  } catch (error) {
    console.error("=== 通义万相 测试失败 ===");
    console.error("错误:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
