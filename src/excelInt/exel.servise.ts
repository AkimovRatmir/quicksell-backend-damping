import * as xlsx from 'xlsx';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ExcelService {
  readExcelFile() {
    // Load the Excel workbook and the first sheet
    const workbook = xlsx.readFile('/home/ratmir/kaspiBotBaza/baza.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);
    return data;
  }

  updateColumn(artikul: string, columnName: string, newValue: string) {
    // Load the workbook and worksheet
    const workbook = xlsx.readFile('/home/ratmir/kaspiBotBaza/baza.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert worksheet to JSON
    const data = xlsx.utils.sheet_to_json(worksheet, { raw: true });

    // Track if the row was updated
    let isUpdated = false;

    // Update the specified column
    const updatedData = data.map((row: any) => {
      if (row['артикул']?.toString().trim() === artikul.trim()) {
        row[columnName] = newValue; // Update the value
        isUpdated = true;
      }
      // Ensure the column exists for all rows
      if (!row.hasOwnProperty(columnName)) {
        row[columnName] = ''; // Default value
      }
      return row;
    });

    if (!isUpdated) {
      throw new Error(`No row found with артикул ${artikul}`);
    }

    // Convert the updated JSON back to a worksheet
    const updatedWorksheet = xlsx.utils.json_to_sheet(updatedData);
    workbook.Sheets[sheetName] = updatedWorksheet;

    // Write the updated workbook back to the file
    xlsx.writeFile(workbook, '/home/ratmir/kaspiBotBaza/baza.xlsx');

    // Return success message
    return { message: `Row with артикул ${artikul} updated successfully.` };
  }
}




