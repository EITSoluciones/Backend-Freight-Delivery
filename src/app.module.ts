import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 🔹 hace que esté disponible en toda la app
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   database: 'freight-delivery',
    //   username: 'postgres',
    //   password: 's3cr3t777',
    //   autoLoadEntities: true,
    //   synchronize: true,
    //   logging: true,
    // }),
        TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'freight_delivery',
      username: 'root',
      password: '123456',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    ProductsModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
