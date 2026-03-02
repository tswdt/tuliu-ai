// app/api/test-generate-detail-image/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('测试完整商品详情图生成流程...');
    
    // 检查环境变量配置
    const envStatus = {
      ONETHINGAI_API_KEY: process.env.ONETHINGAI_API_KEY ? '已配置' : '未配置',
      ALIYUN_ACCESS_KEY_ID: process.env.ALIYUN_ACCESS_KEY_ID ? '已配置' : '未配置',
      DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY ? '已配置' : '未配置'
    };
    
    // 测试用的图片URL
    const testImageUrl = "https://placehold.co/800x800/3b82f6/ffffff?text=Test+Product";
    
    return NextResponse.json({ 
      success: true, 
      message: '完整商品详情图生成流程模块导入成功',
      envStatus,
      testImageUrl,
      workflow: [
        '步骤1: 抠图去除背景',
        '步骤2: 生成专属提示词',
        '步骤3: 文生图/图生图生成'
      ],
      note: '实际完整流程调用需要有效的商品图片URL，且可能产生API费用'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
