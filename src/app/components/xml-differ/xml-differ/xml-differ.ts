import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { XmlUtilsService, XmlNode, XmlViewerStats } from '../../../services/xml-utils.service';

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
    <!-- <button (click)="validateBoth()" class="btn btn--secondary">
      ✅ Validate Both
    </button> -->
  </div>

  <!-- Raw XML Input Areas -->
  <div class="raw-xml-section">
    <div class="section-header">
      <h3>XML Input</h3>
      <div class="xml-stats">
        <span *ngIf="leftXmlLines.length > 0">Left: {{leftXmlLines.length}} lines</span>
        <span *ngIf="rightXmlLines.length > 0">Right: {{rightXmlLines.length}} lines</span>
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
            rows="12"
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
            rows="12"
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

  <!-- Loading & Error Display -->
  <div *ngIf="loading" class="loading-message">
    ⏳ Loading XML data...
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
        <input type="checkbox" [(ngModel)]="options.caseSensitive" [value]="false">
        <span class="checkmark"></span>
        Case Insensitive
      </label>
      <label class="option-checkbox">
        <input type="checkbox" [(ngModel)]="options.normalizeText">
        <span class="checkmark"></span>
        Normalize Text Content
      </label>
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

    <!-- XML Viewers -->
    <div class="comparison-container">
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

  <!-- No Results Message -->
  <div *ngIf="hasCompared && differences.length === 0" class="no-differences">
    <div class="no-diff-content">
      <span class="no-diff-icon">✅</span>
      <h3>No Differences Found</h3>
      <p>Both XML documents are identical!</p>
    </div>
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
  
  leftXmlLines: XmlLine[] = [];
  rightXmlLines: XmlLine[] = [];
  leftStats: XmlViewerStats | null = null;
  rightStats: XmlViewerStats | null = null;
  differences: Difference[] = [];
  currentDiffIndex: number = 0;
  
  error: string = '';
  loading: boolean = false;
  hasCompared: boolean = false;
  showOptionsPanel: boolean = false;

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
    private xmlUtils: XmlUtilsService
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
    } catch (err) {
      this.error = `Failed to load from URL: ${(err as Error).message}`;
    } finally {
      this.loading = false;
    }
  }

  compareXml(): void {
    try {
      this.error = '';
      this.differences = [];
      this.currentDiffIndex = 0;
      this.hasCompared = true;
      this.showOptionsPanel = false; // Hide options panel initially

      // Update stats for both XMLs
      this.updateLeftStats();
      this.updateRightStats();

      // Parse XML into lines for display
      this.leftXmlLines = this.parseXmlToLines(this.leftXml);
      this.rightXmlLines = this.parseXmlToLines(this.rightXml);

      // Find differences
      this.findDifferences();

      // Highlight first difference
      if (this.differences.length > 0) {
        this.highlightDifference(this.currentDiffIndex);
      }

    } catch (err) {
      this.error = 'Error comparing XML: ' + (err as Error).message;
    }
  }

  toggleOptionsPanel(): void {
    this.showOptionsPanel = !this.showOptionsPanel;
  }

  applyOptions(): void {
    // Re-run comparison with new options
    this.compareXml();
    // Keep the options panel open after re-comparing
    this.showOptionsPanel = true;
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

  private findDifferences(): void {
    const leftDoc = this.parseXmlToDocument(this.preprocessXml(this.leftXml));
    const rightDoc = this.parseXmlToDocument(this.preprocessXml(this.rightXml));

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
      // Only make element names and attribute names case insensitive, not values
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
      // Filter out comments and processing instructions if ignored
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
        // Element added in right
        const rightChild = rightChildren[i];
        this.differences.push({
          description: `Element added: <${this.getNodeName(rightChild)}>`,
          type: 'added',
          path: childPath,
          rightContent: rightChild.outerHTML
        });
      } else if (i >= rightChildren.length) {
        // Element removed from left
        const leftChild = leftChildren[i];
        this.differences.push({
          description: `Element removed: <${this.getNodeName(leftChild)}>`,
          type: 'removed',
          path: childPath,
          leftContent: leftChild.outerHTML
        });
      } else {
        // Compare elements at same position
        const leftChild = leftChildren[i];
        const rightChild = rightChildren[i];
        
        this.compareNodes(leftChild, rightChild, path);
      }
    }
  }

  private compareChildrenIgnoringOrder(leftChildren: Element[], rightChildren: Element[], path: string): void {
    const leftMap = this.createElementMap(leftChildren);
    const rightMap = this.createElementMap(rightChildren);

    // Find elements in right but not in left (added)
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

    // Find elements in left but not in right (removed)
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

    // Compare common elements
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
    // Reset all highlights
    this.leftXmlLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });
    this.rightXmlLines.forEach(line => {
      line.isHighlighted = false;
      line.diffType = undefined;
    });

    const diff = this.differences[index];
    
    // Find and highlight specific lines based on the difference content
    this.highlightSpecificLines(diff);
  }

  private highlightSpecificLines(diff: Difference): void {
    // Highlight based on the actual content that changed
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

    // If no specific content found, fall back to path-based highlighting
    if (!this.hasHighlightedLines()) {
      this.highlightByPath(diff);
    }
  }

  private lineContainsContent(lineContent: string, searchContent: string): boolean {
    const cleanLine = lineContent.toLowerCase().trim();
    const cleanSearch = searchContent.toLowerCase().trim();
    
    // For attributes
    if (cleanSearch.includes('="')) {
      return cleanLine.includes(cleanSearch);
    }
    
    // For element tags
    if (cleanSearch.startsWith('<') && cleanSearch.endsWith('>')) {
      return cleanLine.includes(cleanSearch);
    }
    
    // For text content
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

  clearAll(): void {
    this.leftXml = '';
    this.rightXml = '';
    this.leftFileName = '';
    this.rightFileName = '';
    this.leftUrl = '';
    this.rightUrl = '';
    this.leftXmlLines = [];
    this.rightXmlLines = [];
    this.leftStats = null;
    this.rightStats = null;
    this.differences = [];
    this.currentDiffIndex = 0;
    this.error = '';
    this.hasCompared = false;
    this.showOptionsPanel = false;
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
  }

  validateBoth(): void {
    const leftValid = this.leftXml.trim() ? this.xmlUtils.validateXml(this.leftXml) : { isValid: true };
    const rightValid = this.rightXml.trim() ? this.xmlUtils.validateXml(this.rightXml) : { isValid: true };
    
    if (leftValid.isValid && rightValid.isValid) {
      this.error = '✅ Both XML documents are valid!';
    } else {
      const errors = [];
      if (!leftValid.isValid) errors.push(`Left XML: ${leftValid.error}`);
      if (!rightValid.isValid) errors.push(`Right XML: ${rightValid.error}`);
      this.error = '❌ Validation errors: ' + errors.join('; ');
    }
    
    setTimeout(() => {
      if (this.error.includes('✅')) {
        this.error = '';
      }
    }, 5000);
  }

  swapXml(): void {
    [this.leftXml, this.rightXml] = [this.rightXml, this.leftXml];
    [this.leftFileName, this.rightFileName] = [this.rightFileName, this.leftFileName];
    [this.leftUrl, this.rightUrl] = [this.rightUrl, this.leftUrl];
    [this.leftStats, this.rightStats] = [this.rightStats, this.leftStats];
    if (this.differences.length > 0) {
      this.compareXml();
    }
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
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}