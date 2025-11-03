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
    <p>Compare two JSON objects</p>
  </div>

  <!-- Compact Load Section -->
  <div class="compact-load-section">
    <div class="load-row">
      <div class="json-source">
        <label>JSON 1 Source:</label>
        <div class="source-controls">
          <input type="file" #fileInput1 (change)="onFileSelected($event, true)" accept=".json" class="file-input">
          <button type="button" class="btn btn--compact" (click)="fileInput1.click()">
            📁 File
          </button>
          <input type="text" [(ngModel)]="leftUrl" placeholder="URL" class="url-input compact">
          <button (click)="loadFromUrl(leftUrl, true)" class="btn btn--compact" [disabled]="!leftUrl">
            🌐 Load
          </button>
        </div>
      </div>

      <div class="json-source">
        <label>JSON 2 Source:</label>
        <div class="source-controls">
          <input type="file" #fileInput2 (change)="onFileSelected($event, false)" accept=".json" class="file-input">
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
    <button (click)="compareJson()" class="btn btn--primary compact">
      🔍 Compare
    </button>
    <button (click)="clearAll()" class="btn btn--compact">
      🗑️ Clear
    </button>
    <button (click)="swapJson()" class="btn btn--compact">
      🔄 Swap
    </button>
    <button (click)="loadSampleData()" class="btn btn--compact">
      📋 Sample
    </button>
    <button (click)="formatBothJson()" class="btn btn--compact">
      💫 Format
    </button>
  </div>

  <!-- Compact JSON Input Areas -->
  <div class="compact-json-section">
    <div class="json-inputs-container">
      <div class="json-input">
        <div class="json-header">
          <h4>JSON 1</h4>
          <span class="line-count">{{leftJsonLines}} lines</span>
        </div>
        <textarea
          [(ngModel)]="leftJson"
          placeholder="Paste JSON 1 or load from file/URL"
          class="json-textarea compact"
          rows="6"
          (input)="onJsonInput($event, true)"
          (blur)="autoFormatJson(true)"
          (keydown.control.enter)="autoFormatJson(true)"
          (keydown.meta.enter)="autoFormatJson(true)"
        ></textarea>
      </div>
      
      <div class="json-input">
        <div class="json-header">
          <h4>JSON 2</h4>
          <span class="line-count">{{rightJsonLines}} lines</span>
        </div>
        <textarea
          [(ngModel)]="rightJson"
          placeholder="Paste JSON 2 or load from file/URL"
          class="json-textarea compact"
          rows="6"
          (input)="onJsonInput($event, false)"
          (blur)="autoFormatJson(false)"
          (keydown.control.enter)="autoFormatJson(false)"
          (keydown.meta.enter)="autoFormatJson(false)"
        ></textarea>
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
  formatStatus: string = '';

  options: ComparisonOptions = {
    ignoreArrayOrder: false,
    caseSensitive: true,
    numericPrecision: 0,
    treatUndefinedAsNull: false,
    ignoreEmptyArrays: false,
    ignoreEmptyObjects: false,
    maxDepth: 50
  };

  private formatTimeout: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private jsonCompareService: JsonCompareService
  ) {}

  // File selection handler with auto-format
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
          this.showFormatStatus('File loaded and formatted');
        } catch (err) {
          this.error = `Invalid JSON file: ${(err as Error).message}`;
        }
      };
      reader.readAsText(file);
    }
  }

  // Load JSON from URL with auto-format
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
      this.showFormatStatus('URL data loaded and formatted');
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  // Handle JSON input with auto-format on blur and Ctrl/Cmd+Enter
  onJsonInput(event: any, isLeft: boolean): void {
    this.updateLineCounts();
    
    // Clear any existing timeout
    if (this.formatTimeout) {
      clearTimeout(this.formatTimeout);
    }

    // Set a timeout to auto-format after user stops typing (1.5 seconds)
    this.formatTimeout = setTimeout(() => {
      this.autoFormatJson(isLeft);
    }, 1500);
  }

  // Auto-format JSON with validation
  autoFormatJson(isLeft: boolean): void {
    const jsonString = isLeft ? this.leftJson : this.rightJson;
    
    if (!jsonString.trim()) {
      return;
    }

    try {
      // Try to parse and format
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      
      if (isLeft) {
        this.leftJson = formatted;
      } else {
        this.rightJson = formatted;
      }
      
      this.updateLineCounts();
      this.error = '';
      this.showFormatStatus('JSON auto-formatted');
    } catch (err) {
      // Don't show error for partial input, only set error if it's a complete invalid JSON
      if (jsonString.trim().length > 10) { // Only show error for substantial input
        this.error = `Invalid JSON format: ${(err as Error).message}`;
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

  compareJson(): void {
    try {
      this.error = '';
      
      // Auto-format both JSONs before comparison
      this.autoFormatJson(true);
      this.autoFormatJson(false);
      
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
    this.formatStatus = '';
  }

  formatBothJson(): void {
    this.autoFormatJson(true);
    this.autoFormatJson(false);
    this.showFormatStatus('Both JSONs formatted');
  }

  swapJson(): void {
    [this.leftJson, this.rightJson] = [this.rightJson, this.leftJson];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    this.updateLineCounts();
    this.showFormatStatus('JSONs swapped');
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
    this.showFormatStatus('Sample data loaded');
  }
}