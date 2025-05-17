import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Organization, OrganizationSchema } from './dtos/organization.schema';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Product, ProductSchema } from 'src/botbaza/dtos/product.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Organization.name, schema: OrganizationSchema }]),
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }, 
    ]),
  ],
  providers: [OrganizationService],
  controllers: [OrganizationController],
  exports: [OrganizationService, MongooseModule], // Export service to use in other modules
})
export class OrganizationModule {}
