import { Controller, Get, Post, Put, Delete, Body, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { DashboardConfigDto } from '../dto/dashboard-config.dto';
import { ProductivityException } from '../exceptions/productivity.exception';

@Controller('productivity/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Retrieve dashboard configuration and data
   */
  @Get()
  async getDashboard(@Query('userId', ParseUUIDPipe) userId: string) {
    try {
      if (!userId) {
        throw new ProductivityException('userId is required');
      }

      return await this.dashboardService.getUserDashboard(userId);
    } catch (error) {
      throw new ProductivityException(`Failed to retrieve dashboard: ${error.message}`);
    }
  }

  /**
   * Add a new widget to the dashboard
   */
  @Post('widgets')
  async addWidget(@Body() widgetConfig: DashboardConfigDto) {
    try {
      if (!widgetConfig.userId) {
        throw new ProductivityException('userId is required');
      }

      return await this.dashboardService.addWidget(widgetConfig.userId, widgetConfig);
    } catch (error) {
      throw new ProductivityException(`Failed to add widget: ${error.message}`);
    }
  }

  /**
   * Update widget configuration
   */
  @Put('widgets/:id')
  async updateWidget(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
    @Body() config: Partial<DashboardConfigDto>,
  ) {
    try {
      if (!userId) {
        throw new ProductivityException('userId is required');
      }

      return await this.dashboardService.updateWidget(id, userId, config);
    } catch (error) {
      throw new ProductivityException(`Failed to update widget: ${error.message}`);
    }
  }

  /**
   * Remove a widget from the dashboard
   */
  @Delete('widgets/:id')
  async removeWidget(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('userId', ParseUUIDPipe) userId: string,
  ) {
    try {
      if (!userId) {
        throw new ProductivityException('userId is required');
      }

      await this.dashboardService.removeWidget(id, userId);
      return { message: 'Widget removed successfully' };
    } catch (error) {
      throw new ProductivityException(`Failed to remove widget: ${error.message}`);
    }
  }
}