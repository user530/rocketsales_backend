import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly appService: AppService) { }

  @Get()
  async getHello(): Promise<string> {
    console.log(
      this.configService
    )
    const url = `${this.configService.get<string>('AMOCRM_API_URL')}/api/v4/leads`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('AMOCRM_API_TOKEN')}`
        }
      });
      console.log(response.data)
    } catch (error) {
      console.error('ERrror', error);
    }

    return this.appService.getHello();
  }
}
