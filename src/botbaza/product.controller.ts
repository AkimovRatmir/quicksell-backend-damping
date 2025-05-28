// botbaza/product.controller.ts

import { Controller, Get, Patch, Param, Body, Delete, Post, Req, UseGuards, Res, Query } from "@nestjs/common";
import { BotBazaService } from "./product.servise";
import { Product } from "./dtos/product.entity";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from "@nestjs/swagger";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { AuthGuard } from "@nestjs/passport";
import axios, { AxiosResponse } from 'axios';  
import { Response } from "express";
import { Stream } from 'stream';



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


  @Delete('delall')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'delete all products test only' })
  deleteAll(@Req() req) {
    const { organizationID } = req.user;
    return this.botbazaServise.deleteAll(organizationID);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete product by ID' })
  @ApiParam({ name: 'id', type: String })
  deleteProduct(@Param('id') id: string, @Req() req) {
    const { organizationID } = req.user;
    return this.botbazaServise.deleteOneProduct(id, organizationID);
  }

  @Get('/proxy/image')
  async proxyImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const response: AxiosResponse<Stream> = await axios.get(url, {
        responseType: 'stream',
      });

      res.setHeader('Content-Type', response.headers['content-type']);
      response.data.pipe(res);
    } catch (error) {
      console.error('Image proxy failed:', error.message);
      res.status(500).send('Failed to proxy image');
    }
  }

}
