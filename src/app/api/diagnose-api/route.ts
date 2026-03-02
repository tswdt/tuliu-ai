import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log("=== 开始诊断 API 配置 ===");
    
    const testPrompt = "测试：800x800白色背景苹果";
    
    const providers = [
      {
        name: 'API易',
        url: 'https://api.apiyi.com/v1/draw/nano-banana',
        key: 'sk-qrgt62Nri6bOEcuv6cDfCfB9633547C8B2Db103a7aCbE106',
        model: 'nano-banana-2'
      },
      {
        name: '老张',
        url: 'https://api.laozhang.ai/v1/draw/nano-banana',
        key: 'sk-qqKBtuQkA6nHJDzX2aD2135c029e42Ca868c90FaC0B9Db8c',
        model: 'nano-banana-2'
      }
    ];
    
    const results = [];
    
    for (const provider of providers) {
      console.log(`\n🔍 测试 ${provider.name}...`);
      
      const requestBody = {
        prompt: testPrompt,
        model: provider.model,
        width: 800,
        height: 800
      };
      
      console.log(`${provider.name} 请求:`, {
        url: provider.url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.key.substring(0, 10)}...`
        },
        body: requestBody
      });
      
      try {
        const response = await fetch(provider.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${provider.key}`,
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log(`${provider.name} 响应状态:`, response.status, response.statusText);
        
        const responseText = await response.text();
        console.log(`${provider.name} 响应内容:`, responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.log(`${provider.name} 响应不是 JSON`);
        }
        
        results.push({
          provider: provider.name,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          response: responseText,
          parsedData: data
        });
        
      } catch (error) {
        console.log(`${provider.name} 请求异常:`, error);
        results.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : '未知错误',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
    }
    
    console.log("\n=== 诊断完成 ===");
    console.log("结果:", results);
    
    return NextResponse.json({
      success: true,
      message: "诊断完成",
      results
    });
    
  } catch (error) {
    console.error("=== 诊断失败 ===");
    console.error("错误:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
