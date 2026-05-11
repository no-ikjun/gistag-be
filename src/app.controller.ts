import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '헬스 체크(문자열)' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health/db')
  @ApiOperation({ summary: 'DB 연결 상태' })
  getDatabaseHealth() {
    return this.appService.checkDatabase();
  }
}
