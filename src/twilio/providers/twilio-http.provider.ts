import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class TwilioHttpProvider {
  constructor(private readonly http: HttpService) {}

  async send(phone: string, message: string,messagingServiceSid: string): Promise<unknown> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken || !messagingServiceSid) {
      throw new InternalServerErrorException(
        'La configuración de Twilio está incompleta',
      );
    }

    try {
      const response = await this.http.axiosRef.post<unknown>(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        new URLSearchParams({
          To: phone,
          Body: message,
          MessagingServiceSid: messagingServiceSid,
        }),
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error(
        'Error enviando SMS' +
          (error instanceof Error ? error.message : 'Error desconocido'),
      );
      throw error;
    }
  }
}
