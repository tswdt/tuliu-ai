"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("两次输入的密码不一致");
      return;
    }
    setPasswordError("");

    setLoading(true);

    try {
      console.log("注册数据:", formData);
      setTimeout(() => {
        router.push("/workspace/create");
      }, 1000);
    } catch (error) {
      console.error("注册失败:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f7] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e5e5e5] p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-[#1d1d1f] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#1d1d1f]">燎原 AI</span>
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-[#1d1d1f]">创建账户</h1>
          <p className="text-[14px] text-[#86868b] mt-1">注册即送10次免费生成额度</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[14px] text-[#666] font-medium">用户名</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999]" />
              <Input
                id="name"
                type="text"
                placeholder="请输入用户名"
                className="pl-10 h-12 rounded-xl border-[#e5e5e5] text-[14px]"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[14px] text-[#666] font-medium">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999]" />
              <Input
                id="email"
                type="email"
                placeholder="请输入邮箱"
                className="pl-10 h-12 rounded-xl border-[#e5e5e5] text-[14px]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[14px] text-[#666] font-medium">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码（至少6位）"
                className="pl-10 pr-10 h-12 rounded-xl border-[#e5e5e5] text-[14px]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                aria-label={showPassword ? "隐藏密码" : "显示密码"}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-[#999]" /> : <Eye className="h-4 w-4 text-[#999]" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[14px] text-[#666] font-medium">确认密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#999]" />
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="请再次输入密码"
                className={`pl-10 pr-10 h-12 rounded-xl border-[#e5e5e5] text-[14px] ${passwordError ? "border-red-500 focus:ring-red-500" : ""}`}
                value={formData.confirmPassword}
                onChange={(e) => { setFormData({ ...formData, confirmPassword: e.target.value }); setPasswordError(""); }}
                required
                minLength={6}
              />
            </div>
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
          </div>

          <div className="flex items-start">
            <input
              id="agree"
              type="checkbox"
              className="h-4 w-4 rounded border-[#e5e5e5] text-[#1d1d1f] focus:ring-[#1d1d1f]"
              required
            />
            <label htmlFor="agree" className="ml-2 block text-[14px] text-[#666]">
              我已阅读并同意{" "}
              <span className="text-[#1d1d1f] cursor-pointer hover:underline">用户协议</span>{" "}
              和{" "}
              <span className="text-[#1d1d1f] cursor-pointer hover:underline">隐私政策</span>
            </label>
          </div>

          <Button type="submit" className="w-full h-12 text-[16px] font-semibold bg-[#1d1d1f] text-white hover:bg-[#333]" disabled={loading}>
            {loading ? "注册中..." : "立即注册"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e5e5]" />
            </div>
            <div className="relative flex justify-center text-[14px]">
              <span className="px-2 bg-white text-[#86868b]">或</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full h-11 rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc]">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                />
              </svg>
              微信
            </Button>
            <Button variant="outline" className="w-full h-11 rounded-xl border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc]">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>
        </div>

        <p className="mt-8 text-center text-[14px] text-[#666]">
          已有账户？{" "}
          <Link href="/login" className="text-[#1d1d1f] hover:underline font-medium">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
