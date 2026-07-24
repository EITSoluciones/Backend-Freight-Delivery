import { Test, TestingModule } from '@nestjs/testing';
import { TwilioService } from './twilio.service';
import { TwilioHttpProvider } from './providers/twilio-http.provider';

describe('TwilioService', () => {
  let service: TwilioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TwilioService,
        {
          provide: TwilioHttpProvider,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TwilioService>(TwilioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
