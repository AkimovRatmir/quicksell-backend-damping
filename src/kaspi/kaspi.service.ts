import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Page, Browser, chromium, LaunchOptions } from 'playwright';
import * as XLSX from 'xlsx';
import { promises as fs } from 'fs';

@Injectable()
export class KaspiService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser | null = null;

  async onModuleInit() {
    try {
      const launchOptions: LaunchOptions = { headless: false }; // Set to true if you don't need the browser UI
      this.browser = await chromium.launch(launchOptions);
    } catch (error) {
      console.error('Failed to start the browser:', error);
      throw error; // Propagate the error to indicate failure to start
    }
  }

  async login(page: Page, email: string, password: string): Promise<void> {
    try {
      await page.goto('https://kaspi.kz/mc/#/login');
      await page.waitForLoadState('networkidle');
      await page.click('//a[@id="12-label"]/span[text()="Email"]');
      await page.fill('input#user_email_field', email);
      await page.click('button#continue_button');
      await page.fill('input#password_field', password);
      await page.click('button#sign_in_button');
      await page.waitForLoadState('networkidle');
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  async getProductData(page: Page, productUrl: string): Promise<any> {
    try {
      await page.goto(productUrl);
      await page.waitForLoadState('networkidle');

      // Extract data from the page
      const productPriceText = await page.textContent('#ItemView .item__price-once');
      const productPrice = parseFloat(productPriceText?.replace('₸', '').replace(/\s+/g, '') || '0');

      // Extract other data if needed
      return { productPrice };
    } catch (error) {
      console.error('Failed to get product data:', error);
      throw error;
    }
  }

  async readExcel(filePath: string): Promise<any[]> {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
      console.error('Failed to read Excel file:', error);
      throw error;
    }
  }

  // async writeToExcel(filePath: string, data: any[]): Promise<void> {
  //   try {
  //     // Read the existing workbook
  //     const workbook = XLSX.readFile(filePath);
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]];
  
  //     // Append new data
  //     const nextRow = XLSX.utils.decode_range(sheet['!ref'] || 'A1').e.r + 1;
  //     data.forEach((row, index) => {
  //       const rowNumber = nextRow + index;
  //       for (const [key, value] of Object.entries(row)) {
  //         const cellAddress = XLSX.utils.encode_cell({ c: 0, r: rowNumber });
  //         sheet[cellAddress] = { v: value };
  //       }
  //     });
  
  //     // Write the updated workbook back to file
  //     XLSX.writeFile(filePath, workbook);
  //   } catch (error) {
  //     console.error('Failed to write to Excel file:', error);
  //     throw error;
  //   }
  // }
  
  async adjustPrice(page: Page, productUrl: string, newPrice: number): Promise<void> {
    try {
      // Navigate to the product's update page
      await page.goto(productUrl);
      await page.waitForLoadState('networkidle');
      
      // Find the price input field
      const priceInputSelector = 'input[name="price"]'; // Adjust the selector as needed
      const priceInput = await page.waitForSelector(priceInputSelector, { timeout: 10000 });
      await priceInput.click();
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await priceInput.type(newPrice.toString());
      
      // Save the changes
      const saveButtonSelector = 'button[type="submit"]'; // Adjust the selector as needed
      const saveButton = await page.waitForSelector(saveButtonSelector, { timeout: 10000 });
      await saveButton.click();
      await page.waitForLoadState('networkidle');
  
      console.log(`Price updated to ${newPrice} ₸`);
    } catch (error) {
      console.error('Failed to adjust price:', error);
      throw error;
    }
  }
  

  async getAllProductInfo(page: Page, filePath: string): Promise<void> {
    try {
      const products = await this.readExcel(filePath);
      for (const product of products) {
        const productUrl = `https://kaspi.kz${product['URL']}`;
        const currentPrice = product['CurrentPrice'];
        const minPrice = product['MinPrice'] || 0;
  
        const { productPrice } = await this.getProductData(page, productUrl);
  
        if (productPrice < minPrice) {
          const newPrice = productPrice - 10; // Example adjustment logic
          console.log(`Adjusting price for ${product['Name']} to ${newPrice} ₸`);
          await this.adjustPrice(page, productUrl, newPrice); // Pass productUrl and newPrice
        }
      }
    } catch (error) {
      console.error('Failed to get product info:', error);
      throw error;
    }
  }
  

  async getNewPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    return await this.browser.newPage();
  }

  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async onModuleDestroy() {
    await this.closeBrowser();
  }
}

