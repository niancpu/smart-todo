import { useState, useEffect } from 'react';
import type { Task } from '@/types';

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function calcElapsed(task: Task): number {
  let elapsed = task.doingElapsedMs ?? 0;
  if (task.status === 'doing' && task.doingStartedAt) {
    elapsed += Date.now() - new Date(task.doingStartedAt).getTime();
  }
  return elapsed;
}

/** 返回 null 表示无需显示时间标签 */
export function useDoingTimer(task: Task): { text: string; isOvertime: boolean } | null {
  const isDoing = task.status === 'doing';
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!isDoing) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isDoing]);

  const elapsed = calcElapsed(task);
  const hasEstimate = task.estimatedMinutes != null && task.estimatedMinutes > 0;

  // 没有预估也没有 doing 记录 → 不显示
  if (!hasEstimate && elapsed === 0) return null;

  if (hasEstimate) {
    const estimateMs = task.estimatedMinutes! * 60_000;
    const remaining = estimateMs - elapsed;
    if (remaining > 0) {
      return { text: formatTime(remaining), isOvertime: false };
    }
    // 超时：正数显示已超出的时间
    return { text: `+${formatTime(-remaining)}`, isOvertime: true };
  }

  // 无预估 → 正数计时
  return { text: formatTime(elapsed), isOvertime: false };
}
