import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { PlatformsModule } from './platforms/platforms.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { AddressesModule } from './addresses/addresses.module';
import { ModuleCategoriesModule } from './module-categories/module-categories.module';
import { ModulesModule } from './modules/modules.module';
import { CommonModule } from './common/common.module';
import { DeliveryDriversModule } from './delivery-drivers/delivery-drivers.module';
import { LogsModule } from './logs/logs.module';
import { DocumentsModule } from './documents/documents.module';
import { CompanyModule } from './company/company.module';
import { AppConfigModule } from './app-config/app-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: process.env.DB_AUTOLOAD === 'true',
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),

    CommonModule,
    ProductsModule,
    AuthModule,
    PlatformsModule,
    RolesModule,
    UsersModule,
    CustomersModule,
    AddressesModule,
    ModuleCategoriesModule,
    ModulesModule,
    DeliveryDriversModule,
    LogsModule,
    DocumentsModule,
    CompanyModule,
    AppConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
