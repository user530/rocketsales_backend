import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get('leads')
  async getLeads(): Promise<any> {
    return this.appService.getJoinedLeads();
  }
}
