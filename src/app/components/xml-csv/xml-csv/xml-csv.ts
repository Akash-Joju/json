// xml-csv-converter.component.ts
import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileSizePipe } from '../../../pipes/file-size.pipe';
import { ThemeService } from '../../../services/theme.service'; // ADD THIS
import { Subscription } from 'rxjs'; // ADD THIS

interface ConversionOptions {
  includeHeaders: boolean;
  delimiter: string;
  includeAttributes: boolean;
  textContentHandling: 'separate' | 'inline';
  arrayHandling: 'stringify' | 'expand';
  normalizeStructure: boolean;
}

interface CsvTableData {
  headers: string[];
  rows: any[][];
}

interface XmlNode {
  tagName: string;
  attributes: { [key: string]: string };
  children: XmlNode[];
  textContent: string;
  parent?: XmlNode;
}

@Component({
  selector: 'app-xml-csv-converter',
  standalone: true,
  imports: [CommonModule, FormsModule, FileSizePipe],
  templateUrl: './xml-csv.html',
  styleUrls: ['./xml-csv.scss']
})
export class XmlCsvConverterComponent implements OnInit, OnDestroy {

  // Theme management - UPDATED
  isDarkMode: boolean = false;
  private themeSubscription!: Subscription;

  activeInputMethod: 'manual' | 'file' | 'url' = 'manual';
  xmlInput: string = '';
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

  conversionOptions: ConversionOptions = {
    includeHeaders: true,
    delimiter: ',',
    includeAttributes: true,
    textContentHandling: 'inline',
    arrayHandling: 'expand',
    normalizeStructure: true
  };

  workingExamples: string[] = [
    'https://www.w3schools.com/xml/note.xml',
    'https://www.w3schools.com/xml/cd_catalog.xml',
    'https://www.w3schools.com/xml/plant_catalog.xml'
  ];

  constructor(
    private cdRef: ChangeDetectorRef,
    private themeService: ThemeService // ADD THIS
  ) {
    // Use the synchronous method to get initial theme - UPDATED
    this.isDarkMode = this.themeService.getCurrentThemeValue() === 'dark';
  }

  ngOnInit() {
    // Subscribe to theme changes from the global theme service - ADD THIS
    this.themeSubscription = this.themeService.getCurrentTheme().subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
    
    this.scrollToTop();
  }

  ngOnDestroy(): void {
    // Clean up subscription - ADD THIS
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  // Theme toggle method - UPDATED to use service
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  private scrollToTop() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }

  setInputMethod(method: 'manual' | 'file' | 'url'): void {
    this.activeInputMethod = method;
    this.clearErrors();
  }

  onXmlInputChange(): void {
    this.errorMessage = '';
    this.isConverted = false;
    this.csvOutput = '';
    this.csvTableData = { headers: [], rows: [] };
    this.autoDetectedRootPath = '';
    
    if (!this.xmlInput.trim()) {
      this.isValid = true;
      return;
    }

    try {
      this.parseXml(this.xmlInput);
      this.isValid = true;
      this.autoDetectedRootPath = this.findRootElementPath(this.xmlInput);
    } catch (error) {
      this.isValid = false;
      this.errorMessage = 'Invalid XML format';
    }
  }

  formatXml(): void {
    if (!this.xmlInput.trim()) {
      return;
    }

    try {
      const formatted = this.formatXmlString(this.xmlInput);
      this.xmlInput = formatted;
      this.isValid = true;
      this.errorMessage = '';
    } catch (error) {
      this.isValid = false;
      this.errorMessage = 'Cannot format invalid XML';
    }
  }

  convertToCsv(): void {
    if (!this.isValid || !this.xmlInput.trim()) {
      this.conversionError = 'Please provide valid XML first';
      return;
    }

    try {
      const xmlDoc = this.parseXml(this.xmlInput);
      const result = this.xmlToCsv(xmlDoc);
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

  private parseXml(xmlString: string): Document {
    const cleanedXml = xmlString.trim();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cleanedXml, "text/xml");
    
    const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
    if (parseError) {
      throw new Error(`XML Parse Error: ${parseError.textContent}`);
    }
    
    return xmlDoc;
  }

  private formatXmlString(xml: string): string {
    const parsed = this.parseXml(xml);
    return this.formatNode(parsed.documentElement, 0);
  }

  private formatNode(node: Node, indent: number): string {
    const indentStr = '  '.repeat(indent);
    
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text ? indentStr + text : '';
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const element = node as Element;
    let result = indentStr + '<' + element.tagName;
    
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      result += ` ${attr.name}="${attr.value}"`;
    }
    
    const childNodes = Array.from(element.childNodes);
    const hasElementChildren = childNodes.some(n => n.nodeType === Node.ELEMENT_NODE);
    const hasTextContent = childNodes.some(n => 
      n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
    );
    
    if (!hasElementChildren && !hasTextContent) {
      return result + ' />';
    }
    
    result += '>';
    
    if (hasElementChildren) {
      result += '\n';
      childNodes.forEach(child => {
        const formatted = this.formatNode(child, indent + 1);
        if (formatted) {
          result += formatted + '\n';
        }
      });
      result += indentStr;
    } else if (hasTextContent) {
      const textContent = element.textContent?.trim();
      if (textContent) {
        result += textContent;
      }
    }
    
    result += `</${element.tagName}>`;
    return result;
  }

  private findRootElementPath(xmlString: string): string {
    try {
      const xmlDoc = this.parseXml(xmlString);
      return this.findRepeatingElementPath(xmlDoc.documentElement);
    } catch {
      return '';
    }
  }

  private findRepeatingElementPath(element: Element): string {
    const childElements = Array.from(element.children);
    const elementGroups = new Map<string, Element[]>();
    
    childElements.forEach(child => {
      const group = elementGroups.get(child.tagName) || [];
      group.push(child);
      elementGroups.set(child.tagName, group);
    });
    
    for (const [tagName, elements] of elementGroups) {
      if (elements.length > 1) {
        return `${element.tagName}/${tagName}`;
      }
    }
    
    for (const child of childElements) {
      const grandchildPath = this.findRepeatingElementPath(child);
      if (grandchildPath) {
        return grandchildPath;
      }
    }
    
    return element.tagName;
  }

  private xmlToCsv(xmlDoc: Document): { csv: string, tableData: CsvTableData } {
    const rootElement = xmlDoc.documentElement;
    const dataRows = this.extractDataRows(rootElement);
    
    if (dataRows.length === 0) {
      throw new Error('No data rows found for CSV conversion');
    }
    
    const headers = this.getAllHeaders(dataRows);
    const rows: string[] = [];
    const tableRows: any[][] = [];
    
    if (this.conversionOptions.includeHeaders) {
      rows.push(headers.join(this.conversionOptions.delimiter));
    }
    
    dataRows.forEach(rowData => {
      const rowValues = headers.map(header => {
        const value = this.getValueFromData(rowData, header);
        return this.escapeCsvValue(value);
      });
      
      rows.push(rowValues.join(this.conversionOptions.delimiter));
      tableRows.push(rowValues.map(cell => this.unescapeCsvValue(cell)));
    });
    
    const tableData: CsvTableData = {
      headers: headers,
      rows: tableRows
    };
    
    return { csv: rows.join('\n'), tableData };
  }

  private extractDataRows(rootElement: Element): any[] {
    const dataRows: any[] = [];
    
    // STRATEGY 2: Extract the entire document structure, not just repeating elements
    const documentData = this.elementToDataObject(rootElement);
    
    // If we have repeating elements at root level, create multiple rows
    const repeatingElements = this.findAllRepeatingElements(rootElement);
    
    if (repeatingElements.length > 0) {
      // Multiple rows based on repeating elements
      repeatingElements.forEach(element => {
        const rowData = this.mergeDocumentData(documentData, element);
        dataRows.push(rowData);
      });
    } else {
      // Single row with complete document data
      dataRows.push(documentData);
    }
    
    return dataRows;
  }

  private mergeDocumentData(documentData: any, repeatingElement: Element): any {
    // Create a deep copy of the document data
    const mergedData = JSON.parse(JSON.stringify(documentData));
    
    // Find the path to the repeating element and replace it with the current instance
    const repeatingPath = this.findElementPathInData(documentData, repeatingElement.tagName);
    if (repeatingPath) {
      this.setValueByPath(mergedData, repeatingPath, this.elementToDataObject(repeatingElement));
    }
    
    return mergedData;
  }

  private findElementPathInData(data: any, tagName: string, currentPath: string = ''): string | null {
    if (typeof data !== 'object' || data === null) {
      return null;
    }
    
    for (const key in data) {
      if (key === tagName) {
        return currentPath ? `${currentPath}.${key}` : key;
      }
      
      if (typeof data[key] === 'object') {
        const path = this.findElementPathInData(data[key], tagName, currentPath ? `${currentPath}.${key}` : key);
        if (path) return path;
      }
    }
    
    return null;
  }

  private setValueByPath(obj: any, path: string, value: any): void {
    const parts = path.split('.').filter(part => part !== '');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const lastPart = parts[parts.length - 1];
    current[lastPart] = value;
  }

  private findAllRepeatingElements(element: Element): Element[] {
    const results: Element[] = [];
    
    // First, check direct children for repeating elements
    const childElements = Array.from(element.children);
    const elementCounts = new Map<string, number>();
    const elementGroups = new Map<string, Element[]>();
    
    childElements.forEach(child => {
      const count = elementCounts.get(child.tagName) || 0;
      elementCounts.set(child.tagName, count + 1);
      
      const group = elementGroups.get(child.tagName) || [];
      group.push(child);
      elementGroups.set(child.tagName, group);
    });
    
    // Return the first set of repeating elements found
    for (const [tagName, count] of elementCounts) {
      if (count > 1) {
        return elementGroups.get(tagName) || [];
      }
    }
    
    // If no repeating elements at this level, check deeper levels
    for (const child of childElements) {
      const childResults = this.findAllRepeatingElements(child);
      if (childResults.length > 0) {
        return childResults;
      }
    }
    
    return results;
  }

  private elementToDataObject(element: Element): any {
    const obj: any = {};
    
    obj['_element'] = element.tagName;
    
    if (this.conversionOptions.includeAttributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        obj[`@${attr.name}`] = attr.value;
      }
    }
    
    const childElements = Array.from(element.children);
    const childData: { [key: string]: any } = {};
    const childCounts = new Map<string, number>();
    
    childElements.forEach(child => {
      const count = childCounts.get(child.tagName) || 0;
      childCounts.set(child.tagName, count + 1);
    });
    
    childElements.forEach(child => {
      const count = childCounts.get(child.tagName)!;
      const childObj = this.elementToDataObject(child);
      
      if (count === 1) {
        if (this.hasOnlyTextContent(childObj)) {
          childData[child.tagName] = child.textContent?.trim() || '';
        } else {
          childData[child.tagName] = childObj;
        }
      } else {
        if (!childData[child.tagName]) {
          childData[child.tagName] = [];
        }
        
        if (this.hasOnlyTextContent(childObj)) {
          childData[child.tagName].push(child.textContent?.trim() || '');
        } else {
          childData[child.tagName].push(childObj);
        }
      }
    });
    
    Object.keys(childData).forEach(key => {
      obj[key] = childData[key];
    });
    
    const hasElementChildren = childElements.length > 0;
    const textContent = element.textContent?.trim();
    
    if (textContent && !hasElementChildren) {
      if (this.conversionOptions.textContentHandling === 'separate') {
        obj['_text'] = textContent;
      } else {
        obj['_value'] = textContent;
      }
    } else if (textContent && hasElementChildren) {
      const childText = this.extractDirectTextContent(element);
      if (childText) {
        obj['_text'] = childText;
      }
    }
    
    return obj;
  }

  private hasOnlyTextContent(obj: any): boolean {
    const keys = Object.keys(obj).filter(k => k !== '_element');
    return keys.length === 0 || 
           (keys.length === 1 && (keys[0] === '_text' || keys[0] === '_value')) ||
           (keys.length === 1 && keys[0].startsWith('@') && Object.keys(obj).length <= 2);
  }

  private extractDirectTextContent(element: Element): string {
    let text = '';
    for (let i = 0; i < element.childNodes.length; i++) {
      const node = element.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
        text += node.textContent.trim() + ' ';
      }
    }
    return text.trim();
  }

  private getAllHeaders(data: any[]): string[] {
    const headerSet = new Set<string>();
    const allPaths: string[] = [];
    
    data.forEach(item => {
      const paths = this.extractAllPaths(item, '');
      paths.forEach(path => {
        headerSet.add(path);
        if (!allPaths.includes(path)) {
          allPaths.push(path);
        }
      });
    });
    
    // Maintain insertion order instead of sorting alphabetically
    return Array.from(headerSet).sort((a, b) => {
      const indexA = allPaths.indexOf(a);
      const indexB = allPaths.indexOf(b);
      return indexA - indexB;
    });
  }

  private extractAllPaths(obj: any, currentPath: string): string[] {
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
      if (this.conversionOptions.arrayHandling === 'expand') {
        // STRATEGY 2: Always use array indices for ALL arrays
        for (let i = 0; i < obj.length; i++) {
          const newPath = currentPath ? `${currentPath}.${i}` : `${i}`;
          const nestedPaths = this.extractAllPaths(obj[i], newPath);
          paths.push(...nestedPaths);
        }
      } else {
        // Stringify mode - just add the array path
        if (currentPath) paths.push(currentPath);
      }
      return paths;
    }
    
    // Extract all keys including special ones
    const allKeys = Object.keys(obj);
    
    // Process each key
    allKeys.forEach(key => {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      
      if (obj[key] === null || obj[key] === undefined) {
        paths.push(newPath);
      } else if (typeof obj[key] === 'object') {
        paths.push(...this.extractAllPaths(obj[key], newPath));
      } else {
        paths.push(newPath);
      }
    });
    
    return paths;
  }

  private getValueFromData(data: any, path: string): any {
    if (!path || !data) return '';
    
    // Handle dot notation for the new path format
    const parts = path.split('.').filter(part => part !== '');
    let current = data;
    
    for (const part of parts) {
      if (current === null || current === undefined) {
        return '';
      }
      
      // Handle array indices
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
    
    // For objects, try to extract meaningful content
    return this.extractObjectContent(current);
  }

  private extractObjectContent(obj: any): string {
    if (obj === null || obj === undefined) return '';
    
    if (typeof obj !== 'object') {
      return String(obj);
    }
    
    // Try to extract text content in priority order
    if (obj._text !== undefined) return obj._text;
    if (obj._value !== undefined) return obj._value;
    
    // For simple objects with mostly text content, extract all text
    const textParts: string[] = [];
    
    for (const key in obj) {
      if (key !== '_element' && !key.startsWith('@')) {
        const value = obj[key];
        if (typeof value === 'string' && value.trim()) {
          textParts.push(value.trim());
        } else if (typeof value !== 'object') {
          textParts.push(String(value));
        }
      }
    }
    
    if (textParts.length > 0) {
      return textParts.join(' ');
    }
    
    // For complex objects, return empty string to avoid JSON clutter
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
        stringValue.includes(this.conversionOptions.delimiter) ||
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
    
    const blob = new Blob([this.csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  clearAll(): void {
    this.xmlInput = '';
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
      this.xmlInput = content;
      this.onXmlInputChange();
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
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const xmlText = await response.text();
      this.xmlInput = xmlText;
      this.onXmlInputChange();
      this.urlSuccess = true;
      this.activeInputMethod = 'manual';
    } catch (error: any) {
      this.urlError = error.message || 'Failed to load from URL';
    } finally {
      this.urlLoading = false;
    }
  }

  loadSampleXml(): void {
    this.xmlInput = `<?xml version="1.0" encoding="utf-8"?>
<Orders xmlns="http://www.spscommerce.com/RSX">
  <Order>
    <Meta>
      <IsDropShip>true</IsDropShip>
    </Meta>
    <Header>
      <OrderHeader>
        <TradingPartnerId>7NEALLVICIENTER</TradingPartnerId>
        <PurchaseOrderNumber>PO_33042</PurchaseOrderNumber>
        <TsetPurposeCode>00</TsetPurposeCode>
        <PrimaryPOTypeCode>DS</PrimaryPOTypeCode>
        <PurchaseOrderDate>2025-10-19</PurchaseOrderDate>
        <Vendor>320</Vendor>
        <CustomerOrderNumber>FAO-327264</CustomerOrderNumber>
      </OrderHeader>
      <Dates>
        <DateTimeQualifier>010</DateTimeQualifier>
        <Date>2025-10-19</Date>
      </Dates>
      <Dates>
        <DateTimeQualifier>001</DateTimeQualifier>
        <Date>2025-10-21</Date>
      </Dates>
      <Address>
        <AddressTypeCode>ST</AddressTypeCode>
        <AddressName>Vivian Mroz</AddressName>
        <Address1>191 Grand Ave</Address1>
        <City>Lafayette</City>
        <State>LA</State>
        <PostalCode>70503</PostalCode>
        <Country>US</Country>
        <Contacts>
          <ContactTypeCode>IC</ContactTypeCode>
          <PrimaryPhone>+17208793000</PrimaryPhone>
          <PrimaryEmail>viviandog@gmail.com</PrimaryEmail>
        </Contacts>
      </Address>
      <CarrierInformation>
        <ServiceLevelCodes>
          <ServiceLevelCode>SG</ServiceLevelCode>
        </ServiceLevelCodes>
      </CarrierInformation>
      <Notes>
        <NoteCode>GEN</NoteCode>
        <Note>Acceptance of a purchase order and shipment of that merchandise constitutes acceptance of each term contained in this guide.</Note>
      </Notes>
    </Header>
    <LineItem>
      <OrderLine>
        <LineSequenceNumber>1</LineSequenceNumber>
        <VendorPartNumber>24182608</VendorPartNumber>
        <EAN>8719066017205</EAN>
        <OrderQty>1</OrderQty>
        <OrderQtyUOM>EA</OrderQtyUOM>
        <PurchasePrice>13.75</PurchasePrice>
      </OrderLine>
      <PriceInformation>
        <PriceTypeIDCode>RTL</PriceTypeIDCode>
        <UnitPrice>33</UnitPrice>
      </PriceInformation>
      <ProductOrItemDescription>
        <ProductCharacteristicCode>08</ProductCharacteristicCode>
        <ProductDescription>Plush MIFFY ECO Corduroy Green 9''</ProductDescription>
      </ProductOrItemDescription>
    </LineItem>
    <LineItem>
      <OrderLine>
        <LineSequenceNumber>2</LineSequenceNumber>
        <VendorPartNumber>24182619</VendorPartNumber>
        <EAN>8719066017311</EAN>
        <OrderQty>1</OrderQty>
        <OrderQtyUOM>EA</OrderQtyUOM>
        <PurchasePrice>13.75</PurchasePrice>
      </OrderLine>
      <PriceInformation>
        <PriceTypeIDCode>RTL</PriceTypeIDCode>
        <UnitPrice>33</UnitPrice>
      </PriceInformation>
      <ProductOrItemDescription>
        <ProductCharacteristicCode>08</ProductCharacteristicCode>
        <ProductDescription>Plush MIFFY ECO Corduroy Ice Blue 9''</ProductDescription>
      </ProductOrItemDescription>
    </LineItem>
    <Summary>
      <TotalAmount>27.5</TotalAmount>
      <TotalLineItemNumber>2</TotalLineItemNumber>
    </Summary>
  </Order>
</Orders>`;
    this.onXmlInputChange();
  }

  private clearErrors(): void {
    this.fileError = null;
    this.urlError = null;
    this.urlSuccess = false;
    this.errorMessage = '';
    this.conversionError = '';
  }
}