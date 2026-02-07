import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { ParseTaskDto } from './dto/parse-task.dto';
import { ChatTaskDto } from './dto/chat-task.dto';
import { AiService } from '../ai/ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.create(createTaskDto, user.userId);
  }

  @Post('parse')
  async parse(
    @Body() parseTaskDto: ParseTaskDto,
    @GetUser() user: { userId: string },
  ) {
    const parsed = await this.aiService.parseTask(parseTaskDto.rawInput);

    if (parseTaskDto.autoCreate && parsed.confidence >= 0.7) {
      const task = await this.taskService.createFromParsed({
        title: parsed.title,
        description: parsed.description,
        rawInput: parseTaskDto.rawInput,
        category: parsed.category,
        tags: parsed.tags,
        priority: parsed.priority,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        estimatedMinutes: parsed.estimatedMinutes,
        aiConfidence: parsed.confidence,
        aiMetadata: { uncertainFields: parsed.uncertainFields },
      }, user.userId);
      return { parsed, task };
    }

    return { parsed };
  }

  @Post('chat')
  async chat(@Body() chatTaskDto: ChatTaskDto) {
    return this.aiService.chatTask(
      chatTaskDto.messages,
      chatTaskDto.currentDraft,
    );
  }

  @Get()
  findAll(
    @Query() query: QueryTaskDto,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.findAll(query, user.userId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.findOne(id, user.userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.update(id, updateTaskDto, user.userId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.remove(id, user.userId);
  }

  @Post(':id/complete')
  complete(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.complete(id, user.userId);
  }

  @Post(':id/reopen')
  reopen(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser() user: { userId: string },
  ) {
    return this.taskService.reopen(id, user.userId);
  }
}
