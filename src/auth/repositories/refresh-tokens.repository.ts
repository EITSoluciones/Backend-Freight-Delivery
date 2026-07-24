import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, LessThan, Repository } from 'typeorm';
import { RefreshToken } from '../entities/refresh-token.entity';

@Injectable()
export class RefreshTokensRepository {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly repository: Repository<RefreshToken>,
  ) {}

  create(refreshToken: DeepPartial<RefreshToken>): RefreshToken {
    return this.repository.create(refreshToken);
  }

  save(refreshToken: RefreshToken): Promise<RefreshToken> {
    return this.repository.save(refreshToken);
  }

  findByJtiAndUserUuid(
    jti: string,
    uuid_user: string,
  ): Promise<RefreshToken | null> {
    return this.repository.findOne({ where: { jti, uuid_user } });
  }

  deleteById(id: number) {
    return this.repository.delete(id);
  }

  deleteExpired(now: Date) {
    return this.repository.delete({ expires_on_utc: LessThan(now) });
  }
}
