// json-csv-converter.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSizePipe } from '../../../pipes/file-size.pipe';

interface ConversionOptions {
  flattenObjects: boolean;
  flattenArrays: boolean;
  includeHeaders: boolean;
  delimiter: string;
  arrayHandling: 'expand' | 'stringify';
}

interface CsvTableData {
  headers: string[];
  rows: any[][];
}

@Component({
  selector: 'app-json-csv-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, FileSizePipe],
  templateUrl: './json-csv.html',
  styleUrls: ['./json-csv.scss']
})
export class JsonCsvConverterComponent {
  activeInputMethod: 'manual' | 'file' | 'url' = 'manual';
  jsonInput: string = '';
  isValid: boolean = true;
  errorMessage: string = '';
  selectedFile: File | null = null;
  fileLoading: boolean = false;
  fileError: string | null = null;
  isDragOver: boolean = false;
  urlInput: string = '';
  urlLoading: boolean = false;
  urlError: string | null = null;
  urlSuccess: boolean = false;
  csvOutput: string = '';
  isConverted: boolean = false;
  conversionError: string = '';
  csvTableData: CsvTableData = { headers: [], rows: [] };
  autoDetectedRootPath: string = '';
  
  // Dark theme properties
  isDarkMode: boolean = false;

  conversionOptions: ConversionOptions = {
    flattenObjects: true,
    flattenArrays: true,
    includeHeaders: true,
    delimiter: ',',
    arrayHandling: 'expand'
  };

  workingExamples: string[] = [
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/posts', 
    'https://jsonplaceholder.typicode.com/todos'
  ];

  constructor(private cdRef: ChangeDetectorRef) {
    const savedTheme = localStorage.getItem('xml-viewer-theme');
    if (savedTheme) {
      this.isDarkMode = savedTheme === 'dark';
    }
  }

  // Dark theme toggle method
  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('xml-viewer-theme', this.isDarkMode ? 'dark' : 'light');
  }

  setInputMethod(method: 'manual' | 'file' | 'url'): void {
    this.activeInputMethod = method;
    this.clearErrors();
  }

  onJsonInputChange(): void {
    this.errorMessage = '';
    this.isConverted = false;
    this.csvOutput = '';
    this.csvTableData = { headers: [], rows: [] };
    this.autoDetectedRootPath = '';
    
    if (!this.jsonInput.trim()) {
      this.isValid = true;
      return;
    }

    try {
      const jsonData = JSON.parse(this.jsonInput);
      this.isValid = true;
      this.autoDetectedRootPath = this.findRootArrayPath(jsonData);
    } catch (error) {
      this.isValid = false;
      this.errorMessage = 'Invalid JSON format';
    }
  }

  formatJson(): void {
    if (!this.jsonInput.trim()) {
      return;
    }

    try {
      const jsonData = JSON.parse(this.jsonInput);
      this.jsonInput = JSON.stringify(jsonData, null, 2);
      this.isValid = true;
      this.errorMessage = '';
    } catch (error) {
      this.isValid = false;
      this.errorMessage = 'Cannot format invalid JSON';
    }
  }

  convertToCsv(): void {
    if (!this.isValid || !this.jsonInput.trim()) {
      this.conversionError = 'Please provide valid JSON first';
      return;
    }

    try {
      const jsonData = JSON.parse(this.jsonInput);
      const result = this.jsonToCsv(jsonData);
      this.csvOutput = result.csv;
      this.csvTableData = result.tableData;
      this.isConverted = true;
      this.conversionError = '';
      this.cdRef.detectChanges();
    } catch (error: any) {
      this.conversionError = error.message || 'Conversion failed';
      this.isConverted = false;
      this.csvTableData = { headers: [], rows: [] };
    }
  }

  private findRootArrayPath(obj: any, currentPath: string = ''): string {
    if (Array.isArray(obj) && obj.length > 0) {
      return currentPath;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          const result = this.findRootArrayPath(obj[key], newPath);
          if (result) return result;
        }
      }
    }
    
    return '';
  }

  private jsonToCsv(data: any): { csv: string, tableData: CsvTableData } {
    let rows: string[] = [];
    let tableData: CsvTableData = { headers: [], rows: [] };
    
    // Always wrap data in array for processing
    let rootData = Array.isArray(data) ? data : [data];
    
    if (rootData.length === 0) {
      return { csv: '', tableData: { headers: [], rows: [] } };
    }
    
    const headers = this.getAllHeaders(rootData);
    tableData.headers = headers;
    
    if (this.conversionOptions.includeHeaders) {
      rows.push(headers.join(this.conversionOptions.delimiter));
    }
    
    const tableRows: any[][] = [];
    rootData.forEach((item: any) => {
      const row = headers.map(header => {
        const value = this.getValueByPath(item, header);
        return this.escapeCsvValue(value);
      });
      rows.push(row.join(this.conversionOptions.delimiter));
      tableRows.push(row.map(cell => this.unescapeCsvValue(cell)));
    });
    
    tableData.rows = tableRows;
    
    return { csv: rows.join('\n'), tableData };
  }

  private getAllHeaders(data: any[]): string[] {
    const allHeaders = new Map<string, number>();
    
    data.forEach((item, index) => {
      const itemHeaders = this.extractAllPathsInOrder(item, '');
      itemHeaders.forEach(header => {
        if (!allHeaders.has(header)) {
          allHeaders.set(header, allHeaders.size);
        }
      });
    });
    
    return Array.from(allHeaders.keys());
  }

  private extractAllPathsInOrder(obj: any, currentPath: string): string[] {
    const paths: string[] = [];
    
    if (obj === null || obj === undefined) {
      if (currentPath) paths.push(currentPath);
      return paths;
    }
    
    if (typeof obj !== 'object') {
      if (currentPath) paths.push(currentPath);
      return paths;
    }
    
    if (Array.isArray(obj)) {
      if (this.conversionOptions.flattenArrays && this.conversionOptions.arrayHandling === 'expand') {
        // STRATEGY 2: Always use array indices for ALL arrays
        for (let i = 0; i < obj.length; i++) {
          const newPath = currentPath ? `${currentPath}.${i}` : `${i}`;
          const nestedPaths = this.extractAllPathsInOrder(obj[i], newPath);
          paths.push(...nestedPaths);
        }
      } else {
        if (currentPath) paths.push(currentPath);
      }
    } else if (this.conversionOptions.flattenObjects) {
      const keys = Object.keys(obj);
      for (const key of keys) {
        const newPath = currentPath ? `${currentPath}.${key}` : key;
        const nestedPaths = this.extractAllPathsInOrder(obj[key], newPath);
        paths.push(...nestedPaths);
      }
    } else {
      if (currentPath) paths.push(currentPath);
    }
    
    return paths;
  }

  private getValueByPath(obj: any, path: string): any {
    if (!path || !obj) return '';
    
    // Handle dot notation for the new path format
    const parts = path.split('.').filter(part => part !== '');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return '';
      }
      
      // Check if part is an array index
      const index = parseInt(part, 10);
      if (!isNaN(index) && Array.isArray(current)) {
        if (index >= 0 && index < current.length) {
          current = current[index];
        } else {
          return '';
        }
      } else if (typeof current === 'object' && current !== null) {
        // For objects, access by key
        current = current[part];
      } else {
        return '';
      }
      
      if (current === undefined) return '';
    }
    
    if (current === null || current === undefined) {
      return '';
    }
    
    // Return primitive values directly
    if (typeof current !== 'object') {
      return current;
    }
    
    // For objects and arrays that aren't being flattened, stringify them
    if (Array.isArray(current)) {
      if (this.conversionOptions.arrayHandling === 'stringify' || !this.conversionOptions.flattenArrays) {
        return JSON.stringify(current);
      }
    } else if (!this.conversionOptions.flattenObjects) {
      return JSON.stringify(current);
    }
    
    // If we reach here, it means we have an object that should be flattened further
    // but we're at a leaf node in the path, so return empty string
    return '';
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }
    
    const stringValue = String(value);
    
    if (stringValue.includes('"') || 
        stringValue.includes('\n') || 
        stringValue.includes('\r') || 
        stringValue.includes(',') || 
        stringValue.includes(';') ||
        stringValue.trim() === '') {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private unescapeCsvValue(value: string): string {
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1).replace(/""/g, '"');
    }
    return value;
  }

  copyCsvToClipboard(): void {
    if (!this.csvOutput) return;
    
    navigator.clipboard.writeText(this.csvOutput).then(() => {
      console.log('CSV copied to clipboard!');
    }).catch(err => {
      this.conversionError = 'Failed to copy to clipboard';
    });
  }

  downloadCsv(): void {
    if (!this.csvOutput) return;
    
    const blob = new Blob([this.csvOutput], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  clearAll(): void {
    this.jsonInput = '';
    this.urlInput = '';
    this.selectedFile = null;
    this.csvOutput = '';
    this.csvTableData = { headers: [], rows: [] };
    this.autoDetectedRootPath = '';
    this.isValid = true;
    this.isConverted = false;
    this.errorMessage = '';
    this.conversionError = '';
    this.clearErrors();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileError = null;
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.fileError = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  async loadFile(): Promise<void> {
    if (!this.selectedFile) return;

    this.fileLoading = true;
    this.fileError = null;

    try {
      const content = await this.readFileAsText(this.selectedFile);
      this.jsonInput = content;
      this.onJsonInputChange();
      this.activeInputMethod = 'manual';
    } catch (error: any) {
      this.fileError = error.message || 'Failed to load file';
    } finally {
      this.fileLoading = false;
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = null;
  }

  async loadFromUrl(): Promise<void> {
    if (!this.urlInput?.trim()) {
      this.urlError = 'Please enter a URL';
      return;
    }

    this.urlLoading = true;
    this.urlError = null;
    this.urlSuccess = false;

    try {
      const response = await fetch(this.urlInput);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const jsonData = await response.json();
      this.jsonInput = JSON.stringify(jsonData, null, 2);
      this.onJsonInputChange();
      this.urlSuccess = true;
      this.activeInputMethod = 'manual';
    } catch (error: any) {
      this.urlError = error.message || 'Failed to load from URL';
    } finally {
      this.urlLoading = false;
    }
  }

  loadSampleJson(): void {
    this.jsonInput = `{
  "links": [
    {
      "rel": "self",
      "href": "https://4636482-sb3.suitetalk.api.netsuite.com/services/rest/record/v1/itemFulfillment/511528?expandSubResources=true"
    }
  ],
  "createdDate": "2025-11-05T14:09:00Z",
  "createdFrom": {
    "links": [],
    "id": "511427",
    "refName": "Transfer Order #TO0000160"
  },
  "custbody_gc_asn_by_spring": false,
  "item": {
    "links": [
      {
        "rel": "self",
        "href": "https://4636482-sb3.suitetalk.api.netsuite.com/services/rest/record/v1/itemfulfillment/511528/item"
      }
    ],
    "items": [
      {
        "links": [
          {
            "rel": "self",
            "href": "https://4636482-sb3.suitetalk.api.netsuite.com/services/rest/record/v1/itemfulfillment/511528/item/2"
          }
        ],
        "itemName": "MSP21B48-001-L",
        "quantity": 5
      }
    ]
  }
}`;
    this.onJsonInputChange();
  }

  private clearErrors(): void {
    this.fileError = null;
    this.urlError = null;
    this.urlSuccess = false;
    this.errorMessage = '';
    this.conversionError = '';
  }
}