import { ConfigFactory } from '@nestjs/config';

export const amoConfig: ConfigFactory = () => ({
    amoCRM: {
        apiURL: process.env.AMOCRM_API_URL,
        apiToken: process.env.AMOCRM_API_TOKEN,
    }
});