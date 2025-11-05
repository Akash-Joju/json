import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { XmlUtilsService} from '../../../services/xml-utils.service';
import { XmlViewerStats } from '../../xml-types/xml-types';
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
<div class="xml-differ-container" [class.dark-mode]="isDarkMode">
  <!-- Header with Theme Toggle -->
  <div class="page-header">
    <h2>XML Differ</h2>
    <div class="theme-toggle">
      <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </div>
  </div>

  <p class="subtitle">Compare two XML documents</p>

  <!-- Compact Load Section -->
  <div class="compact-load-section">
    <div class="load-row">
      <div class="xml-source">
        <label>XML 1 Source:</label>
        <div class="source-controls">
          <input type="file" #fileInput1 (change)="onFileSelected($event, true)" accept=".xml,application/xml,text/xml" class="file-input">
          <button type="button" class="btn btn--compact" (click)="fileInput1.click()">
            📁 File
          </button>
          <input type="text" [(ngModel)]="leftUrl" placeholder="URL" class="url-input compact">
          <button (click)="loadFromUrl(leftUrl, true)" class="btn btn--compact" [disabled]="!leftUrl">
            🌐 Load
          </button>
        </div>
      </div>

      <div class="xml-source">
        <label>XML 2 Source:</label>
        <div class="source-controls">
          <input type="file" #fileInput2 (change)="onFileSelected($event, false)" accept=".xml,application/xml,text/xml" class="file-input">
          <button type="button" class="btn btn--compact" (click)="fileInput2.click()">
            📁 File
          </button>
          <input type="text" [(ngModel)]="rightUrl" placeholder="URL" class="url-input compact">
          <button (click)="loadFromUrl(rightUrl, false)" class="btn btn--compact" [disabled]="!rightUrl">
            🌐 Load
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Compact Controls -->
  <div class="compact-controls">
    <button (click)="compareXml()" class="btn btn--primary compact">
      🔍 Compare
    </button>
    <button (click)="clearAll()" class="btn btn--compact">
      🗑️ Clear
    </button>
    <button (click)="swapXml()" class="btn btn--compact">
      🔄 Swap
    </button>
    <button (click)="loadSampleData()" class="btn btn--compact">
      📋 Sample
    </button>
    <button (click)="formatBothXml()" class="btn btn--compact">
      💫 Format
    </button>
  </div>

  <!-- Compact XML Input Areas -->
  <div class="compact-xml-section">
    <div class="xml-inputs-container">
      <div class="xml-input">
        <div class="xml-header">
          <h4>XML 1</h4>
          <div class="header-stats">
            <span class="line-count">{{leftXmlLines}} lines</span>
            <span *ngIf="leftStats" class="stats-badge" [class.valid]="leftStats.isValid" [class.invalid]="!leftStats.isValid">
              {{leftStats.isValid ? '✓' : '✗'}}
            </span>
          </div>
        </div>
        <textarea
          [(ngModel)]="leftXml"
          placeholder="Paste XML 1 or load from file/URL"
          class="xml-textarea compact"
          rows="6"
          (input)="onXmlInput($event, true)"
          (blur)="autoFormatXml(true)"
          (keydown.control.enter)="autoFormatXml(true)"
          (keydown.meta.enter)="autoFormatXml(true)"
        ></textarea>
        <div class="xml-stats" *ngIf="leftStats">
          <span>Nodes: {{leftStats.totalNodes}}</span>
          <span>Depth: {{leftStats.maxDepth}}</span>
          <span>Attrs: {{leftStats.totalAttributes}}</span>
        </div>
      </div>
      
      <div class="xml-input">
        <div class="xml-header">
          <h4>XML 2</h4>
          <div class="header-stats">
            <span class="line-count">{{rightXmlLines}} lines</span>
            <span *ngIf="rightStats" class="stats-badge" [class.valid]="rightStats.isValid" [class.invalid]="!rightStats.isValid">
              {{rightStats.isValid ? '✓' : '✗'}}
            </span>
          </div>
        </div>
        <textarea
          [(ngModel)]="rightXml"
          placeholder="Paste XML 2 or load from file/URL"
          class="xml-textarea compact"
          rows="6"
          (input)="onXmlInput($event, false)"
          (blur)="autoFormatXml(false)"
          (keydown.control.enter)="autoFormatXml(false)"
          (keydown.meta.enter)="autoFormatXml(false)"
        ></textarea>
        <div class="xml-stats" *ngIf="rightStats">
          <span>Nodes: {{rightStats.totalNodes}}</span>
          <span>Depth: {{rightStats.maxDepth}}</span>
          <span>Attrs: {{rightStats.totalAttributes}}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading & Error Display -->
  <div *ngIf="loading" class="compact-message loading">
    ⏳ Loading...
  </div>

  <div *ngIf="error" class="compact-message error">
    ❌ {{ error }}
  </div>

  <!-- Auto-format status -->
  <div *ngIf="formatStatus" class="compact-message info">
    {{ formatStatus }}
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
  formatStatus: string = '';

  // Dark theme properties
  isDarkMode: boolean = false;

  options: ComparisonOptions = {
    ignoreWhitespace: true,
    ignoreComments: true,
    ignoreProcessingInstructions: true,
    ignoreElementOrder: false,
    caseSensitive: false,
    normalizeText: true
  };

  private formatTimeout: any = null;

  constructor(
    private http: HttpClient,
    private xmlUtils: XmlUtilsService,
    private router: Router,
    private xmlCompareService: XmlCompareService
  ) {
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

  // File selection handler with auto-format
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
        this.showFormatStatus('File loaded and formatted');
      });
    }
  }

  // Load XML from URL with auto-format
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
      this.showFormatStatus('URL data loaded and formatted');
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  // Handle XML input with auto-format on blur and Ctrl/Cmd+Enter
  onXmlInput(event: any, isLeft: boolean): void {
    this.updateLineCounts();
    
    // Update stats in real-time
    if (isLeft) {
      this.updateLeftStats();
    } else {
      this.updateRightStats();
    }
    
    // Clear any existing timeout
    if (this.formatTimeout) {
      clearTimeout(this.formatTimeout);
    }

    // Set a timeout to auto-format after user stops typing (1.5 seconds)
    this.formatTimeout = setTimeout(() => {
      this.autoFormatXml(isLeft);
    }, 1500);
  }

  // Auto-format XML with validation
  autoFormatXml(isLeft: boolean): void {
    const xmlString = isLeft ? this.leftXml : this.rightXml;
    
    if (!xmlString.trim()) {
      return;
    }

    try {
      // Format the XML
      const formatted = this.xmlUtils.formatXml(xmlString);
      
      if (isLeft) {
        this.leftXml = formatted;
        this.updateLeftStats();
      } else {
        this.rightXml = formatted;
        this.updateRightStats();
      }
      
      this.updateLineCounts();
      this.error = '';
      this.showFormatStatus('XML auto-formatted');
    } catch (err) {
      // Don't show error for partial input, only set error if it's a complete invalid XML
      if (xmlString.trim().length > 10) {
        this.error = `Invalid XML format: ${(err as Error).message}`;
      }
    }
  }

  // Show temporary format status message
  private showFormatStatus(message: string): void {
    this.formatStatus = message;
    setTimeout(() => {
      this.formatStatus = '';
    }, 2000);
  }

  compareXml(): void {
    try {
      this.error = '';
      
      // Auto-format both XMLs before comparison
      this.autoFormatXml(true);
      this.autoFormatXml(false);
      
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
        // Don't show error for partial input
        if (this.leftXml.trim().length > 10) {
          this.error = 'Left XML error: ' + result.error;
        }
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
        // Don't show error for partial input
        if (this.rightXml.trim().length > 10) {
          this.error = 'Right XML error: ' + result.error;
        }
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
    this.formatStatus = '';
  }

  formatBothXml(): void {
    this.autoFormatXml(true);
    this.autoFormatXml(false);
    this.showFormatStatus('Both XMLs formatted');
  }

  swapXml(): void {
    [this.leftXml, this.rightXml] = [this.rightXml, this.leftXml];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    [this.leftStats, this.rightStats] = [this.rightStats, this.leftStats];
    this.updateLineCounts();
    this.showFormatStatus('XMLs swapped');
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
    this.showFormatStatus('Sample data loaded');
  }
}