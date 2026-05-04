import { NextRequest, NextResponse } from 'next/server';
import { registerWithEmail, registerWithPhone, loginWithEmail, loginWithWechat, requestPasswordReset, resetPassword, verifyToken, getUserById } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'register-email': {
        const { email, password, name } = body;
        if (!email || !password) {
          return NextResponse.json({ success: false, error: '邮箱和密码不能为空' }, { status: 400 });
        }
        if (password.length < 6) {
          return NextResponse.json({ success: false, error: '密码至少6位' }, { status: 400 });
        }
        const result = await registerWithEmail(email, password, name);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'register-phone': {
        const { phone, password, name } = body;
        if (!phone || !password) {
          return NextResponse.json({ success: false, error: '手机号和密码不能为空' }, { status: 400 });
        }
        const result = await registerWithPhone(phone, password, name);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'login-email': {
        const { email, password } = body;
        if (!email || !password) {
          return NextResponse.json({ success: false, error: '邮箱和密码不能为空' }, { status: 400 });
        }
        const result = await loginWithEmail(email, password);
        return NextResponse.json(result, { status: result.success ? 200 : 401 });
      }

      case 'login-wechat': {
        const { openId, unionId } = body;
        if (!openId) {
          return NextResponse.json({ success: false, error: '缺少微信OpenID' }, { status: 400 });
        }
        const result = await loginWithWechat(openId, unionId);
        return NextResponse.json(result, { status: result.success ? 200 : 401 });
      }

      case 'request-reset': {
        const { email } = body;
        if (!email) {
          return NextResponse.json({ success: false, error: '邮箱不能为空' }, { status: 400 });
        }
        const result = await requestPasswordReset(email);
        return NextResponse.json(result);
      }

      case 'reset-password': {
        const { token, password } = body;
        if (!token || !password) {
          return NextResponse.json({ success: false, error: '参数不完整' }, { status: 400 });
        }
        const result = await resetPassword(token, password);
        return NextResponse.json(result, { status: result.success ? 200 : 400 });
      }

      case 'verify': {
        const { token } = body;
        if (!token) {
          return NextResponse.json({ success: false, error: '缺少Token' }, { status: 400 });
        }
        const payload = verifyToken(token);
        if (!payload) {
          return NextResponse.json({ success: false, error: 'Token无效或已过期' }, { status: 401 });
        }
        const user = await getUserById(payload.userId);
        if (!user) {
          return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 });
        }
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.name,
            role: user.role,
            credits: user.credits,
            avatarUrl: user.avatarUrl,
            onboardingCompleted: user.onboardingCompleted,
          },
        });
      }

      default:
        return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 });
  }
}
