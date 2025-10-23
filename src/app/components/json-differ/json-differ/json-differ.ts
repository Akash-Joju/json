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
  leftValue?: any;
  rightValue?: any;
}

interface JsonLine {
  content: string;
  lineNumber: number;
  isHighlighted: boolean;
  diffType?: 'added' | 'removed' | 'modified';
}

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
    <!-- <button (click)="validateBoth()" class="btn btn--secondary">
      ✅ Validate Both
    </button> -->
  </div>

  <!-- Raw JSON Input Areas -->
  <div class="raw-json-section">
    <div class="section-header">
      <h3>JSON Input</h3>
      <div class="json-stats">
        <span *ngIf="leftJsonLines.length > 0">Left: {{leftJsonLines.length}} lines</span>
        <span *ngIf="rightJsonLines.length > 0">Right: {{rightJsonLines.length}} lines</span>
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

  <!-- Comparison Options Toggle Button - Only show when hasCompared is true -->
  <div *ngIf="hasCompared && !showOptionsPanel" class="options-toggle-section">
    <button (click)="toggleOptionsPanel()" class="btn btn--secondary options-toggle-btn">
      ⚙️ Click here for compare options
    </button>
  </div>

  <!-- Comparison Options Panel - Only show when showOptionsPanel is true -->
  <div *ngIf="showOptionsPanel" class="options-section">
    <div class="options-header">
      <h3>Comparison Options</h3>
      <button (click)="toggleOptionsPanel()" class="close-options-btn" title="Close options">
        ✕
      </button>
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
    <div class="options-actions">
      <button (click)="applyOptions()" class="btn btn--primary">
        🔄 Apply Options & Recompare
      </button>
    </div>
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
        <div class="diff-values" *ngIf="differences[currentDiffIndex]?.leftValue !== undefined || differences[currentDiffIndex]?.rightValue !== undefined">
          <span class="value-left" *ngIf="differences[currentDiffIndex]?.leftValue !== undefined">
            Left: {{formatValue(differences[currentDiffIndex]?.leftValue)}}
          </span>
          <span class="value-right" *ngIf="differences[currentDiffIndex]?.rightValue !== undefined">
            Right: {{formatValue(differences[currentDiffIndex]?.rightValue)}}
          </span>
        </div>
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
  showOptionsPanel: boolean = false;

  options: ComparisonOptions = {
    ignoreArrayOrder: false,
    caseSensitive: true,
    numericPrecision: 0,
    treatUndefinedAsNull: false,
    ignoreEmptyArrays: false,
    ignoreEmptyObjects: false,
    maxDepth: 50
  };

  private visited: WeakSet<object> = new WeakSet();

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
      this.showOptionsPanel = false; // Hide options panel initially
      
      // Reset visited set for circular reference detection
      this.visited = new WeakSet();

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

  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
  }

  applyOptions(): void {
    // Re-run comparison with new options
    this.compareJson();
    // Keep the options panel open after re-comparing
    this.showOptionsPanel = true;
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

  private findDifferences(leftObj: any, rightObj: any, path: string = '', depth: number = 0): void {
    // Check depth limit to prevent stack overflow
    if (depth > this.options.maxDepth) {
      return;
    }

    // Handle circular references for objects
    if (this.isObject(leftObj) && this.visited.has(leftObj)) {
      return;
    }
    if (this.isObject(leftObj)) {
      this.visited.add(leftObj);
    }

    // Normalize values based on options
    const normalizedLeft = this.normalizeValue(leftObj);
    const normalizedRight = this.normalizeValue(rightObj);

    // Check type differences
    const leftType = this.getType(normalizedLeft);
    const rightType = this.getType(normalizedRight);

    if (leftType !== rightType) {
      this.differences.push({
        description: `Type changed from ${leftType} to ${rightType}`,
        type: 'modified',
        path: path || 'root',
        leftValue: leftObj,
        rightValue: rightObj
      });
      return;
    }

    // Compare based on type
    switch (leftType) {
      case 'null':
      case 'undefined':
        // Already handled by normalization
        break;
      case 'boolean':
      case 'string':
        if (normalizedLeft !== normalizedRight) {
          this.differences.push({
            description: `Value changed from "${leftObj}" to "${rightObj}"`,
            type: 'modified',
            path: path || 'root',
            leftValue: leftObj,
            rightValue: rightObj
          });
        }
        break;
      case 'number':
        if (!this.areNumbersEqual(normalizedLeft, normalizedRight)) {
          this.differences.push({
            description: `Number changed from ${leftObj} to ${rightObj}`,
            type: 'modified',
            path: path || 'root',
            leftValue: leftObj,
            rightValue: rightObj
          });
        }
        break;
      case 'array':
        this.compareArrays(normalizedLeft, normalizedRight, path, depth);
        break;
      case 'object':
        this.compareObjects(normalizedLeft, normalizedRight, path, depth);
        break;
    }
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object';
  }

  private getType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  private normalizeValue(value: any): any {
    if (this.options.treatUndefinedAsNull && value === undefined) {
      return null;
    }
    
    if (this.options.ignoreEmptyArrays && Array.isArray(value) && value.length === 0) {
      return null;
    }
    
    if (this.options.ignoreEmptyObjects && this.isObject(value) && Object.keys(value).length === 0) {
      return null;
    }
    
    if (typeof value === 'string' && !this.options.caseSensitive) {
      return value.toLowerCase();
    }
    
    return value;
  }

  private areNumbersEqual(a: number, b: number): boolean {
    if (this.options.numericPrecision === 0) {
      return a === b;
    }
    
    const precision = Math.pow(10, this.options.numericPrecision);
    return Math.abs(a - b) < (1 / precision);
  }

  private compareArrays(leftArr: any[], rightArr: any[], path: string, depth: number): void {
    if (this.options.ignoreArrayOrder) {
      this.compareArraysIgnoringOrder(leftArr, rightArr, path, depth);
    } else {
      this.compareArraysWithOrder(leftArr, rightArr, path, depth);
    }
  }

  private compareArraysWithOrder(leftArr: any[], rightArr: any[], path: string, depth: number): void {
    const maxLength = Math.max(leftArr.length, rightArr.length);

    for (let i = 0; i < maxLength; i++) {
      const elementPath = path ? `${path}[${i}]` : `[${i}]`;

      if (i >= leftArr.length) {
        // Element added
        this.differences.push({
          description: `Element added at index ${i}`,
          type: 'added',
          path: elementPath,
          rightValue: rightArr[i]
        });
      } else if (i >= rightArr.length) {
        // Element removed
        this.differences.push({
          description: `Element removed from index ${i}`,
          type: 'removed',
          path: elementPath,
          leftValue: leftArr[i]
        });
      } else {
        // Compare elements at same position
        this.findDifferences(leftArr[i], rightArr[i], elementPath, depth + 1);
      }
    }
  }

  private compareArraysIgnoringOrder(leftArr: any[], rightArr: any[], path: string, depth: number): void {
    const leftUsed = new Set<number>();
    const rightUsed = new Set<number>();

    // Find matches first
    for (let i = 0; i < leftArr.length; i++) {
      for (let j = 0; j < rightArr.length; j++) {
        if (!rightUsed.has(j)) {
          // Create a temporary visited set to avoid pollution
          const originalVisited = this.visited;
          this.visited = new WeakSet();
          
          const hasDifferences = this.hasDifferences(leftArr[i], rightArr[j], depth + 1);
          
          // Restore original visited set
          this.visited = originalVisited;

          if (!hasDifferences) {
            leftUsed.add(i);
            rightUsed.add(j);
            break;
          }
        }
      }
    }

    // Report added elements
    for (let j = 0; j < rightArr.length; j++) {
      if (!rightUsed.has(j)) {
        this.differences.push({
          description: `Element added`,
          type: 'added',
          path: path ? `${path}[*]` : '[*]',
          rightValue: rightArr[j]
        });
      }
    }

    // Report removed elements
    for (let i = 0; i < leftArr.length; i++) {
      if (!leftUsed.has(i)) {
        this.differences.push({
          description: `Element removed`,
          type: 'removed',
          path: path ? `${path}[*]` : '[*]',
          leftValue: leftArr[i]
        });
      }
    }
  }

  private hasDifferences(leftObj: any, rightObj: any, depth: number): boolean {
    // Quick check for primitive values
    if (!this.isObject(leftObj) && !this.isObject(rightObj)) {
      return leftObj !== rightObj;
    }

    // For objects/arrays, create a temporary differences array
    const tempDifferences: Difference[] = [];
    const originalDifferences = this.differences;
    
    // Temporarily replace the differences array
    this.differences = tempDifferences;
    
    // Perform comparison
    this.findDifferences(leftObj, rightObj, '', depth);
    
    // Restore original differences array
    this.differences = originalDifferences;
    
    return tempDifferences.length > 0;
  }

  private compareObjects(leftObj: any, rightObj: any, path: string, depth: number): void {
    const allKeys = new Set([
      ...Object.keys(leftObj),
      ...Object.keys(rightObj)
    ]);

    for (const key of allKeys) {
      const normalizedKey = this.options.caseSensitive ? key : key.toLowerCase();
      const propertyPath = path ? `${path}.${normalizedKey}` : normalizedKey;

      if (!(key in leftObj)) {
        // Property added
        this.differences.push({
          description: `Property "${key}" added`,
          type: 'added',
          path: propertyPath,
          rightValue: rightObj[key]
        });
      } else if (!(key in rightObj)) {
        // Property removed
        this.differences.push({
          description: `Property "${key}" removed`,
          type: 'removed',
          path: propertyPath,
          leftValue: leftObj[key]
        });
      } else {
        // Compare property values
        this.findDifferences(leftObj[key], rightObj[key], propertyPath, depth + 1);
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
    const searchTerms = diff.path.split(/[\.\[\]]/).filter(term => term && term !== '*');
    return searchTerms.some(term => content.includes(term.toLowerCase()));
  }

  formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return Array.isArray(value) ? '[...]' : '{...}';
    return String(value);
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
    this.showOptionsPanel = false;
    this.visited = new WeakSet();
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
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}