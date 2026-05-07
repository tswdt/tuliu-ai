import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json({
    error: '此接口仅用于开发调试，前端正式流程请使用 /api/workflow/generate',
    hint: '设置 NODE_ENV=production 后此接口将自动禁用',
  }, { status: 403 });
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'AI 电商工作流测试 API（仅开发环境可用）',
    warning: '此接口仅用于开发调试，生产环境已自动禁用',
    productionEndpoint: '/api/workflow/generate',
  });
}
