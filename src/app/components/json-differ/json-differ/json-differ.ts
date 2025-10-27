import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { JsonCompareService } from '../../../services/json-compare/json-compare.service';

interface ComparisonOptions {
  ignoreArrayOrder: boolean;
  caseSensitive: boolean;
  numericPrecision: number;
  treatUndefinedAsNull: boolean;
  ignoreEmptyArrays: boolean;
  ignoreEmptyObjects: boolean;
  maxDepth: number;
}

@Component({
  selector: 'app-json-differ',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
<div class="json-differ-container">
  <div class="header">
    <h2>JSON Differ</h2>
    <p>Compare and find differences between two JSON objects</p>
  </div>

  <!-- File & URL Load Section -->
  <div class="load-section">
    <div class="load-container">
      <!-- Left Side Load Options -->
      <div class="load-options">
        <h3>Load JSON 1</h3>
        <div class="load-buttons">
          <div class="file-upload">
            <input type="file" #fileInput1 (change)="onFileSelected($event, true)" accept=".json,application/json" class="file-input">
            <button type="button" class="btn btn--secondary" (click)="fileInput1.click()">
              📁 Choose File 1
            </button>
            <span class="file-name">{{leftFileName || 'No file chosen'}}</span>
          </div>
          
          <div class="url-load">
            <input type="text" [(ngModel)]="leftUrl" placeholder="Enter URL for JSON 1" class="url-input">
            <button (click)="loadFromUrl(leftUrl, true)" class="btn btn--secondary" [disabled]="!leftUrl">
              🌐 Load URL 1
            </button>
          </div>
        </div>
      </div>

      <!-- Right Side Load Options -->
      <div class="load-options">
        <h3>Load JSON 2</h3>
        <div class="load-buttons">
          <div class="file-upload">
            <input type="file" #fileInput2 (change)="onFileSelected($event, false)" accept=".json,application/json" class="file-input">
            <button type="button" class="btn btn--secondary" (click)="fileInput2.click()">
              📁 Choose File 2
            </button>
            <span class="file-name">{{rightFileName || 'No file chosen'}}</span>
          </div>
          
          <div class="url-load">
            <input type="text" [(ngModel)]="rightUrl" placeholder="Enter URL for JSON 2" class="url-input">
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
    <button (click)="compareJson()" class="btn btn--primary">
      🔍 Compare JSON
    </button>
    <button (click)="clearAll()" class="btn btn--secondary">
      🗑️ Clear All
    </button>
    <button (click)="swapJson()" class="btn btn--secondary">
      🔄 Swap JSON
    </button>
    <button (click)="loadSampleData()" class="btn btn--secondary">
      📋 Sample Data
    </button>
    <button (click)="formatBothJson()" class="btn btn--secondary">
      💫 Format Both
    </button>
  </div>

  <!-- Raw JSON Input Areas -->
  <div class="raw-json-section">
    <div class="section-header">
      <h3>JSON Input</h3>
      <div class="json-stats">
        <span *ngIf="leftJsonLines > 0">Left: {{leftJsonLines}} lines</span>
        <span *ngIf="rightJsonLines > 0">Right: {{rightJsonLines}} lines</span>
      </div>
    </div>
    
    <div class="raw-json-container">
      <div class="comparison-container">
        <div class="json-section">
          <h4>JSON 1</h4>
          <textarea
            [(ngModel)]="leftJson"
            placeholder="Paste first JSON here or load from file/URL..."
            class="json-textarea"
            rows="12"
            (input)="updateLineCounts()"
          ></textarea>
        </div>
        <div class="json-section">
          <h4>JSON 2</h4>
          <textarea
            [(ngModel)]="rightJson"
            placeholder="Paste second JSON here or load from file/URL..."
            class="json-textarea"
            rows="12"
            (input)="updateLineCounts()"
          ></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- Comparison Options Panel -->
  <!-- <div class="options-section">
    <div class="options-header">
      <h3>Comparison Options</h3>
    </div>
    
    <div class="options-grid">
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreArrayOrder">
        <span class="checkmark"></span>
        Ignore Array Order
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.caseSensitive" [value]="false">
        <span class="checkmark"></span>
        Case Insensitive
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.treatUndefinedAsNull">
        <span class="checkmark"></span>
        Treat Undefined as Null
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreEmptyArrays">
        <span class="checkmark"></span>
        Ignore Empty Arrays
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreEmptyObjects">
        <span class="checkmark"></span>
        Ignore Empty Objects
      </label>
    </div>
    <div class="numeric-option">
      <label>Numeric Precision:</label>
      <input type="number" [(ngModel)]="options.numericPrecision" min="0" max="10" class="precision-input">
      <small>(0 = exact match)</small>
    </div>
    <div class="depth-option">
      <label>Max Depth:</label>
      <input type="number" [(ngModel)]="options.maxDepth" min="1" max="100" class="depth-input">
    </div>
  </div> -->

  <!-- Loading & Error Display -->
  <div *ngIf="loading" class="loading-message">
    ⏳ Loading JSON data...
  </div>

  <div *ngIf="error" class="error-message">
    ❌ {{ error }}
  </div>
</div>
  `,
  styleUrls: ['./json-differ.scss']
})
export class JsonDifferComponent {
  leftJson: string = '';
  rightJson: string = '';
  leftFileName: string = '';
  rightFileName: string = '';
  leftUrl: string = '';
  rightUrl: string = '';
  
  leftJsonLines: number = 0;
  rightJsonLines: number = 0;
  
  error: string = '';
  loading: boolean = false;

  options: ComparisonOptions = {
    ignoreArrayOrder: false,
    caseSensitive: true,
    numericPrecision: 0,
    treatUndefinedAsNull: false,
    ignoreEmptyArrays: false,
    ignoreEmptyObjects: false,
    maxDepth: 50
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private jsonCompareService: JsonCompareService
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

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const content = e.target.result;
          const parsed = JSON.parse(content);
          const formatted = JSON.stringify(parsed, null, 2);
          
          if (isLeft) {
            this.leftJson = formatted;
          } else {
            this.rightJson = formatted;
          }
          this.updateLineCounts();
          this.error = '';
        } catch (err) {
          this.error = `Invalid JSON file: ${(err as Error).message}`;
        }
      };
      reader.readAsText(file);
    }
  }

  // Load JSON from URL
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
      const data = await this.http.get(url).toPromise();
      const formatted = JSON.stringify(data, null, 2);
      
      if (isLeft) {
        this.leftJson = formatted;
      } else {
        this.rightJson = formatted;
      }
      this.updateLineCounts();
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  compareJson(): void {
    try {
      this.error = '';
      
      const leftObj = this.leftJson.trim() ? JSON.parse(this.leftJson) : {};
      const rightObj = this.rightJson.trim() ? JSON.parse(this.rightJson) : {};

      // Store data in service and navigate to results
      this.jsonCompareService.setComparisonData({
        leftJson: this.leftJson,
        rightJson: this.rightJson,
        leftObject: leftObj,
        rightObject: rightObj,
        options: this.options
      });

      // Navigate to results page
      this.router.navigate(['/results']);

    } catch (err) {
      this.error = 'Invalid JSON format: ' + (err as Error).message;
    }
  }

  updateLineCounts(): void {
    this.leftJsonLines = this.leftJson ? this.leftJson.split('\n').length : 0;
    this.rightJsonLines = this.rightJson ? this.rightJson.split('\n').length : 0;
  }

  clearAll(): void {
    this.leftJson = '';
    this.rightJson = '';
    this.leftFileName = '';
    this.rightFileName = '';
    this.leftUrl = '';
    this.rightUrl = '';
    this.leftJsonLines = 0;
    this.rightJsonLines = 0;
    this.error = '';
  }

  formatBothJson(): void {
    try {
      if (this.leftJson.trim()) {
        const obj = JSON.parse(this.leftJson);
        this.leftJson = JSON.stringify(obj, null, 2);
      }
      if (this.rightJson.trim()) {
        const obj = JSON.parse(this.rightJson);
        this.rightJson = JSON.stringify(obj, null, 2);
      }
      this.updateLineCounts();
      this.error = '';
    } catch (err) {
      this.error = `Cannot format invalid JSON: ${(err as Error).message}`;
    }
  }

  swapJson(): void {
    [this.leftJson, this.rightJson] = [this.rightJson, this.leftJson];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    this.updateLineCounts();
  }

  loadSampleData(): void {
    const sample1 = {
      "name": "John Doe",
      "age": 30,
      "score": 95.123456,
      "address": {
        "street": "123 Main St",
        "city": "New York"
      },
      "hobbies": ["reading", "swimming"],
      "active": true,
      "tags": null,
      "metadata": {}
    };

    const sample2 = {
      "name": "john doe",
      "age": 30.000001,
      "score": 95.123457,
      "address": {
        "street": "123 Main St",
        "city": "Boston",
        "zipcode": "02101"
      },
      "hobbies": ["swimming", "reading", "gaming"],
      "email": "john@example.com",
      "active": true,
      "tags": undefined,
      "metadata": { "version": 1 }
    };

    this.leftJson = JSON.stringify(sample1, null, 2);
    this.rightJson = JSON.stringify(sample2, null, 2);
    this.leftFileName = 'sample1.json';
    this.rightFileName = 'sample2.json';
    this.updateLineCounts();
  }
}