/**
 * @file App.tsx
 * @description 应用的主入口组件。负责管理当前选中的视图状态，并渲染对应的组件。
 * 对于小白来说：这里是整个网页的“总指挥部”，它决定了当前屏幕上显示的是水族箱、网格还是列表。
 */

import React, { useState, useEffect, useRef } from 'react';
import { MOCK_AGENTS } from './mockData';
import { Agent } from './types';
import AquariumView from './components/AquariumView';
import GridView from './components/GridView';
import ListView from './components/ListView';
import { LayoutGrid, List, Fish, Activity, Globe, Settings, X, Loader2, Upload, RotateCcw } from 'lucide-react';
import { Language, t } from './i18n';
import {
  useUser,
  UserButton,
  SignInButton,
  SignUpButton,
} from '@clerk/react';

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

  // 状态管理：Token 字段
  const [agentToken, setAgentToken] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 状态管理：Agent 数据
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);

  // 状态管理：Clerk 认证
  const { isSignedIn, user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载用户设置
  useEffect(() => {
    if (!user || !isSignedIn) return;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        console.log('[loadSettings] Fetching settings for user:', user.id);
        const res = await fetch('/api/settings', {
          headers: { 'x-user-id': user.id },
        });
        console.log('[loadSettings] Response status:', res.status);
        if (res.ok) {
          const settings = await res.json();
          console.log('[loadSettings] Settings loaded:', settings);
          console.log('[loadSettings] Token from settings:', settings.token);
          setViewMode(settings.viewMode || 'aquarium');
          setLang(settings.lang || 'en');
          setShowBubbles(settings.showBubbles !== false);
          setAgentToken(settings.token || '');
        } else {
          console.error('[loadSettings] Failed to load settings:', res.status);
        }
      } catch (err) {
        console.error('[loadSettings] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, isSignedIn]);

  // 加载 Agent 数据
  useEffect(() => {
    if (!user || !isSignedIn) return;

    const loadAgents = async () => {
      try {
        const res = await fetch('/api/agents', {
          headers: { 'x-user-id': user.id },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setAgents(data);
          }
        }
      } catch (err) {
        console.error('Failed to load agents:', err);
      }
    };

    loadAgents();
  }, [user, isSignedIn]);

  // 保存设置
  const saveSettings = async () => {
    if (!user || !isSignedIn) return;

    setIsSaving(true);
    try {
      const payload = { viewMode, lang, showBubbles, token: agentToken };
      console.log('[saveSettings] Saving settings for user:', user.id, payload);
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify(payload),
      });

      console.log('[saveSettings] Response status:', res.status);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('[saveSettings] Save failed:', res.status, errData);
        alert('Failed to save settings: ' + (errData.error || res.statusText));
        return;
      }

      console.log('[saveSettings] Settings saved successfully!');
      // Save agents to Redis if token is set
      if (agentToken) {
        await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-agent-token': agentToken,
          },
          body: JSON.stringify(agents),
        });
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setIsSaving(false);
      setIsSettingsOpen(false);
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);

        if (Array.isArray(parsed)) {
          setAgents(parsed);
        } else {
          alert('Invalid format: expected an array of agents');
        }
      } catch {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  // 重置 Token
  const handleResetToken = () => {
    setAgentToken('');
    setShowResetConfirm(false);
  };

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
  const onlineCount = agents.filter(a => a.status === 'online').length;
  const offlineCount = agents.length - onlineCount;

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
            {isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-all cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
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
          {viewMode === 'aquarium' && <AquariumView agents={agents} lang={lang} showBubbles={showBubbles} />}
          {viewMode === 'grid' && <GridView agents={agents} lang={lang} />}
          {viewMode === 'list' && <ListView agents={agents} lang={lang} />}
        </main>

        {/* 底部提示信息 */}
        <footer className="text-center text-sm text-gray-400 mt-8">
          <p>{t[lang].footer}</p>
        </footer>

      </div>

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

              {/* Token 字段 */}
              <div className="pt-6 border-t border-gray-100 space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t[lang].token}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={agentToken}
                    onChange={(e) => setAgentToken(e.target.value)}
                    placeholder={t[lang].tokenPlaceholder}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {agentToken ? (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="px-3 py-2 border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reset"
                    >
                      <RotateCcw size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setAgentToken(crypto.randomUUID())}
                      className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                      title="Generate"
                    >
                      Generate
                    </button>
                  )}
                </div>
              </div>

              {/* 重置确认弹窗 */}
              {showResetConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Reset Token?</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      This will clear your Agent Token. Any agent data linked to this token will no longer sync.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetToken}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 上传 Agent JSON */}
              <div className="pt-6 border-t border-gray-100 space-y-2">
                <label className="text-sm font-semibold text-gray-900">{t[lang].uploadAgents}</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-200 border-dashed rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <Upload size={16} />
                  {t[lang].uploadAgents}
                </button>
                <p className="text-xs text-gray-400">
                  {agents.length} agents loaded
                </p>
              </div>
            </div>
            
            {/* 模态框底部 */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between">
              {isSignedIn && (
                <button
                  onClick={saveSettings}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving && <Loader2 size={16} className="animate-spin" />}
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              )}
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={`px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors shadow-sm ${isSignedIn ? '' : 'w-full'}`}
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
