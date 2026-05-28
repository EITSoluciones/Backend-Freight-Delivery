import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { log } from 'node:console';

@Injectable()
export class SmsHttpProvider {
    constructor(private readonly http: HttpService) { }

    async send(phone: string, message: string): Promise<any> {

        try {

            const response = await this.http.axiosRef.post(
                `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
                new URLSearchParams({
                    To: phone,
                    Body: message,
                    MessagingServiceSid: process.env.TWILIO_SERVICE_SID || '',
                }),
                {
                    auth: {
                        username: process.env.TWILIO_ACCOUNT_SID || '',
                        password: process.env.TWILIO_AUTH_PASS || '',
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
            return response;

        } catch (error) {
            console.error('Error enviando SMS', error?.message ?? 'Error desconocido');
            throw error;
        }
    }
}