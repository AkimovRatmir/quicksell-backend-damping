import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './dtos/user.schema';
import * as bcrypt from 'bcrypt';
import { OrganizationService } from '../organization/organization.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AutoOrg } from './dtos/autocreateorg.shema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly organizationService: OrganizationService,
    private readonly jwtServise: JwtService,
    private readonly configService: ConfigService, 
  ) {}

  async getUserByOrganizationID(organizationID: string): Promise<User | null> {
    return await this.userModel
      .findOne({ organizationID })
      .select('-password'); // Exclude the password field
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userModel.find().select('-password'); // Exclude the password field
  }

  async register(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    phoneNumber: string,
    autoOrg: AutoOrg
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      throw new BadRequestException('Email or phone number is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      phoneNumber,
      role: "worker",
      organizationID: `org-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    });

    const savedUser = await user.save();

    // Automatically create organization
    try {
      await this.organizationService.createOrganization(
        savedUser.organizationID,
        email,
        phoneNumber,
        autoOrg.KaspiToken ?? '',
        autoOrg.isPaid ?? 'false',
        autoOrg.capacity ?? 0,
        autoOrg.minPriceGlob ?? 0,
        autoOrg.stepGlob ?? 0,
        autoOrg.maxPriceGlob ?? 0,
        autoOrg.isOn ?? 'off',
        autoOrg.kaspiLoginEmail ?? '',
        autoOrg.kaspiPasswordEncrypted ?? '',
      );
    } catch (error) {
      throw new BadRequestException('Failed to create organization', error.message);
    }

    return savedUser;
  }

  async login(email: string, password: string): Promise<any> {
    const sanitizedEmail = email.trim().toLowerCase(); // Normalize email
    const user = await this.userModel.findOne({ email: sanitizedEmail });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      email: user.email,
      organizationID: user.organizationID,
    };
    
    return {
      access_token: this.jwtServise.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
    };
  }
}
