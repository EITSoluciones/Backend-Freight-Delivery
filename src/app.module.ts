import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AuthModule } from './auth/auth.module';
import { PlatformsModule } from './platforms/platforms.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, //Hace que esté disponible en toda la app
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

    //Conexión Base de Datos
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: process.env.DB_AUTOLOAD === 'true', //Carga en automático Entidades.
      synchronize: process.env.DB_SYNCHRONIZE === 'true',   //Sincroniza automáticamente el esquema de la base de datos cada vez que se levanta el servidor. NO RECOMENDADO EN PRODUCCIÓN 
      logging: process.env.DB_LOGGING === 'true',           //Muestra en consola las consultas que ejecuta TypeORM. NO RECOMENDADO EN PRODUCCIÓN 
    }),

    ProductsModule, AuthModule, PlatformsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
