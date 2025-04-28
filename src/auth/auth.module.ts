import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.servise'; 
import { AuthController } from './auth.controller';
import { User, UserSchema } from './user.schema';
import { OrganizationModule } from '../organization/organization.module'; // Import OrganizationModule
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    OrganizationModule,
    JwtModule.register({
      secret: 'super_secret_key',
      signOptions: { expiresIn: '7d' },
    }) // Add this line
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

