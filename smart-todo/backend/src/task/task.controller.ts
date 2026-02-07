import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ParseTaskDto } from './dto/parse-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string; email: string }, @Query() query: TaskQueryDto) {
    return this.taskService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.create(dto, user.id);
  }

  @Post('parse')
  parse(@Body() dto: ParseTaskDto) {
    return this.taskService.parseRawInput(dto.rawInput);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.complete(id, user.id);
  }

  @Post(':id/reopen')
  reopen(@Param('id') id: string, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.reopen(id, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: { id: string; email: string }) {
    return this.taskService.remove(id, user.id);
  }
}
