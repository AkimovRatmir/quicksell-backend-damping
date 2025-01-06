// src/auth/auth.controller.ts

import { Controller, Post, Body, BadRequestException, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.servise'; 

@Controller('')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('user/:organizationID') // Define route with a dynamic parameter
  async getUserByOrganizationID(@Param('organizationID') organizationID: string) {
    try {
      const user = await this.authService.getUserByOrganizationID(organizationID); // Call the service method
      if (!user) {
        throw new BadRequestException('User not found');
      }
      return { message: 'User retrieved successfully', user };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('users') // Add a new route
  async getAllUsers() {
    try {
      const users = await this.authService.getAllUsers(); // Call the service method
      return { message: 'Users retrieved successfully', users };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('register')
async register(
  @Body('email') email: string, // Email should be extracted from request body
  @Body('password') password: string,
  @Body('phoneNumber') phoneNumber: string,
  @Body('role') role?: string,
) {
  try {
    const user = await this.authService.register(email, password, phoneNumber, role);
    return { message: 'User registered successfully', user };
  } catch (error) {
    throw new BadRequestException(error.message);
  }
}


  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
  ) {
    const user = await this.authService.login(username, password);
    if (user) {
      return { message: 'Login successful', user };
    } else {
      throw new BadRequestException('Invalid credentials');
    }
  }
}

