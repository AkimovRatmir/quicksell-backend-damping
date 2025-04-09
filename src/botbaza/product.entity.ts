import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column('text')
  @ApiProperty()
  product_name: string;

  @Column('text')
  @ApiProperty()
  url: string;

  @Column('numeric', { nullable: true })
  @ApiProperty({ required: false, type: 'number' })
  current_price: number;

  @Column('numeric', { nullable: true })
  @ApiProperty({ required: false, type: 'number' })
  price_on_page: number;

  @Column('text')
  @ApiProperty()
  sku: string;

  @Column('text')
  @ApiProperty()
  image_url: string;

  @Column('text', { nullable: true })
  @ApiProperty()
  decrease: string;

  @Column('text', { nullable: true })
  @ApiProperty()
  increase: string;

  @Column('numeric', { nullable: true })
  @ApiProperty({ required: false, type: 'number' })
  max_price: number;

  @Column('numeric', { nullable: true })
  @ApiProperty({ required: false, type: 'number' })
  min_price: number;

  @Column('numeric', { nullable: true })
  @ApiProperty({ required: false, type: 'number' })
  step: number;
}
