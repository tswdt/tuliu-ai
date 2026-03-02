# 快速启动指南

## 如何启动开发服务器

### 方法1: 使用命令行
在项目根目录打开终端，运行：
```bash
npm run dev
```

### 方法2: 检查现有服务器
可能服务器已经在某个端口上运行了，请尝试访问：

- http://localhost:3000
- http://localhost:3001
- http://localhost:3002
- http://localhost:3003
- http://localhost:3004

## 可用页面

### 1. 简单 Nano Banana 测试
**URL**: `/api/test-nanobanana-simple`

这个页面会：
- 测试 OneThingAI API 配置
- 生成一个红色苹果的测试图片
- 显示详细的调试日志

### 2. 完整流程测试页面
**URL**: `/test-workflow`

这个页面包含：
- 完整的 11 步电商 AI 商品详情页生成流程说明
- 一键运行完整流程测试
- 可视化展示测试结果
- 显示生成的真实图片
- 详细的 JSON 结果展示

### 3. 商品主图生成
**URL**: `/dashboard/generate/image`

功能：
- 输入商品名称
- 选择目标平台
- 选择生成数量（1-4张）
- 真实 AI 生成商品主图
- 下载生成的图片

### 4. 详情页生成
**URL**: `/generate`

功能：
- 完整的商品详情页生成
- 上传商品图片
- 填写商品信息
- AI 生成文案和多张图片

## 调试 OneThingAI 错误

如果遇到 "OneThingAI调用失败" 错误：

1. 先访问 `/api/test-nanobanana-simple`
2. 查看终端中的详细日志
3. 日志会显示：
   - 请求参数
   - API 响应状态
   - 完整响应内容
   - 详细错误信息

## 环境变量检查

确保 `.env` 文件中有：
```
ONETHINGAI_API_KEY=577c71baf87452f119fa4231fcc4f491
ONETHINGAI_API_URL=https://api.onethingai.com/v1/images/generations
```
