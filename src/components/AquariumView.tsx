/**
 * @file AquariumView.tsx
 * @description 水族箱视图组件。使用 framer-motion 库来实现 Agent 像鱼一样游动的动画效果。
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Moon, Wind } from 'lucide-react';
import { Agent } from '../types';
import { Language, t } from '../i18n';
import { getAgentName } from '../utils';

interface AquariumViewProps {
  agents: Agent[];
  lang: Language;
  showBubbles: boolean;
  searchQuery?: string;
  offlineThresholdMinutes: number;
}

export default function AquariumView({ agents, lang, showBubbles, searchQuery = '', offlineThresholdMinutes }: AquariumViewProps) {
  // 调试信息：当组件渲染时，在控制台打印日志
  useEffect(() => {
    console.log(`[调试信息] 🌊 水族箱视图已挂载，当前接收到的 Agent 数量: ${agents.length}，是否显示水泡: ${showBubbles}`);
    return () => {
      console.log('[调试信息] 🌊 水族箱视图已卸载');
    };
  }, [agents, showBubbles]);

  return (
    <div className="relative w-full h-[350px] sm:h-[450px] md:h-[600px] bg-gradient-to-b from-cyan-500 to-blue-900 rounded-2xl overflow-hidden border-2 sm:border-4 border-blue-300 shadow-2xl">
      {/* 渲染水族箱的背景装饰：动态水泡 (根据 showBubbles 状态决定是否渲染) */}
      {showBubbles && <Bubbles />}

      {/* 遍历所有的 Agent，为每个 Agent 渲染一个"鱼" */}
      {agents.map((agent) => (
        <FishAgent key={agent.id} agent={agent} lang={lang} searchQuery={searchQuery} offlineThresholdMinutes={offlineThresholdMinutes} />
      ))}

      {/* 左下角的状态提示 - 移动端隐藏 */}
      <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/40 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg backdrop-blur-md text-xs sm:text-sm pointer-events-none z-20">
        <p className="hidden sm:block">{t[lang].swimming}</p>
        <p className="hidden sm:block">{t[lang].sleeping}</p>
        <p className="mt-0.5 sm:mt-1 text-yellow-300 text-xs font-bold">{t[lang].clickToEvade}</p>
      </div>
    </div>
  );
}

/**
 * 内部组件：代表水族箱里的一条"鱼"（即一个 Agent）
 */
function FishAgent({ agent, lang, searchQuery = '', offlineThresholdMinutes }: { agent: Agent; lang: Language; searchQuery?: string; offlineThresholdMinutes: number }) {
  // 根据 lastActiveTimestamp 判断是否离线：超过指定分钟未上报视为离线
  const OFFLINE_THRESHOLD_MS = offlineThresholdMinutes * 60 * 1000;
  const now = Date.now();
  const diff = agent.lastActiveTimestamp ? now - agent.lastActiveTimestamp : null;
  const isOnline = diff !== null ? diff <= OFFLINE_THRESHOLD_MS : agent.status === 'online';
  console.debug(`[OfflineCheck] agent=${getAgentName(agent, lang)} lastActiveTimestamp=${agent.lastActiveTimestamp} diff=${diff}ms threshold=${OFFLINE_THRESHOLD_MS}ms isOnline=${isOnline}`);

  // 检查是否匹配搜索
  const isMatched = () => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const name = getAgentName(agent, lang);
    return name.toLowerCase().includes(query);
  };

  const matched = isMatched();
  
  // 辅助函数：生成安全的随机百分比坐标 (限制在 10% 到 85% 之间，防止跑出边界)
  const getRandomLeft = () => Math.floor(Math.random() * 75) + 10;
  const getRandomTop = () => Math.floor(Math.random() * 70) + 10;

  // 状态：记录当前生物是否正在"避难"
  const [isEvading, setIsEvading] = useState(false);
  
  // 状态：记录当前的百分比坐标 (使用惰性初始化，保证初始位置随机且不越界)
  const [pos, setPos] = useState(() => ({
    left: getRandomLeft(),
    top: getRandomTop(),
  }));

  // 状态：记录逃跑方向，用于倾斜动画
  const [evadeDirection, setEvadeDirection] = useState(1); // 1 为向右，-1 为向左

  // 正常游动逻辑：每隔几秒设定一个新的随机目标点
  useEffect(() => {
    if (!isOnline || isEvading) return;

    const move = () => {
      setPos({ left: getRandomLeft(), top: getRandomTop() });
    };

    // 随机 4 到 8 秒游动一次
    const intervalTime = 4000 + Math.random() * 4000;
    const timer = setInterval(move, intervalTime);

    // 初始也触发一次移动，让它们一加载就开始游动
    const timeout = setTimeout(move, 100);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [isOnline, isEvading]);

  // 处理点击避难的函数
  const handleEvade = () => {
    // 如果离线或者正在避难中，则不触发
    if (!isOnline || isEvading) return;
    
    console.log(`[调试信息] 💨 ${t[lang].debugEvade} ${getAgentName(agent, lang)}`);
    setIsEvading(true);
    
    // 生成一个新的安全目标点 (保证在水族箱内)
    const newLeft = getRandomLeft();
    const newTop = getRandomTop();
    
    // 判断是向左逃还是向右逃
    setEvadeDirection(newLeft > pos.left ? 1 : -1);
    setPos({ left: newLeft, top: newTop });

    // 0.6秒后解除避难状态
    setTimeout(() => {
      setIsEvading(false);
    }, 600);
  };

  // 离线时沉底 (固定在底部 85% 的位置)
  const currentTop = isOnline ? pos.top : 85;

  // 动画参数：直接动画 left 和 top 百分比，彻底解决越界问题
  const currentAnimation = {
    left: `${pos.left}%`,
    top: `${currentTop}%`,
    scale: isEvading ? 0.8 : 1,
    rotate: isEvading ? evadeDirection * 15 : 0,
  };

  // 过渡效果
  const currentTransition = isEvading
    ? { duration: 0.4, ease: "easeOut" } // 避难时：速度快，爆发力强
    : {
        duration: isOnline ? 5 + Math.random() * 3 : 3, // 正常游动：缓慢平滑
        ease: "easeInOut",
      };

  return (
    <motion.div
      onClick={handleEvade}
      className={`absolute flex flex-col items-center justify-center p-3 rounded-2xl backdrop-blur-md shadow-lg transition-colors duration-500 ${
        isOnline
          ? matched
            ? searchQuery.trim()
              ? 'bg-white/40 border-2 border-yellow-400 text-white cursor-pointer hover:bg-white/50 ring-2 ring-yellow-300'
              : 'bg-white/20 border border-white/40 text-white cursor-pointer hover:bg-white/30'
            : 'bg-white/10 border border-white/20 text-white/50 cursor-pointer'
          : matched
            ? 'bg-gray-800/60 border border-gray-600/50 text-gray-400 cursor-not-allowed ring-1 ring-gray-500'
            : 'bg-gray-800/30 border border-gray-600/30 text-gray-500 grayscale cursor-not-allowed'
      }`}
      style={{
        transform: 'translate(-50%, -50%)' // 确保中心点对齐坐标
      }}
      // 设定初始状态，防止从左上角 (0,0) 飞入
      initial={{
        left: `${pos.left}%`,
        top: `${currentTop}%`,
      }}
      // 传入动画配置
      animate={currentAnimation}
      // 传入过渡配置
      transition={currentTransition}
      // 添加悬停效果，方便用户交互
      whileHover={isOnline && !isEvading && matched ? { scale: 1.1, zIndex: 10 } : {}}
    >
      {/* 状态图标 */}
      <div className="relative mb-2">
        {isOnline ? (
          <Bot size={32} className="text-green-300 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        ) : (
          <Moon size={32} className="text-gray-500" />
        )}
        
        {/* 在线时显示跳动的小绿点 */}
        {isOnline && !isEvading && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}

        {/* 避难时显示疾风图标 */}
        {isEvading && (
          <span className="absolute -top-2 -right-4 text-white animate-pulse">
            <Wind size={20} />
          </span>
        )}
      </div>

      {/* Agent 名称 */}
      <span className="font-bold text-sm whitespace-nowrap">{getAgentName(agent, lang)}</span>
    </motion.div>
  );
}

/**
 * 内部组件：渲染水族箱的动态水泡背景
 * 对于小白来说：这里生成了许多大小、速度不同的圆圈，让它们从底部往上飘，模拟真实水泡。
 */
function Bubbles() {
  // 使用 useMemo 随机生成 30 个水泡的初始属性，避免每次渲染都重新生成
  const bubbles = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      size: Math.random() * 15 + 5, // 水泡大小：5px 到 20px
      left: Math.random() * 100, // 水平位置：0% 到 100%
      duration: Math.random() * 5 + 5, // 飘浮时间：5秒 到 10秒
      delay: Math.random() * 5, // 延迟出发时间：0秒 到 5秒
      wobble: Math.random() * 30 - 15, // 左右摇摆幅度
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {bubbles.map((b) => (
        <motion.div
          key={b.id}
          className="absolute rounded-full bg-white/20 border border-white/30 backdrop-blur-sm"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: -30, // 初始位置在水族箱底部外面一点
          }}
          animate={{
            y: [-30, -650], // 从底部往上飘出水族箱顶部 (高度600px，-650确保完全飘出)
            x: [0, b.wobble, -b.wobble, 0], // 左右摇摆
          }}
          transition={{
            y: {
              duration: b.duration,
              repeat: Infinity,
              ease: "linear", // 匀速上升
              delay: b.delay,
            },
            x: {
              duration: b.duration / 2,
              repeat: Infinity,
              ease: "easeInOut", // 平滑摇摆
              delay: b.delay,
            }
          }}
        />
      ))}
    </div>
  );
}
