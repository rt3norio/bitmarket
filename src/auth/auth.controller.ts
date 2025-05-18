import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';

// Define tipos específicos para documentação do Swagger
class LoginRequestDto {
  username: string;
  password: string;
}

class LoginResponseDto {
  access_token: string;
}

class RegisterRequestDto {
  username: string;
  password: string;
  email?: string;
}

class RegisterResponseDto {
  id: string;
  username: string;
  email?: string;
  role: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Authenticate user and get JWT token' })
  @ApiBody({
    type: LoginRequestDto,
    description: 'User credentials',
    examples: {
      example: {
        value: {
          username: 'johndoe',
          password: 'yourpassword'
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Successful authentication',
    type: LoginResponseDto,
    schema: {
      properties: {
        access_token: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: RegisterRequestDto,
    description: 'User registration data',
    examples: {
      example: {
        value: {
          username: 'johndoe',
          password: 'yourpassword',
          email: 'john@example.com'
        }
      }
    }
  })
  @ApiCreatedResponse({ 
    description: 'User successfully created',
    type: RegisterResponseDto,
    schema: {
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000'
        },
        username: {
          type: 'string',
          example: 'johndoe'
        },
        email: {
          type: 'string',
          example: 'john@example.com'
        },
        role: {
          type: 'string',
          example: 'user'
        }
      }
    }
  })
  @ApiConflictResponse({ description: 'Username or email already exists' })
  @Post('register')
  async register(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('email') email?: string,
  ) {
    return this.authService.register(username, password, email);
  }
}