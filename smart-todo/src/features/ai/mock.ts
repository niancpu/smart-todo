import type { ParseResult, Priority, Category } from '@/types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractDueDate(input: string): { date?: Date; confident: boolean } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(now);
  dayAfter.setDate(dayAfter.getDate() + 2);

  if (input.includes('今天')) return { date: now, confident: true };
  if (input.includes('明天')) return { date: tomorrow, confident: true };
  if (input.includes('后天')) return { date: dayAfter, confident: true };

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  for (let i = 0; i < weekdays.length; i++) {
    if (input.includes(weekdays[i])) {
      const target = new Date(now);
      const diff = (i - now.getDay() + 7) % 7 || 7;
      target.setDate(target.getDate() + diff);
      return { date: target, confident: true };
    }
  }

  // 匹配"下午3点"、"上午10点"等
  const timeMatch = input.match(/(上午|下午|早上|晚上)?(\d{1,2})[点时]/);
  if (timeMatch) {
    const date = input.includes('明天') ? tomorrow : input.includes('后天') ? dayAfter : now;
    let hour = parseInt(timeMatch[2]);
    if (timeMatch[1] === '下午' || timeMatch[1] === '晚上') {
      if (hour < 12) hour += 12;
    }
    date.setHours(hour, 0, 0, 0);
    return { date, confident: true };
  }

  return { date: undefined, confident: false };
}

function extractPriority(input: string): { priority: Priority; confident: boolean } {
  if (input.includes('紧急') || input.includes('立刻') || input.includes('马上'))
    return { priority: 'urgent', confident: true };
  if (input.includes('重要') || input.includes('优先'))
    return { priority: 'high', confident: true };
  if (input.includes('不急') || input.includes('有空'))
    return { priority: 'low', confident: true };
  return { priority: 'medium', confident: false };
}

function extractCategory(input: string): { category: Category; confident: boolean } {
  if (input.includes('开会') || input.includes('工作') || input.includes('项目') || input.includes('汇报'))
    return { category: 'work', confident: true };
  if (input.includes('学习') || input.includes('看书') || input.includes('课程') || input.includes('复习'))
    return { category: 'study', confident: true };
  if (input.includes('锻炼') || input.includes('跑步') || input.includes('健身') || input.includes('体检'))
    return { category: 'health', confident: true };
  if (input.includes('买') || input.includes('购物') || input.includes('超市'))
    return { category: 'shopping', confident: true };
  if (input.includes('约') || input.includes('聚餐') || input.includes('电影'))
    return { category: 'personal', confident: true };
  return { category: 'other', confident: false };
}

function extractEstimatedMinutes(input: string): number | undefined {
  const hourMatch = input.match(/(\d+)\s*[个]?小时/);
  const minMatch = input.match(/(\d+)\s*分钟/);
  if (hourMatch) return parseInt(hourMatch[1]) * 60;
  if (minMatch) return parseInt(minMatch[1]);
  return undefined;
}

function extractTags(input: string): string[] {
  const tags: string[] = [];
  const tagPatterns: [RegExp, string][] = [
    [/会议|开会/, '会议'],
    [/学习|复习/, '学习'],
    [/运动|锻炼|健身/, '运动'],
    [/购物|买/, '购物'],
  ];
  for (const [pattern, tag] of tagPatterns) {
    if (pattern.test(input)) tags.push(tag);
  }
  return tags;
}

export async function mockParseTask(rawInput: string): Promise<ParseResult> {
  await delay(800);

  const { date: dueDate, confident: dateConfident } = extractDueDate(rawInput);
  const { priority, confident: priorityConfident } = extractPriority(rawInput);
  const { category, confident: categoryConfident } = extractCategory(rawInput);
  const estimatedMinutes = extractEstimatedMinutes(rawInput);
  const tags = extractTags(rawInput);

  const uncertainFields: string[] = [];
  if (!dateConfident) uncertainFields.push('dueDate');
  if (!priorityConfident) uncertainFields.push('priority');
  if (!categoryConfident) uncertainFields.push('category');

  const confidentCount = [dateConfident, priorityConfident, categoryConfident].filter(Boolean).length;
  const confidence = 0.5 + confidentCount * 0.15;

  // 用原始输入作为标题，去掉时间相关词汇
  let title = rawInput
    .replace(/(今天|明天|后天|下?周[一二三四五六日])/g, '')
    .replace(/(上午|下午|早上|晚上)?\d{1,2}[点时]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!title) title = rawInput;

  return {
    title,
    dueDate,
    priority,
    category,
    estimatedMinutes,
    tags,
    confidence,
    uncertainFields,
  };
}
