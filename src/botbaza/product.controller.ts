import { Controller, Get, Patch, Param, Body } from "@nestjs/common";
import { BotBazaServise } from "./product.servise";
import { Product } from "./product.entity";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from "@nestjs/swagger";
import { UpdateProductDto } from "./dtos/update-product.dto";

@ApiTags('Products')
@Controller('products')
export class BotBazaController {
    constructor( private readonly botbazaServise: BotBazaServise ) {}


    @Get()
    @ApiOperation({ summary: 'Get all products from the bot Baza' })
    @ApiResponse({ status: 200, description: 'It will return this list of products', type: [Product] })
    getAllProducts(): Promise <Product[]> {
        return this.botbazaServise.findAll();
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update specific fields in the bot baza by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateProductDto })
    updateProduct(
        @Param('id') id: number,
        @Body() updateProductDto: UpdateProductDto,
    ){
        return this.botbazaServise.updateProduct(id, updateProductDto);
    }
}