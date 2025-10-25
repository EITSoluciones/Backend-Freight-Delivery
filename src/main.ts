import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //app.setGlobalPrefix('api'); //Prefijo para las rutas de la aplicación

  // Habilita CORS para cualquier origen
  if (process.env.CORS_ENABLED) {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      credentials: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Authorization',
    });
  }


  // Manejo de Versionamiento
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: process.env.API_VERSION,
    prefix: process.env.API_PREFIX,
  });

  // Use Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              //Solo deja la data del DTO, remueve objetos basura
      forbidNonWhitelisted: true,   //Indica las propiedades que no debe mandar, que no estan el DTO, devuelve un 400
    })
  )

  await app.listen(process.env.APP_PORT ?? 3000);

  const logger = new Logger('Bootstrap');

  logger.log(`🚀 ${process.env.APP_NAME} running in ${process.env.NODE_ENV} mode`);
  logger.log(`📡 Server: ${process.env.APP_URL}`);
  logger.log(`🔗 API: ${process.env.APP_URL}/${process.env.API_PREFIX}${process.env.API_VERSION}`);
  logger.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN}`);

}
bootstrap();
