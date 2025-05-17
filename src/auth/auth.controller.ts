import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.servise';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { RegisterDto, LoginDto } from './dtos/auth.dto'; 
import { User } from './dtos/user.schema';

@ApiTags('Authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user/:organizationID')
  @ApiOperation({ summary: 'Get user by organization ID' })
  @ApiParam({ name: 'organizationID', required: true })
  @ApiResponse({ status: 200, type: User })
  async getUserByOrganizationID(@Param('organizationID') organizationID: string) {
    const user = await this.authService.getUserByOrganizationID(organizationID);
    if (!user) throw new BadRequestException('User not found');
    return { message: 'User retrieved successfully', user };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users (without passwords)' })
  @ApiResponse({ status: 200, type: [User] })
  async getAllUsers() {
    const users = await this.authService.getAllUsers();
    return { message: 'Users retrieved successfully', users };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and auto-create organization' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: User })
  async register(@Body() body: RegisterDto) {
    const user = await this.authService.register(
      body.email,
      body.firstName,
      body.lastName,
      body.password,
      body.phoneNumber,
    );
    return { message: 'User registered successfully', user};
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Login successful',
        user: {
          email: 'user@example.com',
          phoneNumber: '+77001234567',
          organizationID: 'org-k1p9sd9u3',
          role: 'user',
        },
      },
    },
  })
  async login(@Body() body: LoginDto) {
    const user = await this.authService.login(body.email, body.password);
    return { message: 'Login successful', user };
  }
}

