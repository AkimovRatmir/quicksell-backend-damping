import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.servise'; 
import { AuthController } from './auth.controller';
import { User, UserSchema } from './user.schema';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OrganizationModule, // Add this line
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

