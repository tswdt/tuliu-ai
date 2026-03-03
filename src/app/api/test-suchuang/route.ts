import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("\n========================================");
    console.log("[测试] 开始测试速创 API");
    console.log("========================================");
    
    const API_URL = 'https://api.wuyinkeji.com/api/async/image_nanoBanana2';
    const API_KEY = process.env.SUCHUANG_API_KEY;

    if (!API_KEY) {
      throw new Error('未配置 SUCHUANG_API_KEY');
    }

    const payload = {
      prompt: "800x800电商商品图，红色苹果，白色背景，高清摄影",
      size: '2K',
      aspectRatio: '1:1'
    };

    console.log("[测试] 请求参数:", payload);
    console.log("[测试] 发送请求到:", API_URL);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      console.log("[测试] 响应状态码:", response.status);
      console.log("[测试] 响应头:", Object.fromEntries(response.headers.entries()));

      const contentType = response.headers.get('content-type') || '';
      console.log("[测试] Content-Type:", contentType);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[测试] HTTP 错误响应:", errorText);
        return NextResponse.json({
          success: false,
          status: response.status,
          contentType,
          error: errorText
        }, { status: response.status });
      }

      if (contentType.includes('text/html')) {
        const htmlText = await response.text();
        console.error("[测试] 返回 HTML:", htmlText.substring(0, 1000));
        return NextResponse.json({
          success: false,
          contentType,
          html: htmlText.substring(0, 2000)
        });
      }

      const rawText = await response.text();
      console.log("[测试] 原始响应文本:", rawText);

      let data;
      try {
        data = JSON.parse(rawText);
      } catch (jsonError) {
        console.error("[测试] JSON 解析失败:", (jsonError as Error).message);
        return NextResponse.json({
          success: false,
          rawText,
          jsonError: (jsonError as Error).message
        });
      }

      console.log("\n[测试] ✅ 完整 JSON 响应:");
      console.log(JSON.stringify(data, null, 2));

      console.log("\n[测试] 响应结构分析:");
      console.log("- 顶层键:", Object.keys(data));
      if (data.data) {
        console.log("- data 键:", Object.keys(data.data));
      }

      return NextResponse.json({
        success: true,
        status: response.status,
        contentType,
        rawData: data,
        analysis: {
          topLevelKeys: Object.keys(data),
          dataKeys: data.data ? Object.keys(data.data) : null
        }
      });

    } finally {
      clearTimeout(timeoutId);
    }

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
