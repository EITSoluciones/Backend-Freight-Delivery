import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); //Prefijo para las rutas de la aplicación

  //Use Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //Solo deja la data del DTO, remueve objetos basura
      forbidNonWhitelisted: true, //Indica las propiedades que no debe mandar, que no estan el DTO, devuelve un 400
    })
  )

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
