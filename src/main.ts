import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aplicar validação global dos DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('BitMarket API')
    .setDescription('API de marketplace com pagamentos via Bitcoin Lightning Network')
    .setVersion('1.0')
    .addTag('auth', 'Autenticação e registro de usuários')
    .addTag('products', 'Gerenciamento de produtos do marketplace')
    .addTag('orders', 'Gerenciamento de pedidos e compras')
    .addBearerAuth(
      { 
        type: 'http', 
        scheme: 'bearer', 
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation is available at: ${await app.getUrl()}/api`);
}

bootstrap();
