"use client";

import {
  Coins,
  Zap,
  TrendingUp,
  Gift,
  CreditCard,
  History,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const creditPacks = [
  { credits: 10, price: 9.9, unit: "0.99元/次" },
  { credits: 50, price: 39, unit: "0.78元/次", popular: true },
  { credits: 100, price: 69, unit: "0.69元/次" },
  { credits: 500, price: 299, unit: "0.60元/次" },
];

const transactions = [
  { id: "1", type: "consume", desc: "生成纯棉休闲T恤 - 淘宝", credits: -1, date: "2026-05-04 14:30" },
  { id: "2", type: "consume", desc: "生成玻尿酸精华液 - 小红书", credits: -1, date: "2026-05-03 10:15" },
  { id: "3", type: "purchase", desc: "购买50次额度包", credits: 50, date: "2026-05-01 09:00" },
  { id: "4", type: "consume", desc: "生成无线蓝牙耳机 - 京东", credits: -1, date: "2026-04-30 16:45" },
  { id: "5", type: "consume", desc: "生成有机坚果礼盒 - 拼多多", credits: -1, date: "2026-04-29 11:20" },
  { id: "6", type: "gift", desc: "新用户注册赠送", credits: 3, date: "2026-04-28 09:00" },
];

export default function CreditsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[24px] font-bold text-[#1d1d1f]">账户积分</h1>
        <p className="text-[14px] text-[#86868b] mt-1">管理您的生成额度和消费记录</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border border-[#e5e5e5] rounded-2xl shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] text-[#86868b]">当前额度</span>
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-[32px] font-bold text-[#1d1d1f]">8</div>
            <div className="text-[12px] text-[#86868b] mt-1">次</div>
          </CardContent>
        </Card>
        <Card className="border border-[#e5e5e5] rounded-2xl shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] text-[#86868b]">本月使用</span>
              <Zap className="h-4 w-4 text-[#1d1d1f]" />
            </div>
            <div className="text-[32px] font-bold text-[#1d1d1f]">42</div>
            <div className="text-[12px] text-[#86868b] mt-1">次</div>
          </CardContent>
        </Card>
        <Card className="border border-[#e5e5e5] rounded-2xl shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] text-[#86868b]">累计节省</span>
              <TrendingUp className="h-4 w-4 text-[#1d1d1f]" />
            </div>
            <div className="text-[32px] font-bold text-[#1d1d1f]">¥2,800</div>
            <div className="text-[12px] text-[#86868b] mt-1">相比请美工</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-4">购买额度</h2>
        <div className="grid grid-cols-4 gap-4">
          {creditPacks.map((pack, i) => (
            <Card
              key={i}
              className={`relative border rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                pack.popular ? "ring-2 ring-[#1d1d1f] border-[#1d1d1f]" : "border-[#e5e5e5]"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-[#1d1d1f] text-white text-[12px] font-medium rounded-full">
                  最划算
                </div>
              )}
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-[32px] font-bold text-[#1d1d1f] mb-1">{pack.credits}</div>
                <div className="text-[12px] text-[#86868b] mb-3">次额度</div>
                <div className="text-[20px] font-bold text-[#1d1d1f] mb-1">¥{pack.price}</div>
                <div className="text-[12px] text-[#86868b] mb-4">{pack.unit}</div>
                <Button
                  className={`w-full rounded-xl cursor-pointer ${pack.popular ? "bg-[#1d1d1f] text-white hover:bg-[#333]" : "border-[#e5e5e5] text-[#666] hover:text-[#1d1d1f] hover:border-[#ccc]"}`}
                  variant={pack.popular ? "default" : "outline"}
                  size="sm"
                >
                  购买
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-4">消费记录</h2>
        <Card className="border border-[#e5e5e5] rounded-2xl shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-[#f5f5f7]">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      t.type === "consume" ? "bg-red-50 text-red-500" :
                      t.type === "purchase" ? "bg-[#f0fdf4] text-[#1d1d1f]" :
                      "bg-amber-50 text-amber-500"
                    }`}>
                      {t.type === "consume" ? <Zap className="h-4 w-4" /> :
                       t.type === "purchase" ? <CreditCard className="h-4 w-4" /> :
                       <Gift className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-[14px] text-[#1d1d1f]">{t.desc}</div>
                      <div className="text-[12px] text-[#86868b]">{t.date}</div>
                    </div>
                  </div>
                  <span className={`text-[14px] font-medium ${
                    t.credits > 0 ? "text-[#1d1d1f]" : "text-red-500"
                  }`}>
                    {t.credits > 0 ? "+" : ""}{t.credits} 次
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
