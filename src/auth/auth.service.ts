import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';
import { IAuthRequest, IAuthResponse } from './auth.types';

@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
    ) { }

    async getToken(code: string) {
        const uri = `${this.configService.get<string>('AMOCRM_API_URL')}/oauth2/access_token`;
        console.log(uri);

        const response = await axios.post<
            IAuthResponse,
            AxiosResponse<IAuthResponse>,
            IAuthRequest
        >(
            `${this.configService.get<string>('AMOCRM_API_URL')}/oauth2/access_token`,
            {
                client_id: this.configService.get<string>('AMOCRM_CLIENT_ID'),
                client_secret: this.configService.get<string>('AMOCRM_CLIENT_SECRET'),
                redirect_uri: this.configService.get<string>('AMOCRM_REDIRECT_URI'),
                grant_type: 'authorization_code',
                code,
            }
        );

        console.log(response);

        return response.data;
    }

}
