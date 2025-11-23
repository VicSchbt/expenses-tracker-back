import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns hello message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test/users')
  @ApiOperation({ summary: 'Test database connection' })
  @ApiResponse({ status: 200, description: 'Database connection test result' })
  async testUsers() {
    try {
      const users = await this.prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
        },
      });
      return {
        success: true,
        message: 'Successfully connected to Supabase User table',
        count: users.length,
        users,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase User table',
        error: error.message,
      };
    }
  }
}
