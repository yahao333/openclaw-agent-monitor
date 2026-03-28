/**
 * @file GridView.tsx
 * @description 网格视图组件。以卡片的形式展示所有的 Agent，适合查看详细信息。
 */

import React, { useEffect } from 'react';
import { Agent } from '../types';
import { Bot, Clock, MessageCircle } from 'lucide-react';
import { Language, t } from '../i18n';

interface GridViewProps {
  agents: Agent[];
  lang: Language;
  searchQuery?: string;
}

export default function GridView({ agents, lang, searchQuery = '' }: GridViewProps) {
  useEffect(() => {
    console.log('[调试信息] 📱 网格视图已挂载');
  }, []);

  const isMatched = (agent: Agent) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return agent.name.en.toLowerCase().includes(query) ||
           agent.name.zh.includes(query);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {agents.map((agent) => {
        const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;
        const isOnline = agent.lastActiveTimestamp
          ? Date.now() - agent.lastActiveTimestamp <= OFFLINE_THRESHOLD_MS
          : agent.status === 'online';
        const matched = isMatched(agent);

        return (
          <div
            key={agent.id}
            className={`relative overflow-hidden rounded-xl border p-4 sm:p-6 shadow-sm transition-all hover:shadow-md ${
              isOnline ? 'bg-white border-green-100' : 'bg-gray-50 border-gray-200'
            } ${!matched ? 'opacity-40 grayscale' : ''} ${
              matched && searchQuery.trim() ? 'ring-2 ring-blue-400 ring-offset-2' : ''
            }`}
          >
            {/* 顶部：图标和状态徽章 */}
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-lg ${isOnline ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                <Bot size={20} className="sm:w-6 sm:h-6" />
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {isOnline ? (
                  <><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span> <span className="text-xs">{t[lang].online}</span></>
                ) : (
                  <><span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gray-400"></span> <span className="text-xs">{t[lang].offline}</span></>
                )}
              </span>
            </div>

            {/* 中间：名称 */}
            <div className="mb-3 sm:mb-4">
              <h3 className={`text-base sm:text-lg font-bold ${matched && searchQuery.trim() ? 'text-blue-700' : 'text-gray-900'}`}>
                {agent.name[lang]}
              </h3>
            </div>

            {/* 底部：详细信息（问候语和最后活跃时间） */}
            <div className="space-y-2 border-t pt-3 sm:pt-4">
              <div className="flex items-start text-xs sm:text-sm text-gray-600">
                <MessageCircle size={14} className="mr-1.5 sm:mr-2 mt-0.5 text-gray-400 shrink-0" />
                <span className="italic line-clamp-2">"{agent.greeting[lang]}"</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-600">
                <Clock size={14} className="mr-1.5 sm:mr-2 text-gray-400" />
                <span>{t[lang].lastActive}: {agent.lastActive[lang]}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
