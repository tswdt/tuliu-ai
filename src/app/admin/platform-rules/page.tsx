"use client";

import { useState } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  Settings,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const platformRules = [
  {
    id: "TAOBAO",
    name: "淘宝",
    mainImageSize: "800×800",
    detailImageWidth: "750px",
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    stylePreference: "简约、轻奢",
    copyStyle: "感性堆叠",
    status: "active",
  },
  {
    id: "TMALL",
    name: "天猫",
    mainImageSize: "800×800",
    detailImageWidth: "790px",
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    stylePreference: "品牌质感",
    copyStyle: "品牌调性",
    status: "active",
  },
  {
    id: "JD",
    name: "京东",
    mainImageSize: "800×800",
    detailImageWidth: "750px",
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 4,
    maxSellingPointImages: 3,
    stylePreference: "科技、简约",
    copyStyle: "参数详实",
    status: "active",
  },
  {
    id: "PDD",
    name: "拼多多",
    mainImageSize: "750×750",
    detailImageWidth: "750px",
    maxMainImages: 10,
    maxSceneImages: 3,
    maxDetailImages: 3,
    maxSellingPointImages: 4,
    stylePreference: "促销感",
    copyStyle: "价格导向",
    status: "active",
  },
  {
    id: "DOUYIN",
    name: "抖音",
    mainImageSize: "800×800",
    detailImageWidth: "750px",
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    stylePreference: "种草风",
    copyStyle: "种草口语",
    status: "active",
  },
  {
    id: "XIAOHONGSHU",
    name: "小红书",
    mainImageSize: "1080×1440",
    detailImageWidth: "750px",
    maxMainImages: 5,
    maxSceneImages: 5,
    maxDetailImages: 3,
    maxSellingPointImages: 2,
    stylePreference: "ins风、轻奢",
    copyStyle: "种草笔记",
    status: "active",
  },
  {
    id: "AMAZON",
    name: "Amazon",
    mainImageSize: "2000×2000",
    detailImageWidth: "970px",
    maxMainImages: 7,
    maxSceneImages: 3,
    maxDetailImages: 4,
    maxSellingPointImages: 3,
    stylePreference: "白底、专业",
    copyStyle: "英文参数",
    status: "active",
  },
  {
    id: "TEMU",
    name: "Temu",
    mainImageSize: "800×800",
    detailImageWidth: "750px",
    maxMainImages: 6,
    maxSceneImages: 3,
    maxDetailImages: 3,
    maxSellingPointImages: 3,
    stylePreference: "促销感",
    copyStyle: "英文促销",
    status: "active",
  },
  {
    id: "SHOPIFY",
    name: "Shopify",
    mainImageSize: "2048×2048",
    detailImageWidth: "自定义",
    maxMainImages: 5,
    maxSceneImages: 4,
    maxDetailImages: 4,
    maxSellingPointImages: 3,
    stylePreference: "品牌风",
    copyStyle: "品牌英文",
    status: "active",
  },
];

export default function AdminPlatformRulesPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">平台规则管理</h1>
        <Button className="bg-[#1d1d1f] hover:bg-[#333] text-white">
          <Plus className="h-4 w-4 mr-2" />
          添加平台
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {platformRules.map((rule) => (
          <Card key={rule.id} className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-[#1d1d1f]" />
                  {rule.name}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(editingId === rule.id ? null : rule.id)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">主图尺寸</span>
                  <span className="text-gray-700">{rule.mainImageSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">详情页宽度</span>
                  <span className="text-gray-700">{rule.detailImageWidth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">主图数量</span>
                  <span className="text-gray-700">{rule.maxMainImages} 张</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">风格偏好</span>
                  <span className="text-gray-700">{rule.stylePreference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">文案风格</span>
                  <span className="text-gray-700">{rule.copyStyle}</span>
                </div>
              </div>
              {editingId === rule.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <label className="text-xs text-gray-400">主图尺寸</label>
                    <input className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm" defaultValue={rule.mainImageSize} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">详情页宽度</label>
                    <input className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm" defaultValue={rule.detailImageWidth} />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400">主图数量</label>
                    <input type="number" className="w-full mt-1 px-3 py-1.5 border rounded-lg text-sm" defaultValue={rule.maxMainImages} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>取消</Button>
                    <Button size="sm" className="bg-[#1d1d1f] hover:bg-[#333] text-white" onClick={() => setEditingId(null)}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      保存
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
