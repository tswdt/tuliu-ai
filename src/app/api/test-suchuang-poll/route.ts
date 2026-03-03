import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("\n========================================");
    console.log("[测试] 速创 API 轮询 URL 测试");
    console.log("========================================");
    
    const API_KEY = process.env.SUCHUANG_API_KEY;

    if (!API_KEY) {
      throw new Error('未配置 SUCHUANG_API_KEY');
    }

    const testTaskId = "image_de43a613-2b08-4709-a3b5-bb49fed89c58";
    
    const possiblePollUrls = [
      `https://api.wuyinkeji.com/api/async/result/${testTaskId}`,
      `https://api.wuyinkeji.com/api/async/task/${testTaskId}`,
      `https://api.wuyinkeji.com/api/task/${testTaskId}`,
      `https://api.wuyinkeji.com/api/result/${testTaskId}`,
      `https://api.wuyinkeji.com/async/result/${testTaskId}`,
      `https://api.wuyinkeji.com/v1/async/result/${testTaskId}`,
      `https://api.wuyinkeji.com/api/image/${testTaskId}`,
    ];

    console.log("[测试] 测试任务ID:", testTaskId);
    console.log("[测试] 尝试以下轮询URL:");
    possiblePollUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url}`));

    const results: any[] = [];

    for (const url of possiblePollUrls) {
      console.log(`\n[测试] 尝试: ${url}`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': API_KEY
          }
        });

        console.log(`  状态码: ${response.status}`);
        
        const contentType = response.headers.get('content-type') || '';
        console.log(`  Content-Type: ${contentType}`);

        let body;
        if (contentType.includes('application/json')) {
          body = await response.json();
          console.log(`  响应:`, JSON.stringify(body, null, 2).substring(0, 500));
        } else {
          body = await response.text();
          console.log(`  响应 (text):`, body.substring(0, 500));
        }

        results.push({
          url,
          status: response.status,
          contentType,
          success: response.ok && contentType.includes('application/json'),
          bodyPreview: typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body).substring(0, 200)
        });

      } catch (error) {
        console.log(`  ❌ 错误:`, (error as Error).message);
        results.push({
          url,
          error: (error as Error).message,
          success: false
        });
      }
    }

    console.log("\n========================================");
    console.log("[测试] 结果汇总");
    console.log("========================================");
    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.url}`);
      console.log(`   成功: ${r.success}, 状态: ${r.status || 'error'}`);
      if (r.success) {
        console.log(`   ✅ 这个可能是正确的！`);
      }
    });

    const successfulResults = results.filter(r => r.success);
    
    return NextResponse.json({
      success: true,
      totalTested: possiblePollUrls.length,
      successfulCount: successfulResults.length,
      results,
      recommendation: successfulResults.length > 0 ? successfulResults[0].url : null
    });

  } catch (error) {
    console.error("\n========================================");
    console.error("[测试] ❌ 测试失败");
    console.error("========================================");
    console.error("错误:", error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
