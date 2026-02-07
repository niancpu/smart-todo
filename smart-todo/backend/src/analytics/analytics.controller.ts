import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getOverview(@CurrentUser() user: { id: string; email: string }) {
    return this.analyticsService.getOverview(user.id);
  }

  @Get('trends')
  getTrends(@CurrentUser() user: { id: string; email: string }) {
    return this.analyticsService.getTrends(user.id);
  }

  @Get('categories')
  getCategories(@CurrentUser() user: { id: string; email: string }) {
    return this.analyticsService.getCategories(user.id);
  }
}
