import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { XmlUtilsService} from '../../../services/xml-utils.service';
import { XmlCompareService } from '../../../services/xml-compare/xml-compare.service';
import { XmlViewerStats } from '../../xml-types/xml-types';
import { ThemeService } from '../../../services/theme.service'; // ADD THIS
import { Subscription } from 'rxjs'; // ADD THIS

interface Difference {
  description: string;
  leftLine?: number;
  rightLine?: number;
  type: 'added' | 'removed' | 'modified';
  path: string;
  leftContent?: string;
  rightContent?: string;
  details?: string;
}

interface XmlLine {
  content: string;
  lineNumber: number;
  isHighlighted: boolean;
  diffType?: 'added' | 'removed' | 'modified';
  originalContent: string;
}

interface ComparisonOptions {
  ignoreWhitespace: boolean;
  ignoreComments: boolean;
  ignoreProcessingInstructions: boolean;
  ignoreElementOrder: boolean;
  caseSensitive: boolean;
  normalizeText: boolean;
}

@Component({
  selector: 'app-xml-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="xml-results-container" [class.dark-mode]="isDarkMode">
  <!-- Header with Theme Toggle -->
  <div class="page-header">
    <h2>XML Comparison Results</h2>
    <!-- <div class="theme-toggle">
      <button class="theme-toggle-btn" (click)="toggleTheme()" [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        {{ isDarkMode ? '☀️' : '🌙' }}
      </button>
    </div> -->
  </div>

  <!-- Summary Card -->
  <div class="summary-card">
    <div class="summary-item">
      <span class="summary-label">XML 1 Lines:</span>
      <span class="summary-value">{{leftXmlLines.length}}</span>
    </div>
    <div class="summary-item">
      <span class="summary-label">XML 2 Lines:</span>
      <span class="summary-value">{{rightXmlLines.length}}</span>
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
        <input type="checkbox" [(ngModel)]="options.ignoreWhitespace" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Whitespace
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreComments" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Comments
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreProcessingInstructions" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Processing Instructions
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.ignoreElementOrder" (change)="recompare()">
        <span class="checkmark"></span>
        Ignore Element Order
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [ngModel]="!options.caseSensitive" (change)="options.caseSensitive = !options.caseSensitive; recompare()">
        <span class="checkmark"></span>
        Case Insensitive
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.normalizeText" (change)="recompare()">
        <span class="checkmark"></span>
        Normalize Text Content
      </label>
    </div>
  </div>

  <!-- No Differences Message -->
  <div *ngIf="differences.length === 0" class="no-differences">
    <div class="no-diff-content">
      <span class="no-diff-icon">✅</span>
      <h3>No Differences Found</h3>
      <p>Both XML documents are identical!</p>
      <button (click)="createNewDifference()" class="btn btn--primary">
        🔍 Compare New XML
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
      <div class="diff-values" *ngIf="differences[currentDiffIndex]?.leftContent || differences[currentDiffIndex]?.rightContent">
        <span class="value-left" *ngIf="differences[currentDiffIndex]?.leftContent">
          Left: {{differences[currentDiffIndex]?.leftContent}}
        </span>
        <span class="value-right" *ngIf="differences[currentDiffIndex]?.rightContent">
          Right: {{differences[currentDiffIndex]?.rightContent}}
        </span>
      </div>
    </div>
  </div>

  <button (click)="createNewDifference()" class="btn btn--blue">
    ← Create New Difference
  </button>

  <!-- XML Viewers - Always show when we have data -->
  <div *ngIf="hasData" class="comparison-container">
    <!-- Left XML Viewer -->
    <div class="xml-section">
      <h3>XML 1 Viewer</h3>
      <div class="xml-viewer">
        <div class="xml-lines">
          <div 
            *ngFor="let line of leftXmlLines" 
            class="xml-line"
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

    <!-- Right XML Viewer -->
    <div class="xml-section">
      <h3>XML 2 Viewer</h3>
      <div class="xml-viewer">
        <div class="xml-lines">
          <div 
            *ngFor="let line of rightXmlLines" 
            class="xml-line"
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
  styleUrls: ['./xml-result.scss']
})
export class XmlResultsComponent implements OnInit, OnDestroy {
  leftXml: string = '';
  rightXml: string = '';
  leftXmlLines: XmlLine[] = [];
  rightXmlLines: XmlLine[] = [];
  differences: Difference[] = [];
  currentDiffIndex: number = 0;
  showOptionsPanel: boolean = false;
  hasData: boolean = false;

  // Theme management - UPDATED
  isDarkMode: boolean = false;
  private themeSubscription!: Subscription;

  options: ComparisonOptions = {
    ignoreWhitespace: true,
    ignoreComments: true,
    ignoreProcessingInstructions: true,
    ignoreElementOrder: false,
    caseSensitive: false,
    normalizeText: true
  };

  constructor(
    private router: Router,
    private xmlUtils: XmlUtilsService,
    private xmlCompareService: XmlCompareService,
    private themeService: ThemeService // ADD THIS
  ) {
    // Use the synchronous method to get initial theme - UPDATED
    this.isDarkMode = this.themeService.getCurrentThemeValue() === 'dark';
  }

  ngOnInit(): void {
    // Subscribe to theme changes from the global theme service - ADD THIS
    this.themeSubscription = this.themeService.getCurrentTheme().subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });

    const data = this.xmlCompareService.getComparisonData();
    if (!data) {
      this.router.navigate(['/xml-differ']);
      return;
    }

    this.leftXml = data.leftXml;
    this.rightXml = data.rightXml;
    this.options = { ...data.options };
    this.hasData = !!(this.leftXml || this.rightXml);

    this.performComparison(data.leftDoc, data.rightDoc);
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

  private performComparison(leftDoc: Document | null, rightDoc: Document | null): void {
    this.differences = [];
    this.currentDiffIndex = 0;

    // Parse XML into lines for display
    this.leftXmlLines = this.parseXmlToLines(this.leftXml);
    this.rightXmlLines = this.parseXmlToLines(this.rightXml);

    // Find differences
    this.findDifferences(leftDoc, rightDoc);

    // Highlight first difference if there are differences
    if (this.differences.length > 0) {
      this.highlightDifference(this.currentDiffIndex);
    }
  }

  recompare(): void {
    try {
      const leftDoc = this.parseXmlToDocument(this.preprocessXml(this.leftXml));
      const rightDoc = this.parseXmlToDocument(this.preprocessXml(this.rightXml));
      this.performComparison(leftDoc, rightDoc);
    } catch (err) {
      console.error('Error during re-comparison:', err);
    }
  }

  createNewDifference(): void {
    this.router.navigate(['/xml-differ']);
  }

  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
  }

  private parseXmlToLines(xmlString: string): XmlLine[] {
    if (!xmlString.trim()) return [];
    
    const formatted = this.xmlUtils.formatXml(xmlString);
    const lines = formatted.split('\n');
    return lines.map((content, index) => ({
      content: this.escapeHtml(content),
      lineNumber: index + 1,
      isHighlighted: false,
      originalContent: content.trim()
    }));
  }

  private findDifferences(leftDoc: Document | null, rightDoc: Document | null): void {
    if (!leftDoc && !rightDoc) return;
    
    if (!leftDoc && rightDoc) {
      this.differences.push({
        description: 'XML 2 added (XML 1 is empty)',
        type: 'added',
        path: 'root'
      });
      return;
    }
    
    if (leftDoc && !rightDoc) {
      this.differences.push({
        description: 'XML 1 removed (XML 2 is empty)',
        type: 'removed',
        path: 'root'
      });
      return;
    }

    if (leftDoc && rightDoc) {
      this.compareNodes(leftDoc.documentElement, rightDoc.documentElement, '');
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

  private compareNodes(leftNode: Element, rightNode: Element, path: string): void {
    const currentPath = path ? `${path}/${this.getNodeName(leftNode)}` : this.getNodeName(leftNode);

    // Compare node names
    if (this.getNodeName(leftNode) !== this.getNodeName(rightNode)) {
      this.differences.push({
        description: `Element name changed from "${this.getNodeName(leftNode)}" to "${this.getNodeName(rightNode)}"`,
        type: 'modified',
        path: currentPath
      });
      return;
    }

    // Compare attributes
    this.compareAttributes(leftNode, rightNode, currentPath);

    // Compare text content
    const leftText = this.getNormalizedTextContent(leftNode);
    const rightText = this.getNormalizedTextContent(rightNode);
    
    if (leftText !== rightText) {
      this.differences.push({
        description: `Text content changed from "${this.truncateText(leftText)}" to "${this.truncateText(rightText)}"`,
        type: 'modified',
        path: `${currentPath}/text()`,
        leftContent: leftText,
        rightContent: rightText
      });
    }

    // Compare child nodes
    this.compareChildNodes(leftNode, rightNode, currentPath);
  }

  private getNodeName(node: Element): string {
    return this.options.caseSensitive ? node.nodeName : node.nodeName.toLowerCase();
  }

  private getNormalizedTextContent(node: Element): string {
    let text = '';
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent) {
        let content = child.textContent;
        if (this.options.normalizeText) {
          content = content.replace(/\s+/g, ' ').trim();
        }
        if (this.options.ignoreWhitespace) {
          content = content.trim();
        }
        if (content) {
          text += content + ' ';
        }
      }
    }
    return text.trim();
  }

  private compareChildNodes(leftNode: Element, rightNode: Element, path: string): void {
    const leftChildren = this.getChildElements(leftNode);
    const rightChildren = this.getChildElements(rightNode);

    if (this.options.ignoreElementOrder) {
      this.compareChildrenIgnoringOrder(leftChildren, rightChildren, path);
    } else {
      this.compareChildrenWithOrder(leftChildren, rightChildren, path);
    }
  }

  private getChildElements(node: Element): Element[] {
    return Array.from(node.children).filter(child => {
      if (this.options.ignoreComments && child.nodeType === Node.COMMENT_NODE) {
        return false;
      }
      return child.nodeType === Node.ELEMENT_NODE;
    }) as Element[];
  }

  private compareChildrenWithOrder(leftChildren: Element[], rightChildren: Element[], path: string): void {
    const maxLength = Math.max(leftChildren.length, rightChildren.length);
    
    for (let i = 0; i < maxLength; i++) {
      const childPath = `${path}[${i + 1}]`;
      
      if (i >= leftChildren.length) {
        const rightChild = rightChildren[i];
        this.differences.push({
          description: `Element added: <${this.getNodeName(rightChild)}>`,
          type: 'added',
          path: childPath,
          rightContent: rightChild.outerHTML
        });
      } else if (i >= rightChildren.length) {
        const leftChild = leftChildren[i];
        this.differences.push({
          description: `Element removed: <${this.getNodeName(leftChild)}>`,
          type: 'removed',
          path: childPath,
          leftContent: leftChild.outerHTML
        });
      } else {
        const leftChild = leftChildren[i];
        const rightChild = rightChildren[i];
        
        this.compareNodes(leftChild, rightChild, path);
      }
    }
  }

  private compareChildrenIgnoringOrder(leftChildren: Element[], rightChildren: Element[], path: string): void {
    const leftMap = this.createElementMap(leftChildren);
    const rightMap = this.createElementMap(rightChildren);

    for (const [key, rightChild] of rightMap.entries()) {
      if (!leftMap.has(key)) {
        this.differences.push({
          description: `Element added: <${this.getNodeName(rightChild)}>`,
          type: 'added',
          path: `${path}/${this.getNodeName(rightChild)}`,
          rightContent: rightChild.outerHTML
        });
      }
    }

    for (const [key, leftChild] of leftMap.entries()) {
      if (!rightMap.has(key)) {
        this.differences.push({
          description: `Element removed: <${this.getNodeName(leftChild)}>`,
          type: 'removed',
          path: `${path}/${this.getNodeName(leftChild)}`,
          leftContent: leftChild.outerHTML
        });
      }
    }

    for (const [key, leftChild] of leftMap.entries()) {
      const rightChild = rightMap.get(key);
      if (rightChild) {
        this.compareNodes(leftChild, rightChild, path);
      }
    }
  }

  private createElementMap(elements: Element[]): Map<string, Element> {
    const map = new Map<string, Element>();
    elements.forEach((element, index) => {
      const key = this.getElementKey(element, index);
      map.set(key, element);
    });
    return map;
  }

  private getElementKey(element: Element, index: number): string {
    if (this.options.ignoreElementOrder) {
      const attrs = Array.from(element.attributes)
        .map(attr => `${this.options.caseSensitive ? attr.name : attr.name.toLowerCase()}="${attr.value}"`)
        .sort()
        .join(' ');
      return `${this.getNodeName(element)}[${attrs}]`;
    } else {
      return `${this.getNodeName(element)}[${index}]`;
    }
  }

  private compareAttributes(leftNode: Element, rightNode: Element, path: string): void {
    const leftAttrs = this.getNormalizedAttributes(leftNode);
    const rightAttrs = this.getNormalizedAttributes(rightNode);

    const allAttrNames = new Set([
      ...Object.keys(leftAttrs),
      ...Object.keys(rightAttrs)
    ]);

    for (const attrName of allAttrNames) {
      const leftValue = leftAttrs[attrName];
      const rightValue = rightAttrs[attrName];
      const attrPath = `${path}/@${attrName}`;

      if (leftValue === undefined && rightValue !== undefined) {
        this.differences.push({
          description: `Attribute added: ${attrName}="${rightValue}"`,
          type: 'added',
          path: attrPath,
          rightContent: `${attrName}="${rightValue}"`
        });
      } else if (leftValue !== undefined && rightValue === undefined) {
        this.differences.push({
          description: `Attribute removed: ${attrName}="${leftValue}"`,
          type: 'removed',
          path: attrPath,
          leftContent: `${attrName}="${leftValue}"`
        });
      } else if (leftValue !== rightValue) {
        this.differences.push({
          description: `Attribute changed: ${attrName} from "${leftValue}" to "${rightValue}"`,
          type: 'modified',
          path: attrPath,
          leftContent: `${attrName}="${leftValue}"`,
          rightContent: `${attrName}="${rightValue}"`
        });
      }
    }
  }

  private getNormalizedAttributes(node: Element): { [key: string]: string } {
    const attrs: { [key: string]: string } = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      const name = this.options.caseSensitive ? attr.name : attr.name.toLowerCase();
      let value = attr.value;
      
      if (this.options.normalizeText) {
        value = value.replace(/\s+/g, ' ').trim();
      }
      if (this.options.ignoreWhitespace) {
        value = value.trim();
      }
      
      attrs[name] = value;
    }
    return attrs;
  }

  private truncateText(text: string, maxLength: number = 50): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private highlightDifference(index: number): void {
    this.leftXmlLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });
    this.rightXmlLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });

    const diff = this.differences[index];
    this.highlightSpecificLines(diff);
  }

  private highlightSpecificLines(diff: Difference): void {
    if (diff.leftContent) {
      this.leftXmlLines.forEach(line => {
        if (this.lineContainsContent(line.originalContent, diff.leftContent!)) {
          line.isHighlighted = true;
          line.diffType = diff.type;
        }
      });
    }

    if (diff.rightContent) {
      this.rightXmlLines.forEach(line => {
        if (this.lineContainsContent(line.originalContent, diff.rightContent!)) {
          line.isHighlighted = true;
          line.diffType = diff.type;
        }
      });
    }

    if (!this.hasHighlightedLines()) {
      this.highlightByPath(diff);
    }
  }

  private lineContainsContent(lineContent: string, searchContent: string): boolean {
    const cleanLine = lineContent.toLowerCase().trim();
    const cleanSearch = searchContent.toLowerCase().trim();
    
    if (cleanSearch.includes('="')) {
      return cleanLine.includes(cleanSearch);
    }
    
    if (cleanSearch.startsWith('<') && cleanSearch.endsWith('>')) {
      return cleanLine.includes(cleanSearch);
    }
    
    return cleanLine.includes(cleanSearch);
  }

  private hasHighlightedLines(): boolean {
    return this.leftXmlLines.some(line => line.isHighlighted) || 
           this.rightXmlLines.some(line => line.isHighlighted);
  }

  private highlightByPath(diff: Difference): void {
    const pathParts = diff.path.split('/').filter(part => part && !part.includes('text()'));
    
    this.leftXmlLines.forEach(line => {
      if (this.lineMatchesPath(line.originalContent, pathParts)) {
        line.isHighlighted = true;
        line.diffType = diff.type;
      }
    });

    this.rightXmlLines.forEach(line => {
      if (this.lineMatchesPath(line.originalContent, pathParts)) {
        line.isHighlighted = true;
        line.diffType = diff.type;
      }
    });
  }

  private lineMatchesPath(lineContent: string, pathParts: string[]): boolean {
    return pathParts.some(part => {
      const cleanPart = part.replace('@', '').replace(/\[\d+\]/g, '').toLowerCase();
      const cleanLine = lineContent.toLowerCase();
      return cleanLine.includes(cleanPart);
    });
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

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}