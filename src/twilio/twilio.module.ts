import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwilioService } from './twilio.service';
import { TwilioHttpProvider } from './providers/twilio-http.provider';

@Module({
  imports: [HttpModule],
  providers: [TwilioService, TwilioHttpProvider],
  exports: [TwilioService],
})
export class TwilioModule {}
