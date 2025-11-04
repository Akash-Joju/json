import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  details?: string;
  leftContent?: string;
  rightContent?: string;
}

interface JsonLine {
  content: string;
  lineNumber: number;
  isHighlighted: boolean;
  diffType?: 'added' | 'removed' | 'modified';
  originalContent: string;
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
  imports: [CommonModule, FormsModule],
  template: `
<div class="json-results-container">
  <!-- Header with Back Button -->
  <div class="results-header">
    <div class="header-content">
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
    <div class="summary-item">
      <span class="summary-label">JSON 1 Lines:</span>
      <span class="summary-value">{{leftJsonLines.length}}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">JSON 2 Lines:</span>
      <span class="summary-value">{{rightJsonLines.length}}</span>
    </div>
    <div class="summary-item" [class.success]="differences.length === 0" [class.warning]="differences.length > 0">
      <span class="summary-label">Status:</span>
      <span class="summary-value" [class.success]="differences.length === 0" [class.warning]="differences.length > 0">
        {{differences.length === 0 ? 'Identical' : differences.length + ' differences'}}
      </span>
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
  <div *ngIf="differences.length === 0 && hasData" class="no-differences">
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
      <small class="diff-details" *ngIf="differences[currentDiffIndex]?.details">
        {{differences[currentDiffIndex]?.details}}
      </small>
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

  <button (click)="createNewDifference()" class="btn btn--blue">
    ← Create New Difference
  </button>

  <!-- JSON Viewers - Always show when we have data -->
  <div *ngIf="hasData" class="comparison-container">
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
  hasData: boolean = false;

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
  private lineToPathMap: Map<number, string[]> = new Map();

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
    this.hasData = !!(this.leftJson || this.rightJson);

    this.performComparison(data.leftObject, data.rightObject);
  }

  ngOnDestroy(): void {
    this.visited = new WeakSet();
    this.lineToPathMap.clear();
  }

  private performComparison(leftObj: any, rightObj: any): void {
    this.differences = [];
    this.currentDiffIndex = 0;
    this.lineToPathMap.clear();
    
    // Reset visited set for circular reference detection
    this.visited = new WeakSet();

    // Parse JSON into lines for display and build line-to-path mapping
    this.leftJsonLines = this.parseJsonToLines(this.leftJson, leftObj);
    this.rightJsonLines = this.parseJsonToLines(this.rightJson, rightObj);

    // Build line-to-path mapping for both JSONs
    this.buildLineToPathMapping(this.leftJsonLines, leftObj, 'left');
    this.buildLineToPathMapping(this.rightJsonLines, rightObj, 'right');

    // Find differences
    this.findDifferences(leftObj, rightObj);

    // Highlight first difference if there are differences
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

  private parseJsonToLines(jsonString: string, jsonObj: any): JsonLine[] {
    if (!jsonString.trim()) return [];
    
    const lines = jsonString.split('\n');
    return lines.map((content, index) => ({
      content: this.escapeHtml(content),
      lineNumber: index + 1,
      isHighlighted: false,
      originalContent: content
    }));
  }

  private buildLineToPathMapping(lines: JsonLine[], jsonObj: any, side: 'left' | 'right'): void {
    // This is a simplified approach - in a real implementation, you'd want to 
    // parse the JSON and map each line to its corresponding path
    // For now, we'll use a heuristic approach based on the content
    
    lines.forEach((line, index) => {
      const paths = this.extractPathsFromLine(line.originalContent, jsonObj);
      if (paths.length > 0) {
        this.lineToPathMap.set(this.getLineKey(side, index + 1), paths);
      }
    });
  }

  private getLineKey(side: 'left' | 'right', lineNumber: number): number {
    // Create a unique key for each line (left: positive, right: negative)
    return side === 'left' ? lineNumber : -lineNumber;
  }

  private extractPathsFromLine(lineContent: string, jsonObj: any): string[] {
    const paths: string[] = [];
    
    // Simple heuristic: look for property patterns like "property": value
    const propertyMatch = lineContent.match(/"([^"]+)"\s*:/);
    if (propertyMatch) {
      const propertyName = propertyMatch[1];
      paths.push(propertyName);
    }
    
    return paths;
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
    if (diff) {
      this.highlightLinesForDifference(diff);
    }
  }

  private highlightLinesForDifference(diff: Difference): void {
    const path = diff.path;
    
    // Find and highlight lines in both JSON viewers
    this.findAndHighlightLines(this.leftJsonLines, path, diff.type, 'left');
    this.findAndHighlightLines(this.rightJsonLines, path, diff.type, 'right');
  }

  private findAndHighlightLines(lines: JsonLine[], path: string, diffType: 'added' | 'removed' | 'modified', side: 'left' | 'right'): void {
    // Extract the property name from the path
    const pathParts = path.split('.');
    const lastPart = pathParts[pathParts.length - 1];
    
    // Clean the property name (remove array indices etc.)
    const propertyName = this.cleanPropertyName(lastPart);
    
    lines.forEach(line => {
      // Check if this line contains the property we're looking for
      if (this.lineContainsProperty(line.originalContent, propertyName, path)) {
        line.isHighlighted = true;
        line.diffType = diffType;
      }
    });
  }

  private cleanPropertyName(property: string): string {
    // Remove array indices and other non-property characters
    return property.replace(/\[\d+\]/g, '').replace(/\['([^']+)'\]/g, '.$1').replace(/\["([^"]+)"\]/g, '.$1');
  }

  private lineContainsProperty(lineContent: string, propertyName: string, fullPath: string): boolean {
    if (!lineContent || !propertyName) return false;

    // Create a more precise pattern to match the property
    // Look for patterns like: "propertyName": 
    const exactPattern = new RegExp(`"${this.escapeRegExp(propertyName)}"\\s*:`, 'i');
    
    // Also check for the property in context (for nested objects)
    const contextPattern = new RegExp(this.escapeRegExp(propertyName), 'i');
    
    // For root level properties or when we have simple matches
    if (exactPattern.test(lineContent)) {
      return true;
    }
    
    // For more complex cases, check if the line contains key parts of the full path
    const pathSegments = fullPath.split('.').filter(seg => seg && seg !== 'root');
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const cleanSegment = this.cleanPropertyName(lastSegment);
      if (lineContent.includes(`"${cleanSegment}"`)) {
        return true;
      }
    }
    
    return false;
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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