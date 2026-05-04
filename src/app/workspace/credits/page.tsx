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
        <h1 className="text-2xl font-bold text-gray-900">账户积分</h1>
        <p className="text-sm text-gray-500 mt-1">管理您的生成额度和消费记录</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">当前额度</span>
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">8</div>
            <div className="text-xs text-gray-400 mt-1">次</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">本月使用</span>
              <Zap className="h-4 w-4 text-violet-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">42</div>
            <div className="text-xs text-gray-400 mt-1">次</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">累计节省</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">¥2,800</div>
            <div className="text-xs text-gray-400 mt-1">相比请美工</div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">购买额度</h2>
        <div className="grid grid-cols-4 gap-4">
          {creditPacks.map((pack, i) => (
            <Card
              key={i}
              className={`relative border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                pack.popular ? "ring-2 ring-violet-500" : ""
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-medium rounded-full">
                  最划算
                </div>
              )}
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{pack.credits}</div>
                <div className="text-xs text-gray-400 mb-3">次额度</div>
                <div className="text-xl font-bold text-violet-600 mb-1">¥{pack.price}</div>
                <div className="text-xs text-gray-400 mb-4">{pack.unit}</div>
                <Button
                  className={`w-full ${pack.popular ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white" : ""}`}
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
        <h2 className="text-lg font-semibold text-gray-900 mb-4">消费记录</h2>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      t.type === "consume" ? "bg-red-50 text-red-500" :
                      t.type === "purchase" ? "bg-green-50 text-green-500" :
                      "bg-amber-50 text-amber-500"
                    }`}>
                      {t.type === "consume" ? <Zap className="h-4 w-4" /> :
                       t.type === "purchase" ? <CreditCard className="h-4 w-4" /> :
                       <Gift className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="text-sm text-gray-700">{t.desc}</div>
                      <div className="text-xs text-gray-400">{t.date}</div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    t.credits > 0 ? "text-green-600" : "text-red-500"
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
