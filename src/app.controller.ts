import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get('leads')
  async getLeads(@Query() query: Record<string, string>): Promise<any> {
    return this.appService.fetchLeads(query);
  }
}
