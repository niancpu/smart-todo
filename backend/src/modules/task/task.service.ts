import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Task, TaskStatus } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      userId,
    });
    return this.taskRepository.save(task);
  }

  async findAll(query: QueryTaskDto, userId: string): Promise<{ tasks: Task[]; total: number }> {
    const { status, priority, category, dueDateFrom, dueDateTo } = query;
    const page = query.page || 1;
    const limit = query.limit || 20;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .where('task.deletedAt IS NULL')
      .andWhere('task.userId = :userId', { userId });

    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (priority) {
      qb.andWhere('task.priority = :priority', { priority });
    }

    if (category) {
      qb.andWhere('task.category = :category', { category });
    }

    if (dueDateFrom) {
      qb.andWhere('task.dueDate >= :dueDateFrom', { dueDateFrom: new Date(dueDateFrom) });
    }

    if (dueDateTo) {
      qb.andWhere('task.dueDate <= :dueDateTo', { dueDateTo: new Date(dueDateTo) });
    }

    qb.orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [tasks, total] = await qb.getManyAndCount();
    return { tasks, total };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, userId, deletedAt: IsNull() },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);

    const { dueDate, ...rest } = updateTaskDto as any;
    const updateData: Partial<Task> = { ...rest };
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }

    Object.assign(task, updateData);
    task.version += 1;
    return this.taskRepository.save(task);
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    task.deletedAt = new Date();
    task.version += 1;
    await this.taskRepository.save(task);
  }

  async complete(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.status = TaskStatus.COMPLETED;
    task.completedAt = new Date();
    task.version += 1;
    return this.taskRepository.save(task);
  }

  async reopen(id: string, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    task.status = TaskStatus.PENDING;
    task.completedAt = null;
    task.version += 1;
    return this.taskRepository.save(task);
  }

  async createFromParsed(parsedData: Partial<Task>, userId: string): Promise<Task> {
    const task = this.taskRepository.create({ ...parsedData, userId });
    return this.taskRepository.save(task);
  }
}
