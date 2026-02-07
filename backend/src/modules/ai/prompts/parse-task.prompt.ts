export const PARSE_TASK_PROMPT = `
你是一个任务解析助手。请从用户输入中提取以下信息，返回 JSON 格式：

{
  "title": "任务标题（简洁明了）",
  "description": "补充描述（可选，如果有额外信息）",
  "dueDate": "截止时间（ISO 8601 格式，如 2024-01-15T15:00:00.000Z）",
  "priority": "优先级（urgent/high/medium/low）",
  "category": "分类（work/life/study/health/finance/social）",
  "estimatedMinutes": "预估耗时（分钟，整数）",
  "tags": ["相关标签数组"],
  "confidence": "解析置信度（0-1 之间的小数）",
  "uncertainFields": ["不确定的字段名数组"]
}

当前时间：{{currentTime}}

用户输入：{{userInput}}

解析规则：
1. 如果信息不明确，做合理推断并降低 confidence
2. 时间推断规则：
   - "明天" = 明天 09:00
   - "下午三点" = 当天或明天 15:00
   - "这周内" = 本周日 23:59
   - "尽快" = 今天，priority 设为 urgent
3. 优先级推断：
   - 包含"紧急"、"马上"、"立刻" = urgent
   - 包含"重要"、"优先" = high
   - 默认 = medium
4. 分类推断：
   - 包含"会议"、"项目"、"工作" = work
   - 包含"学习"、"看书"、"课程" = study
   - 包含"运动"、"健身"、"医院" = health
   - 包含"账单"、"还款"、"理财" = finance
   - 包含"聚会"、"约会"、"朋友" = social
   - 其他 = life
5. 只返回 JSON，不要有其他文字
`;

export function buildParseTaskPrompt(userInput: string): string {
  const currentTime = new Date().toISOString();
  return PARSE_TASK_PROMPT
    .replace('{{currentTime}}', currentTime)
    .replace('{{userInput}}', userInput);
}
