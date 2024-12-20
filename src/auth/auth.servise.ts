import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import { OrganizationService } from '../organization/organization.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly organizationService: OrganizationService, // Inject organization service
  ) {}

  async register(
    email: string,
    password: string,
    phoneNumber: string,
    role: string = 'user',
  ): Promise<User> {
    const existingUser = await this.userModel.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      throw new BadRequestException('Email or phone number is already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      organizationID: `org-${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
    });

    const savedUser = await user.save();

    // Automatically create organization
    try {
      await this.organizationService.createOrganization(
        savedUser.organizationID,
        email,
        phoneNumber,
      );
    } catch (error) {
      throw new BadRequestException('Failed to create organization');
    }

    return savedUser;
  }

  async login(email: string, password: string): Promise<Partial<User> | null> {
    const sanitizedEmail = email.trim().toLowerCase(); // Normalize email
    const user = await this.userModel.findOne({ email: sanitizedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    // Return user data without the password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }
}
