export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-[24px] font-bold text-[#1d1d1f] mb-6">账户设置</h1>
      
      <div className="bg-white rounded-xl p-6 border border-[#e5e5e5]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">个人信息</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#f5f5f7]">
              <span className="text-sm text-[#666]">用户名</span>
              <span className="text-sm text-[#1d1d1f]">用户</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#f5f5f7]">
              <span className="text-sm text-[#666]">邮箱</span>
              <span className="text-sm text-[#1d1d1f]">user@example.com</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[#666]">注册时间</span>
              <span className="text-sm text-[#1d1d1f]">2024-01-15</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">偏好设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-[#f5f5f7]">
              <span className="text-sm text-[#666]">语言</span>
              <span className="text-sm text-[#1d1d1f]">简体中文</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-[#666]">主题</span>
              <span className="text-sm text-[#1d1d1f]">浅色模式</span>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4">安全设置</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f7] rounded-xl text-sm hover:bg-[#e5e5e5] transition-colors cursor-pointer">
              <span className="text-[#666]">修改密码</span>
              <span className="text-[#1d1d1f]">点击修改</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f7] rounded-xl text-sm hover:bg-[#e5e5e5] transition-colors cursor-pointer">
              <span className="text-[#666]">绑定手机号</span>
              <span className="text-[#1d1d1f]">点击绑定</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}