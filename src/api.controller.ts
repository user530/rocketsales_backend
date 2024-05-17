import { Controller, Get, Query } from '@nestjs/common';
import { ApiService } from './services';
import { JoinedLeads } from './types';

interface IApiController {
  getLeads(query?: string): Promise<JoinedLeads[]>
}

@Controller('api')
export class ApiController implements IApiController {
  constructor(
    private readonly appService: ApiService
  ) { }

  @Get('leads')
  async getLeads(@Query('query') query?: string): Promise<JoinedLeads[]> {
    return this.appService.getJoinedLeads(query);
  }
}
