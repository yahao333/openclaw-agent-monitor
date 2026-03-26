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
}

export default function ListView({ agents, lang }: ListViewProps) {
  useEffect(() => {
    console.log('[调试信息] 📝 列表视图已挂载');
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
            <th className="p-4 font-semibold">{t[lang].agentName}</th>
            <th className="p-4 font-semibold">{t[lang].status}</th>
            <th className="p-4 font-semibold">{t[lang].role}</th>
            <th className="p-4 font-semibold">{t[lang].greeting}</th>
            <th className="p-4 font-semibold">{t[lang].lastActive}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {agents.map((agent) => {
            const isOnline = agent.status === 'online';
            
            return (
              <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900">{agent.name[lang]}</div>
                  <div className="text-xs text-gray-400">{agent.id}</div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isOnline ? `🟢 ${t[lang].online}` : `⚪ ${t[lang].offline}`}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-600">{agent.role[lang]}</td>
                <td className="p-4 text-sm text-gray-600 italic">"{agent.greeting[lang]}"</td>
                <td className="p-4 text-sm text-gray-600">{agent.lastActive[lang]}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
