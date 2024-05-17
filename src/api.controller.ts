import { Controller, Get, Query } from '@nestjs/common';
import { ApiService } from './services';

@Controller('api')
export class ApiController {
  constructor(
    private readonly appService: ApiService
  ) { }

  @Get('leads')
  async getLeads(@Query('query') query: string): Promise<any> {
    return this.appService.getJoinedLeads();
  }
}
