import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Zap, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type LoginStep = 'email' | 'otp';

export default function Login() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  const handleSendOtp = async () => {
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }

    setIsLoading(true);
    try {
      await sendOtpMutation.mutateAsync({ email });
      setStep('otp');
      setResendCountdown(60);
      toast.success('验证码已发送到您的邮箱');

      // 倒计时
      const interval = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('发送验证码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('请输入 6 位验证码');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({ email, otp });
      toast.success(result.message);
      // 重定向到 dashboard
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      toast.error('验证失败，请检查验证码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      {/* 背景扫描线效果 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px)',
            animation: 'scan-line 8s linear infinite'
          }} />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-foreground/60 hover:text-foreground transition-colors mb-6"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回首页</span>
          </motion.button>

          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-neon-pink" />
            <h1 className="text-3xl font-bold neon-glow">Tuliu AI</h1>
          </div>
          <p className="text-foreground/60">邮箱验证码登录</p>
        </div>

        {/* Login Card */}
        <Card className="glass-effect-pink border border-neon-pink/30 p-8">
          {step === 'email' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">邮箱地址</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan"
                    disabled={isLoading}
                  />
                </div>

                <Button
                  onClick={handleSendOtp}
                  className="w-full btn-neon"
                  disabled={isLoading || !email}
                >
                  {isLoading ? '发送中...' : '发送验证码'}
                </Button>

                <p className="text-xs text-foreground/60 text-center">
                  验证码将发送到您的邮箱，有效期 10 分钟
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">验证码</label>
                  <Input
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan text-center text-2xl tracking-widest"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-foreground/60 mt-2">
                    已发送到 <span className="text-neon-cyan">{email}</span>
                  </p>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full btn-neon"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? '验证中...' : '验证并登录'}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading}
                  >
                    修改邮箱
                  </Button>
                  <Button
                    onClick={handleSendOtp}
                    variant="outline"
                    className="flex-1"
                    disabled={isLoading || resendCountdown > 0}
                  >
                    {resendCountdown > 0 ? `${resendCountdown}s` : '重新发送'}
                  </Button>
                </div>

                <p className="text-xs text-foreground/60 text-center">
                  首次登录将自动创建账户
                </p>
              </div>
            </motion.div>
          )}
        </Card>

        {/* Footer */}
        <p className="text-xs text-foreground/40 text-center mt-8">
          © 2026 Tuliu AI. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
