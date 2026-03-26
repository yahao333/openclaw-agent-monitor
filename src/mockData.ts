/**
 * @file mockData.ts
 * @description 提供模拟的 Agent 数据，用于在没有真实后端（如 Vercel Serverless）时展示界面。
 * 对于小白来说：这里就是我们的"假数据"仓库，方便我们先把网页的壳子和动画做出来。
 */

import { Agent } from './types';

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'claw-001',
    name: { en: 'Alpha Scraper', zh: 'Alpha 抓取者' },
    status: 'online',
    lastActive: { en: 'Just now', zh: '刚刚' },
    greeting: { en: 'Hello world, I am ready to scrape!', zh: '你好世界，我准备好抓取了！' }
  },
  {
    id: 'claw-002',
    name: { en: 'Beta Analyzer', zh: 'Beta 分析师' },
    status: 'online',
    lastActive: { en: '2 mins ago', zh: '2分钟前' },
    greeting: { en: 'Data is beautiful.', zh: '数据如此美丽。' }
  },
  {
    id: 'claw-003',
    name: { en: 'Gamma Sleeper', zh: 'Gamma 沉睡者' },
    status: 'offline',
    lastActive: { en: '3 hours ago', zh: '3小时前' },
    greeting: { en: 'Going to sleep now...', zh: '我要去睡觉了...' }
  },
  {
    id: 'claw-004',
    name: { en: 'Delta Monitor', zh: 'Delta 监控' },
    status: 'online',
    lastActive: { en: 'Just now', zh: '刚刚' },
    greeting: { en: 'All systems nominal.', zh: '所有系统运行正常。' }
  },
  {
    id: 'claw-005',
    name: { en: 'Epsilon Backup', zh: 'Epsilon 备用' },
    status: 'offline',
    lastActive: { en: '2 days ago', zh: '2天前' },
    greeting: { en: 'Standing by for backup.', zh: '随时准备替补。' }
  },
  {
    id: 'claw-006',
    name: { en: 'Zeta Crawler', zh: 'Zeta 爬虫' },
    status: 'online',
    lastActive: { en: '1 min ago', zh: '1分钟前' },
    greeting: { en: 'Crawling the web...', zh: '正在爬取网络...' }
  },
  {
    id: 'claw-007',
    name: { en: 'Eta DB Sync', zh: 'Eta 数据库同步' },
    status: 'offline',
    lastActive: { en: '5 hours ago', zh: '5小时前' },
    greeting: { en: 'Syncing databases...', zh: '正在同步数据库...' }
  }
];
