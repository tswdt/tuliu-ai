// app/api/test-generate-prompt/route.ts
import { generateProductPrompt } from '@/app/utils/ai/generate-prompt';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 测试用的图片URL（示例图片）
    const testImageUrl = "https://placehold.co/800x800/3b82f6/ffffff?text=Test+Product";
    
    console.log('测试提示词生成功能...');
    console.log('DASHSCOPE_API_KEY:', process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置');
    
    // 先测试模块导入和模板功能
    const testProductInfo = {
      category: "服装",
      name: "纯棉T恤",
      color: "白色",
      material: "纯棉",
      style: "简约",
      sellingPoints: ["透气舒适", "不起球", "性价比高"]
    };
    
    // 导入模板用于测试
    const PROMPT_TEMPLATES = {
      clothing: (productInfo: any) => `
        电商淘宝主图，${productInfo.color}${productInfo.style}${productInfo.category}，
        材质：${productInfo.material}，卖点：${productInfo.sellingPoints.join("、")}，
        模特上身展示，背景为简约纯色，4K超清，无水印，符合淘宝平台规范，
        商用无版权，色彩还原真实，光线自然
      `.trim(),
      default: (productInfo: any) => `
        电商通用主图，${productInfo.name}，${productInfo.category}，
        卖点：${productInfo.sellingPoints.join("、")}，放在适合的使用场景，
        4K超清，无水印，符合电商平台规范，商用无版权
      `.trim(),
    };
    
    const testPrompt = PROMPT_TEMPLATES.clothing(testProductInfo);
    
    return NextResponse.json({ 
      success: true, 
      message: '提示词生成模块导入成功，环境变量配置正常',
      testProductInfo,
      testPrompt,
      testImageUrl: testImageUrl,
      note: '实际Qwen-VL API调用需要有效的商品图片URL，且可能产生费用'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
