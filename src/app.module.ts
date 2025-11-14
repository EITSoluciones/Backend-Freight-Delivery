import {
  Module
} from '@nestjs/common';
import {
  AppController
} from './app.controller';
import {
  AppService
} from './app.service';
import {
  ConfigModule
} from '@nestjs/config';
import {
  TypeOrmModule
} from '@nestjs/typeorm';
import {
  ProductsModule
} from './products/products.module';
import {
  AuthModule
} from './auth/auth.module';
import {
  PlatformsModule
} from './platforms/platforms.module';
import {
  RolesModule
} from './roles/roles.module';
import {
  UsersModule
} from './users/users.module';
import {
  ClientsModule
} from './clients/clients.module';
import {
  AddressesModule
} from './addresses/addresses.module';
import { ModuleCategoriesModule } from './module-categories/module-categories.module';
import { ModulesModule } from './modules/modules.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //Hace que esté disponible en toda la app
    }),

    //Conexión Base de Datos
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: process.env.DB_AUTOLOAD === 'true', //Carga en automático Entidades.
      synchronize: process.env.DB_SYNCHRONIZE === 'true', //Sincroniza automáticamente el esquema de la base de datos cada vez que se levanta el servidor. NO RECOMENDADO EN PRODUCCIÓN
      logging: process.env.DB_LOGGING === 'true', //Muestra en consola las consultas que ejecuta TypeORM. NO RECOMENDADO EN PRODUCCIÓN
    }),

    ProductsModule, AuthModule, PlatformsModule, RolesModule, UsersModule, ClientsModule, AddressesModule, ModuleCategoriesModule, ModulesModule
  ],
  controllers: [AppController],
  providers: [AppService],

})

export class AppModule {}