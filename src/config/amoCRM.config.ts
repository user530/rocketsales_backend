import { ConfigFactory } from '@nestjs/config';

export const amoConfig: ConfigFactory = () => ({
    amoCRM: {
        apiURL: process.env.AMOCRM_API_URL,
        clientId: process.env.AMOCRM_CLIENT_ID,
        clientSecret: process.env.AMOCRM_CLIENT_SECRET,
        redirectUri: process.env.AMOCRM_REDIRECT_URI,
    }
});