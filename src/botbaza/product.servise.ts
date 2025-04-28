import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./product.entity";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { response } from "express";

@Injectable()
export class BotBazaServise {
    constructor(
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,

    ) {}

    async findAll(): Promise<Product []> {
            return this.productRepo.find();
        }

    async updateProduct(id: number, updateData: UpdateProductDto): Promise<any> {
        await this.productRepo.update({ id }, updateData);
        return this.productRepo.findOneBy({ id });
      }

    async deleteOneProduct(id: number):Promise<any> {
        const delProduct = this.productRepo.findOneBy({id});
        await this.productRepo.delete({id});
        return 'deleted the product with id' + id + 'with the info' + delProduct;
    }


}