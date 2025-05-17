// botbaza/product.controller.ts

import { Controller, Get, Patch, Param, Body, Delete, Post, Req, UseGuards } from "@nestjs/common";
import { BotBazaService } from "./product.servise";
import { Product } from "./dtos/product.entity";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { AuthGuard } from "@nestjs/passport";

@ApiTags('Products')
@ApiBearerAuth('access-token')
@Controller('products')
export class BotBazaController {
  constructor(private readonly botbazaServise: BotBazaService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get all products for the authenticated organization' })
  @ApiResponse({ status: 200, type: [Product] })
  getAllProducts(@Req() req): Promise<Product[]> {
    const { organizationID } = req.user;
    return this.botbazaServise.findAll(organizationID);
  }

  @Post('create')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: Product })
  createProduct(@Body() productData: any, @Req() req) {
    const { organizationID } = req.user;
    return this.botbazaServise.createProduct(organizationID, productData);
  }

  @Patch('update-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update settings for all products in the organization' })
  @ApiBody({ type: UpdateProductDto })
  updateAllProducts(
    @Body() updateProductDto: UpdateProductDto,
    @Req() req
  ) {
    const { organizationID } = req.user;
    return this.botbazaServise.updateAllProductsSettings(organizationID, updateProductDto);
  }


  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Update product by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateProductDto })
  updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
  ) {
    const { organizationID } = req.user;
    return this.botbazaServise.updateProduct(id, organizationID, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: String })
  deleteProduct(@Param('id') id: string, @Req() req) {
    const { organizationID } = req.user;
    return this.botbazaServise.deleteOneProduct(id, organizationID);
  }
}
