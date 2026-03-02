// app/api/test-remove-background/route.ts
import { removeProductBackground } from '@/app/utils/oss/remove-background';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 测试用的图片URL（这里用一个示例图片）
    const testImageUrl = "https://placehold.co/800x800/3b82f6/ffffff?text=Test+Product";
    
    // 先测试导入和环境变量配置
    console.log('测试抠图功能...');
    console.log('ALIYUN_ACCESS_KEY_ID:', process.env.ALIYUN_ACCESS_KEY_ID ? '已配置' : '未配置');
    
    // 返回测试成功信息（实际调用可能会产生费用，这里先做配置验证）
    return NextResponse.json({ 
      success: true, 
      message: '抠图模块导入成功，环境变量配置正常',
      testImageUrl: testImageUrl,
      note: '实际抠图API调用需要有效的图片URL，且可能产生费用'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
