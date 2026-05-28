import { Injectable } from '@nestjs/common';
import { SmsHttpProvider } from './providers/sms-http.provider';

@Injectable()
export class SmsService {
    constructor(private readonly smsProvider: SmsHttpProvider) { }

    async sendTestMessage(phone: string, message: string) {
        await this.smsProvider.send(phone, message);
    }

    async sendAppInstallationCode(phone: string) {
        const message = 'Te invitamos a instalar la app Freight Delivery: https://freight-delivery.eitsoluciones.com.mx . Código de activación: 1234';
        return await this.smsProvider.send(phone, message);
    }


}
