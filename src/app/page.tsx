import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Upload,
  Zap,
  Target,
  Layers,
  Wand2,
  CheckCircle2,
  ChevronDown,
  Image,
  FileText,
  Eye,
  Ruler,
  LayoutList,
  ScrollText,
  ShoppingCart,
  Store,
  Package,
  Palette,
  MonitorSmartphone,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: Upload, title: "上传产品图", desc: "上传任意产品图片，手机拍摄即可" },
  { icon: Wand2, title: "AI 识别商品资料", desc: "自动识别商品名称、品类、材质、颜色、卖点" },
  { icon: Target, title: "选择电商平台", desc: "选择淘宝、京东、拼多多、抖音等目标平台" },
  { icon: Layers, title: "生成整套商品图", desc: "一键生成主图、细节图、卖点图和详情页" },
];

const contentTypes = [
  { icon: Image, title: "商品主图", desc: "白底主图，符合平台首图规范", color: "text-blue-600 bg-blue-50" },
  { icon: Layers, title: "产品附图", desc: "多角度展示，突出产品外观", color: "text-violet-600 bg-violet-50" },
  { icon: Eye, title: "白底图", desc: "纯白背景，平台审核必过", color: "text-gray-600 bg-gray-100" },
  { icon: ShoppingCart, title: "场景图", desc: "真实使用场景，提升转化率", color: "text-emerald-600 bg-emerald-50" },
  { icon: Zap, title: "细节图", desc: "材质纹理特写，增强信任感", color: "text-amber-600 bg-amber-50" },
  { icon: Ruler, title: "参数图", desc: "规格参数可视化，减少客服咨询", color: "text-cyan-600 bg-cyan-50" },
  { icon: ScrollText, title: "详情页长图", desc: "完整详情页排版，直接上传", color: "text-rose-600 bg-rose-50" },
];

const platforms = [
  { name: "淘宝", desc: "5张主图 + 详情页", color: "#FF6A00" },
  { name: "京东", desc: "5张主图 + 参数详情", color: "#E4393C" },
  { name: "拼多多", desc: "10张轮播 + 详情", color: "#E02E24" },
  { name: "抖音", desc: "5张主图 + 短视频封面", color: "#161823" },
  { name: "亚马逊", desc: "7张主图 + A+页面", color: "#FF9900" },
  { name: "Shopify", desc: "自定义尺寸 + 详情页", color: "#96BF48" },
];

const cases = [
  { category: "食品", product: "有机坚果礼盒", platform: "淘宝", color: "from-amber-400 to-orange-500" },
  { category: "酒水", product: "精酿啤酒礼盒", platform: "京东", color: "from-yellow-500 to-amber-600" },
  { category: "服装", product: "纯棉休闲T恤", platform: "拼多多", color: "from-blue-400 to-indigo-500" },
  { category: "家居", product: "北欧风落地灯", platform: "天猫", color: "from-emerald-400 to-teal-500" },
  { category: "3C", product: "无线蓝牙耳机", platform: "京东", color: "from-violet-400 to-purple-500" },
  { category: "美妆", product: "玻尿酸精华液", platform: "小红书", color: "from-pink-400 to-rose-500" },
  { category: "日用品", product: "竹纤维毛巾套装", platform: "拼多多", color: "from-cyan-400 to-blue-500" },
];

const pricingPlans = [
  {
    name: "免费试用",
    price: "0",
    desc: "适合初次体验",
    credits: "3 次",
    features: ["3 次免费生成", "支持全部平台", "标准分辨率"],
    highlight: false,
  },
  {
    name: "标准版",
    price: "49",
    desc: "适合小商家",
    credits: "50 次/月",
    features: ["50 次/月生成", "4K 高清输出", "批量下载", "详情页编辑器"],
    highlight: false,
  },
  {
    name: "专业版",
    price: "149",
    desc: "适合代运营和品牌方",
    credits: "200 次/月",
    features: ["200 次/月生成", "4K 高清输出", "优先生成队列", "API 接口", "详情页编辑器"],
    highlight: true,
  },
  {
    name: "团队版",
    price: "499",
    desc: "适合大型电商团队",
    credits: "无限次",
    features: ["无限生成额度", "1 对 1 专属客服", "自定义品牌水印", "API 接口", "团队协作"],
    highlight: false,
  },
];

const faqs = [
  {
    q: "需要会写提示词吗？",
    a: "完全不需要。系统会根据 AI 识别的商品信息自动生成提示词，匹配平台规则和品类特征，您只需上传产品图即可。",
  },
  {
    q: "可以生成哪些平台的图？",
    a: "目前支持淘宝、天猫、京东、拼多多、抖音、小红书、Amazon、Temu、Shopify 共 9 大平台，每个平台有独立的图片尺寸和风格规则。",
  },
  {
    q: "生成的图可以商用吗？",
    a: "可以。AI 生成的图片您拥有完整使用权，可商用。系统会进行内容安全审核，确保生成内容合规。",
  },
  {
    q: "能不能修改文案？",
    a: "可以。AI 生成文案后，您可以在详情页编辑器中自由修改标题、卖点、描述等所有文案内容。",
  },
  {
    q: "产品参数会不会乱写？",
    a: "不会。AI 会根据产品图片识别真实的产品参数，您可以在生成后确认和修改。系统不会凭空编造参数信息。",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">图流 AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8 text-sm">
              <Link href="/features" className="text-gray-600 hover:text-gray-900 transition">功能</Link>
              <Link href="/cases" className="text-gray-600 hover:text-gray-900 transition">案例</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition">价格</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition">登录</Link>
            </div>
            <Link href="/workspace/new">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm">
                免费开始
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero 区 */}
      <section className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mb-6">
                <Zap className="h-3 w-3 mr-1.5 text-amber-500" />
                AI 自动化 · 多平台适配 · 零门槛
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                上传产品图，
                <br />
                <span className="text-violet-600">AI 自动生成</span>
                <br />
                电商详情页
              </h1>
              <p className="text-base text-gray-500 mb-8 leading-relaxed max-w-lg">
                自动识别商品资料，匹配淘宝、京东、拼多多、抖音等平台规则，一键生成主图、细节图、卖点图和详情页。
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/workspace/new">
                  <Button size="lg" className="text-sm px-6 h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200">
                    <Upload className="mr-2 h-4 w-4" />
                    立即上传产品图
                  </Button>
                </Link>
                <Link href="/cases">
                  <Button size="lg" variant="outline" className="text-sm px-6 h-11 border-gray-200">
                    查看生成案例
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-4">无需注册，新用户免费体验 3 次</p>
            </div>

            {/* 右侧流程图 */}
            <div className="relative">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Upload className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">上传产品图</div>
                      <div className="text-xs text-gray-400">手机拍摄即可</div>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Image className="h-6 w-6 text-gray-300" />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-6 w-px bg-gray-200" />
                  </div>

                  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-violet-100 shadow-sm ring-1 ring-violet-50">
                    <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <Wand2 className="h-5 w-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">AI 识别商品资料</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {["品类", "材质", "颜色", "卖点"].map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 text-[10px] font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="h-6 w-px bg-gray-200" />
                  </div>

                  <div className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Layers className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">自动生成详情页</div>
                      <div className="text-xs text-gray-400">主图 + 场景图 + 细节图 + 文案</div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="h-8 w-6 rounded bg-gradient-to-br from-violet-200 to-indigo-200" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 h-20 w-20 bg-violet-100 rounded-full blur-3xl opacity-40" />
              <div className="absolute -bottom-3 -left-3 h-16 w-16 bg-blue-100 rounded-full blur-3xl opacity-40" />
            </div>
          </div>
        </div>
      </section>

      {/* 产品流程区 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">4 步完成，零门槛</h2>
            <p className="text-gray-500">不需要设计经验，不需要会写 AI 提示词</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <Card className="border-0 shadow-sm hover:shadow-md transition-shadow h-full bg-white">
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-violet-50 text-violet-600 mb-5">
                        <Icon className="h-7 w-7" />
                      </div>
                      <div className="text-xs font-bold text-violet-600 mb-2">步骤 {i + 1}</div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-sm text-gray-500">{step.desc}</p>
                    </CardContent>
                  </Card>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-300 z-10">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 生成内容展示区 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">一次生成，覆盖全类型</h2>
            <p className="text-gray-500">从主图到详情页，所有电商图片一键搞定</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {contentTypes.map((ct, i) => {
              const Icon = ct.icon;
              return (
                <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow text-center">
                  <CardContent className="pt-6 pb-4">
                    <div className={`h-11 w-11 rounded-xl ${ct.color} flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">{ct.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">{ct.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 平台适配区 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">自动适配主流电商平台</h2>
            <p className="text-gray-500">每个平台有独立的图片尺寸、风格和排版规则</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {platforms.map((p) => (
              <Card key={p.name} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-6 pb-4 text-center">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm mx-auto mb-3 shadow-sm"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.name.slice(0, 2)}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-400">{p.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 前后对比区 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">效果对比</h2>
            <p className="text-gray-500">从普通实拍图到专业电商详情页</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">上传前</span>
                <span className="text-sm text-gray-400">用户上传的普通实拍图</span>
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8 aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="h-32 w-32 bg-gray-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Image className="h-10 w-10 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400">手机拍摄的产品图</p>
                  <p className="text-xs text-gray-300 mt-1">无背景处理 · 无设计排版 · 无文案</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2.5 py-1 rounded-full bg-violet-100 text-violet-600 text-xs font-medium">生成后</span>
                <span className="text-sm text-gray-400">AI 生成的电商详情页</span>
              </div>
              <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-8 aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="grid grid-cols-3 gap-2 mb-4 max-w-[240px] mx-auto">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <div key={n} className="aspect-square bg-gradient-to-br from-violet-300 to-indigo-300 rounded-lg flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium">
                          {n === 1 ? "主图" : n === 2 ? "场景" : n === 3 ? "细节" : n === 4 ? "卖点" : n === 5 ? "参数" : "详情"}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-violet-600 font-medium">专业电商视觉</p>
                  <p className="text-xs text-violet-400 mt-1">白底主图 · 场景图 · 细节图 · 卖点图 · 详情页</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 案例展示区 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">多品类案例展示</h2>
            <p className="text-gray-500">不同品类、不同平台的真实生成效果</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {cases.map((c, i) => (
              <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                <div className={`h-28 bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                  <Package className="h-8 w-8 text-white/60" />
                </div>
                <CardContent className="py-3 px-3">
                  <div className="text-sm font-medium text-gray-900">{c.category}</div>
                  <div className="text-xs text-gray-400 truncate">{c.product}</div>
                  <div className="text-xs text-gray-300 mt-1">{c.platform}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 价格套餐区 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">简单透明的价格</h2>
            <p className="text-gray-500">按需选择，随时升级或降级</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <Card
                key={i}
                className={`relative ${plan.highlight ? "border-2 border-violet-500 shadow-lg shadow-violet-100" : "border shadow-sm"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                    最受欢迎
                  </div>
                )}
                <CardContent className="pt-6 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mb-4">{plan.desc}</p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">¥{plan.price}</span>
                    <span className="text-gray-400 text-sm">/月</span>
                  </div>
                  <div className="text-sm text-violet-600 font-medium mb-4">{plan.credits}</div>
                  <div className="space-y-2 mb-6">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600">{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.price === "0" ? "/workspace/new" : "/register"}>
                    <Button
                      className={`w-full ${plan.highlight ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.price === "0" ? "免费开始" : "立即订阅"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">常见问题</h2>
            <p className="text-gray-500">关于图流 AI，你可能想知道的</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-0 shadow-sm bg-white">
                <CardContent className="py-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gray-900 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">开始生成你的商品图</h2>
            <p className="text-gray-400 mb-8 text-lg">
              上传一张产品图，几分钟内获得整套电商视觉素材
            </p>
            <Link href="/workspace/new">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white text-base px-8 h-12 shadow-lg">
                <Upload className="mr-2 h-5 w-5" />
                立即上传产品图
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-gray-900" />
                </div>
                <span className="text-lg font-bold text-white">图流 AI</span>
              </div>
              <p className="text-sm text-gray-500">面向电商商家的 AI 商品视觉自动化生成平台</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">产品</h4>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="block text-gray-400 hover:text-white transition">功能介绍</Link>
                <Link href="/cases" className="block text-gray-400 hover:text-white transition">案例展示</Link>
                <Link href="/pricing" className="block text-gray-400 hover:text-white transition">价格套餐</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">支持平台</h4>
              <div className="space-y-2 text-sm">
                <span className="block text-gray-400">淘宝 / 天猫</span>
                <span className="block text-gray-400">京东 / 拼多多</span>
                <span className="block text-gray-400">抖音 / 亚马逊</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">关于</h4>
              <div className="space-y-2 text-sm">
                <span className="block text-gray-400">用户协议</span>
                <span className="block text-gray-400">隐私政策</span>
                <span className="block text-gray-400">联系我们</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; 2026 图流 AI. All rights reserved.</p>
            <p className="text-sm text-gray-500">AI 电商商品图与详情页生成平台</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
