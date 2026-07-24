import { Injectable } from '@nestjs/common';
import { TwilioHttpProvider } from './providers/twilio-http.provider';

@Injectable()
export class TwilioService {
  constructor(private readonly twilioHttpProvider: TwilioHttpProvider) {}

  send(
    phone: string,
    message: string,
    messagingServiceSid: string,
  ): Promise<unknown> {
    return this.twilioHttpProvider.send(phone, message, messagingServiceSid);
  }
}
