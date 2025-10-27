import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { XmlUtilsService, XmlViewerStats } from '../../../services/xml-utils.service';
import { XmlCompareService } from '../../../services/xml-compare/xml-compare.service';

interface ComparisonOptions {
  ignoreWhitespace: boolean;
  ignoreComments: boolean;
  ignoreProcessingInstructions: boolean;
  ignoreElementOrder: boolean;
  caseSensitive: boolean;
  normalizeText: boolean;
}

@Component({
  selector: 'app-xml-differ',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
<div class="xml-differ-container">
  <div class="header">
    <h2>XML Differ</h2>
    <p>Compare and find differences between two XML documents</p>
  </div>

  <!-- File & URL Load Section -->
  <div class="load-section">
    <div class="load-container">
      <!-- Left Side Load Options -->
      <div class="load-options">
        <h3>Load XML 1</h3>
        <div class="load-buttons">
          <div class="file-upload">
            <input type="file" #fileInput1 (change)="onFileSelected($event, true)" accept=".xml,application/xml,text/xml" class="file-input">
            <button type="button" class="btn btn--secondary" (click)="fileInput1.click()">
              📁 Choose File 1
            </button>
            <span class="file-name">{{leftFileName || 'No file chosen'}}</span>
          </div>
          
          <div class="url-load">
            <input type="text" [(ngModel)]="leftUrl" placeholder="Enter URL for XML 1" class="url-input">
            <button (click)="loadFromUrl(leftUrl, true)" class="btn btn--secondary" [disabled]="!leftUrl">
              🌐 Load URL 1
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side Load Options -->
      <div class="load-options">
        <h3>Load XML 2</h3>
        <div class="load-buttons">
          <div class="file-upload">
            <input type="file" #fileInput2 (change)="onFileSelected($event, false)" accept=".xml,application/xml,text/xml" class="file-input">
            <button type="button" class="btn btn--secondary" (click)="fileInput2.click()">
              📁 Choose File 2
            </button>
            <span class="file-name">{{rightFileName || 'No file chosen'}}</span>
          </div>
          
          <div class="url-load">
            <input type="text" [(ngModel)]="rightUrl" placeholder="Enter URL for XML 2" class="url-input">
            <button (click)="loadFromUrl(rightUrl, false)" class="btn btn--secondary" [disabled]="!rightUrl">
              🌐 Load URL 2
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Controls -->
  <div class="controls">
    <button (click)="compareXml()" class="btn btn--primary">
      🔍 Compare XML
    </button>
    <button (click)="clearAll()" class="btn btn--secondary">
      🗑️ Clear All
    </button>
    <button (click)="swapXml()" class="btn btn--secondary">
      🔄 Swap XML
    </button>
    <button (click)="loadSampleData()" class="btn btn--secondary">
      📋 Sample Data
    </button>
    <button (click)="formatBothXml()" class="btn btn--secondary">
      💫 Format Both
    </button>
  </div>

  <!-- Raw XML Input Areas -->
  <div class="raw-xml-section">
    <div class="section-header">
      <h3>XML Input</h3>
      <div class="xml-stats">
        <span *ngIf="leftXmlLines > 0">Left: {{leftXmlLines}} lines</span>
        <span *ngIf="rightXmlLines > 0">Right: {{rightXmlLines}} lines</span>
      </div>
    </div>
    
    <div class="raw-xml-container">
      <div class="comparison-container">
        <div class="xml-section">
          <h4>XML 1</h4>
          <textarea
            [(ngModel)]="leftXml"
            placeholder="Paste first XML here or load from file/URL..."
            class="xml-textarea"
            (input)="updateLineCounts()"
          ></textarea>
          <div class="xml-stats" *ngIf="leftStats">
            <span>Nodes: {{leftStats.totalNodes}}</span>
            <span>Depth: {{leftStats.maxDepth}}</span>
            <span>Attributes: {{leftStats.totalAttributes}}</span>
            <span [class.valid]="leftStats.isValid" [class.invalid]="!leftStats.isValid">
              {{leftStats.isValid ? '✓ Valid' : '✗ Invalid'}}
            </span>
          </div>
        </div>
        <div class="xml-section">
          <h4>XML 2</h4>
          <textarea
            [(ngModel)]="rightXml"
            placeholder="Paste second XML here or load from file/URL..."
            class="xml-textarea"
            (input)="updateLineCounts()"
          ></textarea>
          <div class="xml-stats" *ngIf="rightStats">
            <span>Nodes: {{rightStats.totalNodes}}</span>
            <span>Depth: {{rightStats.maxDepth}}</span>
            <span>Attributes: {{rightStats.totalAttributes}}</span>
            <span [class.valid]="rightStats.isValid" [class.invalid]="!rightStats.isValid">
              {{rightStats.isValid ? '✓ Valid' : '✗ Invalid'}}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Comparison Options Panel -->
  <!-- <div class="options-section">
    <div class="options-header">
      <h3>Comparison Options</h3>
    </div> -->
    
    <!-- <div class="options-grid">
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreWhitespace">
        <span class="checkmark"></span>
        Ignore Whitespace
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreComments">
        <span class="checkmark"></span>
        Ignore Comments
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreProcessingInstructions">
        <span class="checkmark"></span>
        Ignore Processing Instructions
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreElementOrder">
        <span class="checkmark"></span>
        Ignore Element Order
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [ngModel]="!options.caseSensitive" (change)="options.caseSensitive = !options.caseSensitive">
        <span class="checkmark"></span>
        Case Insensitive
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.normalizeText">
        <span class="checkmark"></span>
        Normalize Text Content
      </label>
    </div>
  </div> -->

  <!-- Loading & Error Display -->
  <div *ngIf="loading" class="loading-message">
    ⏳ Loading XML data...
  </div>

  <div *ngIf="error" class="error-message">
    ❌ {{ error }}
  </div>
</div>
  `,
  styleUrls: ['./xml-differ.scss']
})
export class XmlDifferComponent {
  leftXml: string = '';
  rightXml: string = '';
  leftFileName: string = '';
  rightFileName: string = '';
  leftUrl: string = '';
  rightUrl: string = '';
  
  leftXmlLines: number = 0;
  rightXmlLines: number = 0;
  leftStats: XmlViewerStats | null = null;
  rightStats: XmlViewerStats | null = null;
  
  error: string = '';
  loading: boolean = false;

  options: ComparisonOptions = {
    ignoreWhitespace: true,
    ignoreComments: true,
    ignoreProcessingInstructions: true,
    ignoreElementOrder: false,
    caseSensitive: false,
    normalizeText: true
  };

  constructor(
    private http: HttpClient,
    private xmlUtils: XmlUtilsService,
    private router: Router,
    private xmlCompareService: XmlCompareService
  ) {}

  // File selection handler
  onFileSelected(event: any, isLeft: boolean): void {
    const file: File = event.target.files[0];
    if (file) {
      if (isLeft) {
        this.leftFileName = file.name;
      } else {
        this.rightFileName = file.name;
      }

      this.xmlUtils.readXmlFromFile(file).then(result => {
        if (result.error) {
          this.error = result.error;
          return;
        }
        
        if (isLeft) {
          this.leftXml = result.content;
          this.updateLeftStats();
        } else {
          this.rightXml = result.content;
          this.updateRightStats();
        }
        this.updateLineCounts();
        this.error = '';
      });
    }
  }

  // Load XML from URL
  async loadFromUrl(url: string, isLeft: boolean): Promise<void> {
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
      if (isLeft) {
        this.leftUrl = url;
      } else {
        this.rightUrl = url;
      }
    }

    this.loading = true;
    this.error = '';

    try {
      const result = await this.xmlUtils.loadXmlFromUrl(url);
      
      if (result.error) {
        this.error = result.error;
        return;
      }
      
      if (isLeft) {
        this.leftXml = result.content;
        this.updateLeftStats();
      } else {
        this.rightXml = result.content;
        this.updateRightStats();
      }
      this.updateLineCounts();
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  compareXml(): void {
    try {
      this.error = '';

      // Update stats for both XMLs
      this.updateLeftStats();
      this.updateRightStats();

      // Parse XML documents
      const leftDoc = this.parseXmlToDocument(this.preprocessXml(this.leftXml));
      const rightDoc = this.parseXmlToDocument(this.preprocessXml(this.rightXml));

      // Store data in service and navigate to results
      this.xmlCompareService.setComparisonData({
        leftXml: this.leftXml,
        rightXml: this.rightXml,
        leftDoc: leftDoc,
        rightDoc: rightDoc,
        options: this.options
      });

      // Navigate to results page
      this.router.navigate(['/xml-results']);

    } catch (err) {
      this.error = 'Error comparing XML: ' + (err as Error).message;
    }
  }

  updateLineCounts(): void {
    this.leftXmlLines = this.leftXml ? this.leftXml.split('\n').length : 0;
    this.rightXmlLines = this.rightXml ? this.rightXml.split('\n').length : 0;
  }

  private updateLeftStats(): void {
    if (this.leftXml.trim()) {
      const result = this.xmlUtils.parseXml(this.leftXml);
      this.leftStats = result.stats;
      if (result.error) {
        this.error = 'Left XML error: ' + result.error;
      }
    } else {
      this.leftStats = null;
    }
  }

  private updateRightStats(): void {
    if (this.rightXml.trim()) {
      const result = this.xmlUtils.parseXml(this.rightXml);
      this.rightStats = result.stats;
      if (result.error) {
        this.error = 'Right XML error: ' + result.error;
      }
    } else {
      this.rightStats = null;
    }
  }

  private preprocessXml(xmlString: string): string {
    let processed = xmlString;
    
    if (this.options.ignoreComments) {
      processed = processed.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    if (this.options.ignoreProcessingInstructions) {
      processed = processed.replace(/<\?[\s\S]*?\?>/g, '');
    }
    
    if (this.options.ignoreWhitespace) {
      processed = processed.replace(/>\s+</g, '><');
    }
    
    if (!this.options.caseSensitive) {
      processed = processed.replace(/<(\/?)([^\s>]+)/g, (match, slash, tagName) => {
        return `<${slash}${tagName.toLowerCase()}`;
      });
      processed = processed.replace(/(\S+)=/g, (match, attrName) => {
        return attrName.toLowerCase() + '=';
      });
    }
    
    return processed;
  }

  private parseXmlToDocument(xmlString: string): Document | null {
    if (!xmlString.trim()) return null;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      
      const parseError = doc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        return null;
      }
      
      return doc;
    } catch {
      return null;
    }
  }

  clearAll(): void {
    this.leftXml = '';
    this.rightXml = '';
    this.leftFileName = '';
    this.rightFileName = '';
    this.leftUrl = '';
    this.rightUrl = '';
    this.leftXmlLines = 0;
    this.rightXmlLines = 0;
    this.leftStats = null;
    this.rightStats = null;
    this.error = '';
  }

  formatBothXml(): void {
    if (this.leftXml.trim()) {
      this.leftXml = this.xmlUtils.formatXml(this.leftXml);
      this.updateLeftStats();
    }
    if (this.rightXml.trim()) {
      this.rightXml = this.xmlUtils.formatXml(this.rightXml);
      this.updateRightStats();
    }
    this.updateLineCounts();
  }

  swapXml(): void {
    [this.leftXml, this.rightXml] = [this.rightXml, this.leftXml];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    [this.leftStats, this.rightStats] = [this.rightStats, this.leftStats];
    this.updateLineCounts();
  }

  loadSampleData(): void {
    const sample1 = `<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee id="1">
    <name>John Doe</name>
    <position>Developer</position>
    <department>IT</department>
    <salary currency="USD">50000</salary>
  </employee>
  <employee id="2">
    <name>Jane Smith</name>
    <position>Designer</position>
    <department>Creative</department>
  </employee>
</employees>`;

    const sample2 = `<?xml version="1.0" encoding="UTF-8"?>
<employees>
  <employee id="1">
    <name>John Doe</name>
    <position>Senior Developer</position>
    <department>IT</department>
    <salary currency="USD">55000</salary>
  </employee>
  <employee id="2">
    <name>Jane Smith</name>
    <position>Senior Designer</position>
    <department>Creative</department>
    <salary currency="USD">52000</salary>
  </employee>
  <employee id="3">
    <name>Bob Johnson</name>
    <position>Manager</position>
    <department>IT</department>
  </employee>
</employees>`;

    this.leftXml = sample1;
    this.rightXml = sample2;
    this.leftFileName = 'sample1.xml';
    this.rightFileName = 'sample2.xml';
    this.updateLeftStats();
    this.updateRightStats();
    this.updateLineCounts();
  }
}