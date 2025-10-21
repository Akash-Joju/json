import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

interface Difference {
  description: string;
  leftLine?: number;
  rightLine?: number;
  type: 'added' | 'removed' | 'modified';
  path: string;
}

interface JsonLine {
  content: string;
  lineNumber: number;
  isHighlighted: boolean;
  diffType?: 'added' | 'removed' | 'modified';
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
  </div>

  <!-- Raw JSON Input Areas -->
  <div class="raw-json-section">
    <div class="section-header">
      <h3>JSON Input</h3>
      <div class="text-area-buttons">
        <!-- <button (click)="formatJson(leftJson, true)" class="btn btn--small">
          💫 Format Left
        </button>
        <button (click)="formatJson(rightJson, false)" class="btn btn--small">
          💫 Format Right
        </button>
        <button (click)="validateBoth()" class="btn btn--small">
          ✅ Validate Both
        </button> -->
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
          ></textarea>
        </div>
        <div class="json-section">
          <h4>JSON 2</h4>
          <textarea
            [(ngModel)]="rightJson"
            placeholder="Paste second JSON here or load from file/URL..."
            class="json-textarea"
            rows="12"
          ></textarea>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading & Error Display -->
  <div *ngIf="loading" class="loading-message">
    ⏳ Loading JSON data...
  </div>

  <div *ngIf="error" class="error-message">
    ❌ {{ error }}
  </div>

  <!-- Comparison Results Section -->
  <div *ngIf="differences.length > 0" class="results-section">
    <!-- Differences Navigation -->
    <div class="differences-navigation">
      <div class="nav-header">
        <h3>Comparison Results ({{differences.length}} differences found)</h3>
        <div class="nav-controls">
          <button (click)="previousDifference()" [disabled]="currentDiffIndex === 0" class="nav-btn">
            ◀ Previous
          </button>
          <span class="nav-counter">
            {{currentDiffIndex + 1}} / {{differences.length}}
          </span>
          <button (click)="nextDifference()" [disabled]="currentDiffIndex === differences.length - 1" class="nav-btn">
            Next ▶
          </button>
        </div>
      </div>
      
      <div class="difference-description">
        <div class="diff-type-badge" [class]="'badge-' + differences[currentDiffIndex]?.type">
          {{differences[currentDiffIndex]?.type | titlecase}}
        </div>
        <p>{{differences[currentDiffIndex]?.description}}</p>
        <small class="diff-path">Path: {{differences[currentDiffIndex]?.path}}</small>
      </div>
    </div>

    <!-- JSON Viewers -->
    <div class="comparison-container">
      <!-- Left JSON Viewer -->
      <div class="json-section">
        <h3>JSON 1 Viewer</h3>
        <div class="json-viewer">
          <div class="json-lines">
            <div 
              *ngFor="let line of leftJsonLines" 
              class="json-line"
              [class.highlighted]="line.isHighlighted"
              [class.diff-added]="line.diffType === 'added'"
              [class.diff-removed]="line.diffType === 'removed'"
              [class.diff-modified]="line.diffType === 'modified'"
            >
              <span class="line-number">{{line.lineNumber}}</span>
              <span class="line-content" [innerHTML]="line.content"></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right JSON Viewer -->
      <div class="json-section">
        <h3>JSON 2 Viewer</h3>
        <div class="json-viewer">
          <div class="json-lines">
            <div 
              *ngFor="let line of rightJsonLines" 
              class="json-line"
              [class.highlighted]="line.isHighlighted"
              [class.diff-added]="line.diffType === 'added'"
              [class.diff-removed]="line.diffType === 'removed'"
              [class.diff-modified]="line.diffType === 'modified'"
            >
              <span class="line-number">{{line.lineNumber}}</span>
              <span class="line-content" [innerHTML]="line.content"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- No Results Message -->
  <div *ngIf="hasCompared && differences.length === 0" class="no-differences">
    <div class="no-diff-content">
      <span class="no-diff-icon">✅</span>
      <h3>No Differences Found</h3>
      <p>Both JSON objects are identical!</p>
    </div>
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
  
  leftJsonLines: JsonLine[] = [];
  rightJsonLines: JsonLine[] = [];
  differences: Difference[] = [];
  currentDiffIndex: number = 0;
  
  error: string = '';
  loading: boolean = false;
  hasCompared: boolean = false;

  constructor(private http: HttpClient) {}

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
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  compareJson(): void {
    try {
      this.error = '';
      this.differences = [];
      this.currentDiffIndex = 0;
      this.hasCompared = true;

      const leftObj = this.leftJson.trim() ? JSON.parse(this.leftJson) : {};
      const rightObj = this.rightJson.trim() ? JSON.parse(this.rightJson) : {};

      // Parse JSON into lines for display
      this.leftJsonLines = this.parseJsonToLines(this.leftJson);
      this.rightJsonLines = this.parseJsonToLines(this.rightJson);

      // Find differences
      this.findDifferences(leftObj, rightObj);

      // Highlight first difference
      if (this.differences.length > 0) {
        this.highlightDifference(this.currentDiffIndex);
      }

    } catch (err) {
      this.error = 'Invalid JSON format: ' + (err as Error).message;
    }
  }

  private parseJsonToLines(jsonString: string): JsonLine[] {
    if (!jsonString.trim()) return [];
    
    const lines = jsonString.split('\n');
    return lines.map((content, index) => ({
      content: this.escapeHtml(content),
      lineNumber: index + 1,
      isHighlighted: false
    }));
  }

  private findDifferences(leftObj: any, rightObj: any, path: string = ''): void {
    if (typeof leftObj !== typeof rightObj) {
      this.differences.push({
        description: `Type mismatch: ${typeof leftObj} vs ${typeof rightObj}`,
        type: 'modified',
        path: path || 'root'
      });
      return;
    }

    if (typeof leftObj !== 'object' || leftObj === null || rightObj === null) {
      if (leftObj !== rightObj) {
        this.differences.push({
          description: `Value changed from "${leftObj}" to "${rightObj}"`,
          type: 'modified',
          path: path || 'root'
        });
      }
      return;
    }

    // Handle arrays
    if (Array.isArray(leftObj) && Array.isArray(rightObj)) {
      if (leftObj.length !== rightObj.length) {
        this.differences.push({
          description: `Array length changed from ${leftObj.length} to ${rightObj.length}`,
          type: 'modified',
          path: path || 'root'
        });
      }

      const maxLength = Math.max(leftObj.length, rightObj.length);
      for (let i = 0; i < maxLength; i++) {
        const newPath = path ? `${path}[${i}]` : `[${i}]`;
        if (i >= leftObj.length) {
          this.differences.push({
            description: `Element added at index ${i}: ${JSON.stringify(rightObj[i])}`,
            type: 'added',
            path: newPath
          });
        } else if (i >= rightObj.length) {
          this.differences.push({
            description: `Element removed at index ${i}: ${JSON.stringify(leftObj[i])}`,
            type: 'removed',
            path: newPath
          });
        } else {
          this.findDifferences(leftObj[i], rightObj[i], newPath);
        }
      }
      return;
    }

    // Handle objects
    const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
    
    for (const key of allKeys) {
      const newPath = path ? `${path}.${key}` : key;
      
      if (!(key in leftObj)) {
        this.differences.push({
          description: `Property "${key}" added with value: ${JSON.stringify(rightObj[key])}`,
          type: 'added',
          path: newPath
        });
      } else if (!(key in rightObj)) {
        this.differences.push({
          description: `Property "${key}" removed (was: ${JSON.stringify(leftObj[key])})`,
          type: 'removed',
          path: newPath
        });
      } else {
        this.findDifferences(leftObj[key], rightObj[key], newPath);
      }
    }
  }

  private highlightDifference(index: number): void {
    // Reset all highlights
    this.leftJsonLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });
    this.rightJsonLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });

    const diff = this.differences[index];
    
    // Find and highlight relevant lines based on the difference
    this.highlightLinesForDifference(diff);
  }

  private highlightLinesForDifference(diff: Difference): void {
    const path = diff.path.toLowerCase();
    
    this.leftJsonLines.forEach(line => {
      const content = line.content.toLowerCase();
      if (content.includes(path) || this.lineContainsDifference(content, diff, 'left')) {
        line.isHighlighted = true;
        line.diffType = diff.type;
      }
    });

    this.rightJsonLines.forEach(line => {
      const content = line.content.toLowerCase();
      if (content.includes(path) || this.lineContainsDifference(content, diff, 'right')) {
        line.isHighlighted = true;
        line.diffType = diff.type;
      }
    });
  }

  private lineContainsDifference(content: string, diff: Difference, side: 'left' | 'right'): boolean {
    // Simple heuristic to find relevant lines
    const searchTerms = diff.path.split('.').map(term => term.toLowerCase());
    return searchTerms.some(term => content.includes(term));
  }

  nextDifference(): void {
    if (this.currentDiffIndex < this.differences.length - 1) {
      this.currentDiffIndex++;
      this.highlightDifference(this.currentDiffIndex);
    }
  }

  previousDifference(): void {
    if (this.currentDiffIndex > 0) {
      this.currentDiffIndex--;
      this.highlightDifference(this.currentDiffIndex);
    }
  }

  clearAll(): void {
    this.leftJson = '';
    this.rightJson = '';
    this.leftFileName = '';
    this.rightFileName = '';
    this.leftUrl = '';
    this.rightUrl = '';
    this.leftJsonLines = [];
    this.rightJsonLines = [];
    this.differences = [];
    this.currentDiffIndex = 0;
    this.error = '';
    this.hasCompared = false;
  }

  formatJson(jsonString: string, isLeft: boolean): void {
    try {
      const obj = JSON.parse(jsonString);
      const formatted = JSON.stringify(obj, null, 2);
      if (isLeft) {
        this.leftJson = formatted;
      } else {
        this.rightJson = formatted;
      }
      this.error = '';
    } catch (err) {
      this.error = `Cannot format invalid JSON: ${(err as Error).message}`;
    }
  }

  validateBoth(): void {
    try {
      if (this.leftJson.trim()) {
        JSON.parse(this.leftJson);
      }
      if (this.rightJson.trim()) {
        JSON.parse(this.rightJson);
      }
      this.error = '✅ Both JSON objects are valid!';
      setTimeout(() => {
        if (this.error === '✅ Both JSON objects are valid!') {
          this.error = '';
        }
      }, 3000);
    } catch (err) {
      this.error = `❌ Invalid JSON: ${(err as Error).message}`;
    }
  }

  swapJson(): void {
    [this.leftJson, this.rightJson] = [this.rightJson, this.leftJson];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    if (this.differences.length > 0) {
      this.compareJson();
    }
  }

  loadSampleData(): void {
    const sample1 = {
      "name": "John Doe",
      "age": 30,
      "address": {
        "street": "123 Main St",
        "city": "New York"
      },
      "hobbies": ["reading", "swimming"],
      "active": true
    };

    const sample2 = {
      "name": "John Doe",
      "age": 31,
      "address": {
        "street": "123 Main St",
        "city": "Boston",
        "zipcode": "02101"
      },
      "hobbies": ["reading", "cycling", "gaming"],
      "email": "john@example.com",
      "active": true
    };

    this.leftJson = JSON.stringify(sample1, null, 2);
    this.rightJson = JSON.stringify(sample2, null, 2);
    this.leftFileName = 'sample1.json';
    this.rightFileName = 'sample2.json';
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}