/**
 * @file ListView.tsx
 * @description 列表视图组件。以表格的形式展示所有的 Agent，适合进行批量管理和数据对比。
 */

import React, { useEffect } from 'react';
import { Agent } from '../types';
import { Language, t } from '../i18n';

interface ListViewProps {
  agents: Agent[];
  lang: Language;
  searchQuery?: string;
}

export default function ListView({ agents, lang, searchQuery = '' }: ListViewProps) {
  useEffect(() => {
    console.log('[调试信息] 📝 列表视图已挂载');
  }, []);

  const isMatched = (agent: Agent) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return agent.name.en.toLowerCase().includes(query) ||
           agent.name.zh.includes(query);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-xs sm:text-sm text-gray-600">
            <th className="p-3 sm:p-4 font-semibold">{t[lang].agentName}</th>
            <th className="p-3 sm:p-4 font-semibold">{t[lang].status}</th>
            <th className="p-3 sm:p-4 font-semibold hidden sm:table-cell">{t[lang].greeting}</th>
            <th className="p-3 sm:p-4 font-semibold">{t[lang].lastActive}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agents.map((agent) => {
            const isOnline = agent.status === 'online';
            const matched = isMatched(agent);

            return (
              <tr
                key={agent.id}
                className={`hover:bg-gray-50 transition-colors ${!matched ? 'opacity-40' : ''} ${
                  matched && searchQuery.trim() ? 'bg-blue-50' : ''
                }`}
              >
                <td className="p-3 sm:p-4">
                  <div className={`font-medium text-sm sm:text-base ${matched && searchQuery.trim() ? 'text-blue-700' : 'text-gray-900'}`}>
                    {agent.name[lang]}
                  </div>
                  <div className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-none">{agent.id}</div>
                </td>
                <td className="p-3 sm:p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${
                    isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isOnline ? `🟢 ${t[lang].online}` : `⚪ ${t[lang].offline}`}
                  </span>
                </td>
                <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600 italic hidden sm:table-cell">"{agent.greeting[lang]}"</td>
                <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-600">{agent.lastActive[lang]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
