import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator'

export class AmoConfig {
    @Expose()
    @IsNotEmpty()
    @IsString()
    AMOCRM_API_URL: string;

    @Expose()
    @IsNotEmpty()
    @IsString()
    AMOCRM_API_TOKEN: string;
}