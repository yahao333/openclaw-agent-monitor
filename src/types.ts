/**
 * @file types.ts
 * @description 定义整个应用中使用的 TypeScript 类型接口。
 * 对于小白来说：这里就像是给数据定制的“模具”，规定了每个 Agent 必须长什么样（有哪些属性）。
 */

export interface LocalizedString {
  en: string;
  zh: string;
}

export interface Agent {
  id: string;          // 唯一标识符 (例如: "agent-001")
  name: LocalizedString; // Agent 的名称 (支持中英文)
  status: 'online' | 'offline'; // 状态：在线 或 离线
  lastActive: LocalizedString;  // 最后活跃时间 (支持中英文)
  lastActiveTimestamp: number;   // 最后活跃时间戳 (Unix ms, 超过10分钟未更新视为离线)
  greeting: LocalizedString;   // 最后一次上线时的问候语
}
