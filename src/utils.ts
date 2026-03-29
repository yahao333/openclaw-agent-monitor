import { Language } from './i18n';
import { Agent } from './types';

/**
 * 安全获取 Agent 名称，缺失时回退到 id
 */
export function getAgentName(agent: Agent, lang: Language): string {
  return agent.name?.[lang] || agent.name?.en || agent.id;
}

/**
 * 将 lastActiveTimestamp 转换为相对时间字符串
 * 例如: "2 mins ago" / "2分钟前"
 */
export function formatLastActive(lastActiveTimestamp: number, lang: Language): string {
  const diff = Date.now() - lastActiveTimestamp;

  if (diff < 0) {
    // agent 时钟比浏览器快，视为"刚刚"
    return lang === 'zh' ? '刚刚' : 'Just now';
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return lang === 'zh' ? '刚刚' : 'Just now';
  }
  if (minutes < 60) {
    return lang === 'zh' ? `${minutes}分钟前` : `${minutes} min ago`;
  }
  if (hours < 24) {
    return lang === 'zh' ? `${hours}小时前` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (days < 30) {
    return lang === 'zh' ? `${days}天前` : `${days} day${days > 1 ? 's' : ''} ago`;
  }
  // 超过30天直接显示时间戳
  return new Date(lastActiveTimestamp).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US');
}
