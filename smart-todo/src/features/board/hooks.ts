import { useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, saveBoardConfig, updateTask, bulkUpdateTaskStatus, bulkDeleteTasksByStatus } from '@/lib/db';
import { DEFAULT_BOARD_CONFIG } from '@/types';
import type { Task, BoardConfig, BoardColumn } from '@/types';

// 读取看板配置（响应式，配置变了自动更新）
export function useBoardConfig() {
  // useLiveQuery 只做读操作（摄像头只负责看）
  const config = useLiveQuery(() => db.boardConfig.toCollection().first());

  // 挂载时检查一次：表里没数据就写入默认配置（搬东西的活在这里干）
  useEffect(() => {
    db.boardConfig.count().then(count => {
      if (count === 0) {
        db.boardConfig.add(DEFAULT_BOARD_CONFIG);
      }
    });
  }, []);

  return config ?? null;
}

// 读取所有任务，按 sortOrder 排序（看板视图用）
export function useBoardTasks() {
  // 不用 orderBy('sortOrder')，因为它会跳过 sortOrder 为 undefined 的记录
  const tasks = useLiveQuery(() =>
    db.tasks.toArray().then(list =>
      list.sort((a, b) => (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity))
    )
  );
  return tasks ?? [];
}

// 移动任务到另一列（拖拽完成时调用）
export function useMoveTask() {
  return useCallback(async (taskId: number, newStatus: string, newSortOrder: number) => {
    await updateTask(taskId, { status: newStatus, sortOrder: newSortOrder });
  }, []);
}

// 保存看板配置
export function useUpdateBoardConfig() {
  return useCallback(async (config: BoardConfig) => {
    await saveBoardConfig(config);
  }, []);
}

// 删除列：dropped 列直接删任务，其他列任务归为 dropped
export function useDeleteColumn() {
  return useCallback(async (config: BoardConfig, columnId: string) => {
    if (columnId === 'dropped') {
      await bulkDeleteTasksByStatus('dropped');
    } else {
      await bulkUpdateTaskStatus(columnId, 'dropped');
    }
    const newColumns = config.columns
      .filter(col => col.id !== columnId)
      .map((col, i) => ({ ...col, order: i }));
    await saveBoardConfig({ ...config, columns: newColumns });
  }, []);
}

// 检查某列是否超过 WIP 限制
export function checkWipLimit(column: BoardColumn, taskCount: number): boolean {
  if (column.wipLimit == null) return false;
  return taskCount >= column.wipLimit;
}
