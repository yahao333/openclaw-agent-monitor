/**
 * @file App.tsx
 * @description 应用的主入口组件。负责管理当前选中的视图状态，并渲染对应的组件。
 * 对于小白来说：这里是整个网页的“总指挥部”，它决定了当前屏幕上显示的是水族箱、网格还是列表。
 */

import React, { useState, useEffect } from 'react';
import { MOCK_AGENTS } from './mockData';
import AquariumView from './components/AquariumView';
import GridView from './components/GridView';
import ListView from './components/ListView';
import { LayoutGrid, List, Fish, Activity, Globe, Settings, X, User, LogIn } from 'lucide-react';
import { Language, t } from './i18n';
import RegisterForm from './components/RegisterForm';

// 定义视图类型的联合类型，限制只能是这三个字符串之一
type ViewMode = 'aquarium' | 'grid' | 'list';

export default function App() {
  // 状态管理：记录当前选中的视图模式，默认是 'aquarium' (水族箱)
  const [viewMode, setViewMode] = useState<ViewMode>('aquarium');
  
  // 状态管理：记录当前选中的语言，默认是 'en' (英文)
  const [lang, setLang] = useState<Language>('en');

  // 状态管理：控制设置页面的打开/关闭
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // 状态管理：控制是否显示水族箱的水泡，默认开启
  const [showBubbles, setShowBubbles] = useState(true);

  // 状态管理：控制注册表单的打开/关闭
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // 状态管理：记录当前登录用户
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // 调试信息：当视图模式改变时打印日志
  useEffect(() => {
    console.log(`[调试信息] 🔄 ${t[lang].debugSwitchView} ${viewMode}`);
  }, [viewMode, lang]);

  // 调试信息：当语言改变时打印日志
  useEffect(() => {
    console.log(`[调试信息] 🌐 ${t[lang].debugSwitchLang} ${lang}`);
  }, [lang]);

  // 调试信息：当水泡开关改变时打印日志
  useEffect(() => {
    console.log(`[调试信息] 🫧 ${t[lang].debugToggleBubbles} ${showBubbles}`);
  }, [showBubbles, lang]);

  // 切换语言的函数
  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  // 计算在线和离线的数量，用于在顶部展示统计信息
  const onlineCount = MOCK_AGENTS.filter(a => a.status === 'online').length;
  const offlineCount = MOCK_AGENTS.length - onlineCount;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 顶部导航栏和统计信息 */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          
          {/* 左侧：标题和统计 */}
          <div className="flex items-center gap-6 mb-4 md:mb-0">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="text-blue-600" />
                {t[lang].title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t[lang].subtitle}
              </p>
            </div>
            
            {/* 状态统计小药丸 */}
            <div className="hidden sm:flex items-center gap-3 border-l pl-6">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-semibold">{t[lang].total}</span>
                <span className="text-lg font-bold">{MOCK_AGENTS.length}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-green-600 uppercase font-semibold">{t[lang].online}</span>
                <span className="text-lg font-bold text-green-700">{onlineCount}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 uppercase font-semibold">{t[lang].offline}</span>
                <span className="text-lg font-bold text-gray-700">{offlineCount}</span>
              </div>
            </div>
          </div>

          {/* 右侧：操作按钮组 */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200">
                <User size={18} />
                {currentUser}
              </div>
            ) : (
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-all"
              >
                <LogIn size={18} />
                Sign Up
              </button>
            )}

            {/* 语言切换按钮 */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all"
            >
              <Globe size={18} />
              {t[lang].langToggle}
            </button>

            {/* 设置按钮 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all"
            >
              <Settings size={18} />
              {t[lang].settings}
            </button>
          </div>
        </header>

        {/* 主体内容区域：根据 viewMode 状态渲染不同的组件 */}
        <main className="transition-all duration-300 ease-in-out">
          {viewMode === 'aquarium' && <AquariumView agents={MOCK_AGENTS} lang={lang} showBubbles={showBubbles} />}
          {viewMode === 'grid' && <GridView agents={MOCK_AGENTS} lang={lang} />}
          {viewMode === 'list' && <ListView agents={MOCK_AGENTS} lang={lang} />}
        </main>

        {/* 底部提示信息 */}
        <footer className="text-center text-sm text-gray-400 mt-8">
          <p>{t[lang].footer}</p>
        </footer>

      </div>

      {/* 注册表单 */}
      {isRegisterOpen && (
        <RegisterForm
          onClose={() => setIsRegisterOpen(false)}
          onSuccess={(email) => {
            setCurrentUser(email);
            setIsRegisterOpen(false);
          }}
        />
      )}

      {/* 设置页面 (模态框) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            {/* 模态框头部 */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Settings className="text-blue-600" />
                {t[lang].settings}
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* 模态框内容 */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">{t[lang].displayMode}</h3>
                <div className="grid grid-cols-3 gap-3">
                  {/* 水族箱模式按钮 */}
                  <button 
                    onClick={() => setViewMode('aquarium')} 
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      viewMode === 'aquarium' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Fish size={28} />
                    <span className="text-sm font-medium">{t[lang].aquarium}</span>
                  </button>
                  
                  {/* 网格模式按钮 */}
                  <button 
                    onClick={() => setViewMode('grid')} 
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      viewMode === 'grid' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <LayoutGrid size={28} />
                    <span className="text-sm font-medium">{t[lang].grid}</span>
                  </button>
                  
                  {/* 列表模式按钮 */}
                  <button 
                    onClick={() => setViewMode('list')} 
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      viewMode === 'list' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <List size={28} />
                    <span className="text-sm font-medium">{t[lang].list}</span>
                  </button>
                </div>
              </div>

              {/* 水泡开关设置 (仅在水族箱模式下有意义，但可以全局设置) */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t[lang].showBubbles}</h3>
                </div>
                {/* 自定义 Toggle 开关 */}
                <button
                  onClick={() => setShowBubbles(!showBubbles)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    showBubbles ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showBubbles ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            {/* 模态框底部 */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                {t[lang].close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
