import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add this import
import { Router } from '@angular/router';
import { JsonCompareService } from '../../../services/json-compare/json-compare.service';

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
  selector: 'app-json-results',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add FormsModule here
  template: `
<div class="json-results-container">
  <!-- Header with Back Button -->
  <div class="results-header">
    <div class="header-content">
      <button (click)="createNewDifference()" class="btn btn--primary back-btn">
        ← Create New Difference
      </button>
      <h2>JSON Comparison Results</h2>
      <div class="header-actions">
        <button (click)="toggleOptionsPanel()" class="btn btn--secondary">
          ⚙️ {{showOptionsPanel ? 'Hide' : 'Show'}} Options
        </button>
      </div>
    </div>
  </div>

  <!-- Summary Card -->
  <div class="summary-card">
    <!-- <div class="summary-item">
      <span class="summary-label">Total Differences:</span>
      <span class="summary-value" [class.no-diff]="differences.length === 0">{{differences.length}}</span>
    </div> -->
    <div class="summary-item">
      <span class="summary-label">JSON 1 Lines:</span>
      <span class="summary-value">{{leftJsonLines.length}}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">JSON 2 Lines:</span>
      <span class="summary-value">{{rightJsonLines.length}}</span>
    </div>
    <div class="summary-item" *ngIf="differences.length === 0">
      <span class="summary-label">Status:</span>
      <span class="summary-value success">Identical</span>
    </div>
  </div>

  <!-- Comparison Options Panel -->
  <div *ngIf="showOptionsPanel" class="options-section">
    <div class="options-header">
      <h3>Comparison Options</h3>
      <button (click)="toggleOptionsPanel()" class="close-options-btn" title="Close options">
        ✕
      </button>
    </div>
    
    <div class="options-grid">
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreArrayOrder" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Array Order
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [ngModel]="!options.caseSensitive" (change)="options.caseSensitive = !options.caseSensitive; recompare()">
        <span class="checkmark"></span>
        Case Insensitive
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.treatUndefinedAsNull" (change)="recompare()">
        <span class="checkmark"></span>
        Treat Undefined as Null
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreEmptyArrays" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Empty Arrays
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreEmptyObjects" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Empty Objects
      </label>
    </div>
    <div class="numeric-option">
      <label>Numeric Precision:</label>
      <input type="number" [(ngModel)]="options.numericPrecision" (change)="recompare()" min="0" max="10" class="precision-input">
      <small>(0 = exact match)</small>
    </div>
    <div class="depth-option">
      <label>Max Depth:</label>
      <input type="number" [(ngModel)]="options.maxDepth" (change)="recompare()" min="1" max="100" class="depth-input">
    </div>
  </div>

  <!-- No Differences Message -->
  <div *ngIf="differences.length === 0" class="no-differences">
    <div class="no-diff-content">
      <span class="no-diff-icon">✅</span>
      <h3>No Differences Found</h3>
      <p>Both JSON objects are identical!</p>
      <button (click)="createNewDifference()" class="btn btn--primary">
        🔍 Compare New JSON
      </button>
    </div>
  </div>

  <!-- Differences Navigation -->
  <div *ngIf="differences.length > 0" class="differences-navigation">
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
    <button (click)="createNewDifference()" class="btn btn--primary back-btn">
        ← Create New Difference
      </button>

  <!-- JSON Viewers -->
  <div *ngIf="differences.length > 0" class="comparison-container">
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
  `,
  styleUrls: ['./json-result.scss']
})
export class JsonResultsComponent implements OnInit, OnDestroy {
  leftJson: string = '';
  rightJson: string = '';
  leftJsonLines: JsonLine[] = [];
  rightJsonLines: JsonLine[] = [];
  differences: Difference[] = [];
  currentDiffIndex: number = 0;
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

  constructor(
    private router: Router,
    private jsonCompareService: JsonCompareService
  ) {}

  ngOnInit(): void {
    const data = this.jsonCompareService.getComparisonData();
    if (!data) {
      this.router.navigate(['/json-differ']);
      return;
    }

    this.leftJson = data.leftJson;
    this.rightJson = data.rightJson;
    this.options = { ...data.options };

    this.performComparison(data.leftObject, data.rightObject);
  }

  ngOnDestroy(): void {
    this.visited = new WeakSet();
  }

  private performComparison(leftObj: any, rightObj: any): void {
    this.differences = [];
    this.currentDiffIndex = 0;
    
    // Reset visited set for circular reference detection
    this.visited = new WeakSet();

    // Parse JSON into lines for display
    this.leftJsonLines = this.parseJsonToLines(this.leftJson);
    this.rightJsonLines = this.parseJsonToLines(this.rightJson);

    // Find differences
    this.findDifferences(leftObj, rightObj);

    // Highlight first difference
    if (this.differences.length > 0) {
      this.highlightDifference(this.currentDiffIndex);
    }
  }

  recompare(): void {
    try {
      const leftObj = this.leftJson.trim() ? JSON.parse(this.leftJson) : {};
      const rightObj = this.rightJson.trim() ? JSON.parse(this.rightJson) : {};
      this.performComparison(leftObj, rightObj);
    } catch (err) {
      console.error('Error during re-comparison:', err);
    }
  }

  createNewDifference(): void {
    this.router.navigate(['/json-differ']);
  }

  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
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
    if (depth > this.options.maxDepth) {
      return;
    }

    if (this.isObject(leftObj) && this.visited.has(leftObj)) {
      return;
    }
    if (this.isObject(leftObj)) {
      this.visited.add(leftObj);
    }

    const normalizedLeft = this.normalizeValue(leftObj);
    const normalizedRight = this.normalizeValue(rightObj);

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

    switch (leftType) {
      case 'null':
      case 'undefined':
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
        this.differences.push({
          description: `Element added at index ${i}`,
          type: 'added',
          path: elementPath,
          rightValue: rightArr[i]
        });
      } else if (i >= rightArr.length) {
        this.differences.push({
          description: `Element removed from index ${i}`,
          type: 'removed',
          path: elementPath,
          leftValue: leftArr[i]
        });
      } else {
        this.findDifferences(leftArr[i], rightArr[i], elementPath, depth + 1);
      }
    }
  }

  private compareArraysIgnoringOrder(leftArr: any[], rightArr: any[], path: string, depth: number): void {
    const leftUsed = new Set<number>();
    const rightUsed = new Set<number>();

    for (let i = 0; i < leftArr.length; i++) {
      for (let j = 0; j < rightArr.length; j++) {
        if (!rightUsed.has(j)) {
          const originalVisited = this.visited;
          this.visited = new WeakSet();
          
          const hasDifferences = this.hasDifferences(leftArr[i], rightArr[j], depth + 1);
          
          this.visited = originalVisited;

          if (!hasDifferences) {
            leftUsed.add(i);
            rightUsed.add(j);
            break;
          }
        }
      }
    }

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
    if (!this.isObject(leftObj) && !this.isObject(rightObj)) {
      return leftObj !== rightObj;
    }

    const tempDifferences: Difference[] = [];
    const originalDifferences = this.differences;
    
    this.differences = tempDifferences;
    this.findDifferences(leftObj, rightObj, '', depth);
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
        this.differences.push({
          description: `Property "${key}" added`,
          type: 'added',
          path: propertyPath,
          rightValue: rightObj[key]
        });
      } else if (!(key in rightObj)) {
        this.differences.push({
          description: `Property "${key}" removed`,
          type: 'removed',
          path: propertyPath,
          leftValue: leftObj[key]
        });
      } else {
        this.findDifferences(leftObj[key], rightObj[key], propertyPath, depth + 1);
      }
    }
  }

  private highlightDifference(index: number): void {
    this.leftJsonLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });
    this.rightJsonLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });

    const diff = this.differences[index];
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

  formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'object') return Array.isArray(value) ? '[...]' : '{...}';
    return String(value);
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}