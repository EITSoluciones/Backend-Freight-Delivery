import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SmsService } from './sms.service';
import { SmsHttpProvider } from './providers/sms-http.provider';

@Module({
  imports: [HttpModule],
  providers: [SmsService, SmsHttpProvider],
  exports: [SmsService],
})
export class SmsModule {}
