import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    console.log(
      this.configService
    )
    // this.configService.get('AMOCRM_API_URL'),
    // this.configService.get('AMOCRM_CLIENT_ID'),
    // this.configService.get('AMOCRM_CLIENT_SECRET'),
    // this.configService.get('AMOCRM_REDIRECT_URI'),
    return this.appService.getHello();
  }
}
