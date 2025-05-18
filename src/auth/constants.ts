import { ConfigService } from '@nestjs/config';

// Função para inicializar as constantes com ConfigService
export const getJwtConstants = (configService: ConfigService) => {
  return {
    secret: configService.get<string>('JWT_SECRET', 'YOUR_SECRET_KEY'),
    expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
  };
};

// Fallback para uso direto (não recomendado em produção)
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'YOUR_SECRET_KEY',
  expiresIn: process.env.JWT_EXPIRATION || '1d',
};