import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
  ) {}

  async findAll(userId: string, query?: TaskQueryDto): Promise<{ data: Task[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, parseInt(query?.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(query?.limit || '20', 10)));
    const sortBy = query?.sortBy || 'createdAt';
    const order = query?.order || 'DESC';

    const qb = this.taskRepo.createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    if (query?.status) {
      qb.andWhere('task.status = :status', { status: query.status });
    }
    if (query?.category) {
      qb.andWhere('task.category = :category', { category: query.category });
    }
    if (query?.priority) {
      qb.andWhere('task.priority = :priority', { priority: query.priority });
    }
    if (query?.search) {
      qb.andWhere('task.title LIKE :search', { search: `%${query.search}%` });
    }

    qb.orderBy(`task.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepo.findOneBy({ id, userId });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async create(dto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepo.create({
      ...dto,
      userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.taskRepo.save(task);
  }

  async update(id: string, dto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    Object.assign(task, {
      ...dto,
      dueDate: dto.dueDate !== undefined ? (dto.dueDate ? new Date(dto.dueDate) : null) : task.dueDate,
      completedAt: dto.completedAt !== undefined ? (dto.completedAt ? new Date(dto.completedAt) : null) : task.completedAt,
    });
    if (dto.status === 'done' && !task.completedAt) {
      task.completedAt = new Date();
    }
    if (dto.status && dto.status !== 'done') {
      task.completedAt = null;
    }
    return this.taskRepo.save(task);
  }

  async complete(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.status = 'done';
    task.completedAt = new Date();
    return this.taskRepo.save(task);
  }

  async reopen(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.status = 'todo';
    task.completedAt = null;
    return this.taskRepo.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await this.taskRepo.remove(task);
  }

  parseRawInput(rawInput: string) {
    const { date: dueDate, confident: dateConf } = this.extractDueDate(rawInput);
    const { priority, confident: prioConf } = this.extractPriority(rawInput);
    const { category, confident: catConf } = this.extractCategory(rawInput);
    const tags = this.extractTags(rawInput);

    const estMatch = rawInput.match(/(\d+)\s*[个]?小时/) || rawInput.match(/(\d+)\s*分钟/);
    const estimatedMinutes = estMatch
      ? (rawInput.includes('小时') ? parseInt(estMatch[1]) * 60 : parseInt(estMatch[1]))
      : null;

    const uncertainFields: string[] = [];
    if (!dateConf) uncertainFields.push('dueDate');
    if (!prioConf) uncertainFields.push('priority');
    if (!catConf) uncertainFields.push('category');

    const confidentCount = [dateConf, prioConf, catConf].filter(Boolean).length;
    const confidence = 0.5 + confidentCount * 0.15;

    let title = rawInput
      .replace(/(今天|明天|后天|下?周[一二三四五六日])/g, '')
      .replace(/(上午|下午|早上|晚上)?\d{1,2}[点时]/g, '')
      .replace(/\s+/g, ' ')
      .trim() || rawInput;

    return { title, dueDate, priority, category, estimatedMinutes, tags, confidence, uncertainFields };
  }

  private extractDueDate(input: string) {
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
    const dayAfter = new Date(now); dayAfter.setDate(now.getDate() + 2);

    if (input.includes('今天')) return { date: now.toISOString(), confident: true };
    if (input.includes('明天')) return { date: tomorrow.toISOString(), confident: true };
    if (input.includes('后天')) return { date: dayAfter.toISOString(), confident: true };

    const weekdays = ['周日','周一','周二','周三','周四','周五','周六'];
    for (let i = 0; i < weekdays.length; i++) {
      if (input.includes(weekdays[i])) {
        const target = new Date(now);
        const diff = (i - now.getDay() + 7) % 7 || 7;
        target.setDate(target.getDate() + diff);
        return { date: target.toISOString(), confident: true };
      }
    }

    const timeMatch = input.match(/(上午|下午|早上|晚上)?(\d{1,2})[点时]/);
    if (timeMatch) {
      const base = input.includes('明天') ? tomorrow : input.includes('后天') ? dayAfter : now;
      let hour = parseInt(timeMatch[2]);
      if ((timeMatch[1] === '下午' || timeMatch[1] === '晚上') && hour < 12) hour += 12;
      base.setHours(hour, 0, 0, 0);
      return { date: base.toISOString(), confident: true };
    }
    return { date: null, confident: false };
  }

  private extractPriority(input: string) {
    if (/紧急|立刻|马上/.test(input)) return { priority: 'urgent', confident: true };
    if (/重要|优先/.test(input)) return { priority: 'high', confident: true };
    if (/不急|有空/.test(input)) return { priority: 'low', confident: true };
    return { priority: 'medium', confident: false };
  }

  private extractCategory(input: string) {
    if (/开会|工作|项目|汇报/.test(input)) return { category: 'work', confident: true };
    if (/学习|看书|课程|复习/.test(input)) return { category: 'study', confident: true };
    if (/锻炼|跑步|健身|体检/.test(input)) return { category: 'health', confident: true };
    if (/买|购物|超市/.test(input)) return { category: 'shopping', confident: true };
    if (/约|聚餐|电影/.test(input)) return { category: 'personal', confident: true };
    return { category: 'other', confident: false };
  }

  private extractTags(input: string) {
    const tags: string[] = [];
    if (/会议|开会/.test(input)) tags.push('会议');
    if (/学习|复习/.test(input)) tags.push('学习');
    if (/运动|锻炼|健身/.test(input)) tags.push('运动');
    if (/购物|买/.test(input)) tags.push('购物');
    return tags;
  }
}
