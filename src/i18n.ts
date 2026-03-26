/**
 * @file i18n.ts
 * @description 国际化 (i18n) 配置文件，包含中英文翻译字典。
 * 对于小白来说：这里就像是一个“翻译字典”，根据用户选择的语言，网页会来这里查找对应的文字。
 */

export type Language = 'en' | 'zh';

export const t = {
  en: {
    title: "OpenClaw Agent Monitor",
    subtitle: "Real-time Serverless Agent Status",
    total: "Total",
    online: "Online",
    offline: "Offline",
    aquarium: "Aquarium",
    grid: "Grid",
    list: "List",
    footer: "Currently using mock data. Will connect to Vercel Serverless API in the future. | Contact: X @pai12468",
    swimming: "🟢 Swimming = Online",
    sleeping: "⚪ Sleeping = Offline",
    clickToEvade: "👆 Click a swimming agent to make it evade!",
    agentName: "Agent Name",
    status: "Status",
    greeting: "Greeting",
    lastActive: "Last Active",
    langToggle: "中文",
    settings: "Settings",
    displayMode: "Display Mode",
    showBubbles: "Show Bubbles",
    token: "Agent Token",
    tokenPlaceholder: "Paste your agent API token",
    uploadAgents: "Upload Agent JSON",
    close: "Close",
    debugSwitchView: "User switched view mode to:",
    debugSwitchLang: "User switched language to:",
    debugToggleBubbles: "User toggled bubbles to:",
    debugEvade: "Agent evaded:"
  },
  zh: {
    title: "OpenClaw Agent 监控中心",
    subtitle: "实时查看 Serverless Agent 的运行状态",
    total: "总计",
    online: "在线",
    offline: "离线",
    aquarium: "水族箱",
    grid: "网格",
    list: "列表",
    footer: "当前使用模拟数据展示。未来将接入 Vercel Serverless API 获取真实状态。| 联系方式：X @pai12468",
    swimming: "🟢 游动中 = 在线 (Online)",
    sleeping: "⚪ 沉底睡眠 = 离线 (Offline)",
    clickToEvade: "👆 点击在线生物可使其快速避难",
    agentName: "Agent 名称",
    status: "当前状态",
    greeting: "上线问候",
    lastActive: "最后活跃",
    langToggle: "English",
    settings: "设置",
    displayMode: "展示方式",
    showBubbles: "模拟水泡",
    token: "Agent Token",
    tokenPlaceholder: "粘贴你的 Agent API Token",
    uploadAgents: "上传 Agent JSON",
    close: "关闭",
    debugSwitchView: "用户切换了视图模式，当前模式为:",
    debugSwitchLang: "用户切换了语言，当前语言为:",
    debugToggleBubbles: "用户切换了水泡显示状态:",
    debugEvade: "生物受到惊吓，快速避难:"
  }
};
