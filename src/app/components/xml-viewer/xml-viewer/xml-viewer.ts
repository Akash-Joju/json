import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { XmlUtilsService, XmlNode, XmlViewerStats } from '../../../services/xml-utils.service';
import { XmlNodeComponent } from '../../xml-node/xml-node/xml-node';
import { FileSizePipe } from '../../../pipes/file-size.pipe';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, XmlNodeComponent, FileSizePipe],
  template: `
    <div class="xml-viewer">
      <!-- Header Section -->
      <div class="viewer-header">
        <h2>XML Viewer</h2>
        <div class="header-actions">
          <button 
            class="btn btn-primary" 
            (click)="toggleExpandAll()"
            [disabled]="!xmlData || parsingError">
            {{ allExpanded ? 'Collapse All' : 'Expand All' }}
          </button>
          <button 
            class="btn btn-secondary" 
            (click)="copyToClipboard()"
            [disabled]="!xmlData || parsingError">
            Copy XML
          </button>
          <button 
            class="btn btn-outline" 
            (click)="downloadXml()"
            [disabled]="!xmlData || parsingError">
            Download
          </button>
        </div>
      </div>

      <!-- Input Methods Section -->
      <div class="input-methods">
        <div class="method-tabs">
          <button 
            class="method-tab" 
            [class.active]="activeInputMethod === 'manual'"
            (click)="setInputMethod('manual')">
            <span class="tab-icon">📝</span>
            <span class="tab-text">Manual Input</span>
          </button>
          <button 
            class="method-tab" 
            [class.active]="activeInputMethod === 'file'"
            (click)="setInputMethod('file')">
            <span class="tab-icon">📁</span>
            <span class="tab-text">Upload File</span>
          </button>
          <button 
            class="method-tab" 
            [class.active]="activeInputMethod === 'url'"
            (click)="setInputMethod('url')">
            <span class="tab-icon">🌐</span>
            <span class="tab-text">Load from URL</span>
          </button>
        </div>

        <!-- Manual Input -->
        <div class="method-content" *ngIf="activeInputMethod === 'manual'">
          <div class="input-section">
            <div class="input-header">
              <h3>XML Content</h3>
              <div class="input-actions">
                <button class="btn btn-sm" (click)="formatXml()" [disabled]="!xmlData">Format</button>
                <button class="btn btn-sm" (click)="clearXml()">Clear</button>
                <button class="btn btn-sm" (click)="loadSampleXml()">Load Sample</button>
              </div>
            </div>
            <textarea
              class="xml-input"
              [(ngModel)]="xmlInput"
              (ngModelChange)="onXmlInputChange()"
              placeholder="Paste your XML here or enter XML content..."
              rows="8"
              spellcheck="false">
            </textarea>
            <div class="input-info">
              <span class="char-count">{{ xmlInput?.length || 0 }} characters</span>
              <span class="error-count" *ngIf="parsingError">⚠️ Invalid XML</span>
              <span class="success-count" *ngIf="xmlData && !parsingError">✓ Valid XML</span>
            </div>
          </div>
        </div>

        <!-- File Upload -->
        <div class="method-content" *ngIf="activeInputMethod === 'file'">
          <div class="file-upload-section">
            <div class="upload-area" 
                 [class.dragover]="isDragOver"
                 (drop)="onFileDrop($event)"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)">
              <input 
                type="file" 
                #fileInput
                (change)="onFileSelected($event)"
                accept=".xml,application/xml,text/xml"
                class="file-input">
              
              <div class="upload-content" *ngIf="!selectedFile">
                <div class="upload-icon">📁</div>
                <h3>Upload XML File</h3>
                <p>Drag & drop your XML file here or click to browse</p>
                <button class="btn btn-primary" (click)="fileInput.click()">
                  Choose File
                </button>
                <p class="upload-hint">Supports .xml files up to 10MB</p>
              </div>

              <div class="file-info" *ngIf="selectedFile">
                <div class="file-icon">📄</div>
                <div class="file-details">
                  <h4>{{ selectedFile.name }}</h4>
                  <p>{{ selectedFile.size | fileSize }} • {{ selectedFile.type || 'Unknown type' }}</p>
                </div>
                <div class="file-actions">
                  <button class="btn btn-sm" (click)="loadFile()" [disabled]="fileLoading">
                    {{ fileLoading ? 'Loading...' : 'Load XML' }}
                  </button>
                  <button class="btn btn-sm btn-outline" (click)="clearFile()">Remove</button>
                </div>
              </div>
            </div>

            <div class="upload-error" *ngIf="fileError">
              <div class="error-icon">❌</div>
              <p>{{ fileError }}</p>
            </div>
          </div>
        </div>

        <!-- URL Load -->
        <div class="method-content" *ngIf="activeInputMethod === 'url'">
          <div class="url-load-section">
            <div class="url-input-group">
              <input
                type="url"
                [(ngModel)]="urlInput"
                placeholder="https://example.com/data.xml"
                class="url-input"
                [class.error]="urlError">
              <button 
                class="btn btn-primary" 
                (click)="loadFromUrl()"
                [disabled]="!urlInput || urlLoading">
                {{ urlLoading ? 'Loading...' : 'Load XML' }}
              </button>
            </div>
            
            <div class="url-examples">
              <p class="examples-title">Try these public XML URLs:</p>
              <div class="example-links">
                <a (click)="loadExampleUrl('https://www.w3schools.com/xml/note.xml')">Simple Note</a>
                <a (click)="loadExampleUrl('https://www.w3schools.com/xml/cd_catalog.xml')">CD Catalog</a>
                <a (click)="loadExampleUrl('https://www.w3schools.com/xml/plant_catalog.xml')">Plant Catalog</a>
              </div>
            </div>

            <div class="url-error" *ngIf="urlError">
              <div class="error-icon">❌</div>
              <p>{{ urlError }}</p>
            </div>

            <div class="url-success" *ngIf="urlSuccess">
              <div class="success-icon">✅</div>
              <p>XML loaded successfully from URL!</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Viewer Section -->
      <div class="viewer-section">
        <div class="section-header">
          <h3>Tree View</h3>
          <div class="view-stats" *ngIf="xmlData && !parsingError">
            <span class="stat">Nodes: {{ stats.totalNodes }}</span>
            <span class="stat">Depth: {{ stats.maxDepth }}</span>
            <span class="stat">Attributes: {{ stats.totalAttributes }}</span>
          </div>
        </div>

        <div class="viewer-content">
          <!-- Loading/Empty State -->
          <div *ngIf="!xmlData" class="empty-state">
            <div class="empty-icon">📄</div>
            <h4>No XML Data</h4>
            <p>Choose an input method above to load XML content.</p>
          </div>

          <!-- Error State -->
          <div *ngIf="xmlData && parsingError" class="error-state">
            <div class="error-icon">❌</div>
            <h4>XML Parsing Error</h4>
            <p class="error-message">{{ parsingError }}</p>
            <div class="error-actions">
              <button class="btn btn-primary" (click)="tryRepair()">Try Auto-Repair</button>
              <button class="btn btn-outline" (click)="clearXml()">Clear Input</button>
            </div>
          </div>

          <!-- XML Tree -->
          <div *ngIf="xmlData && !parsingError" class="xml-tree-container">
            <div class="tree-actions">
              <button class="btn btn-sm" (click)="expandToLevel(1)">Level 1</button>
              <button class="btn btn-sm" (click)="expandToLevel(2)">Level 2</button>
              <button class="btn btn-sm" (click)="expandToLevel(3)">Level 3</button>
              <button class="btn btn-sm" (click)="collapseAll()">Collapse All</button>
            </div>
            
            <div class="xml-tree">
              <div class="xml-node root-node" *ngIf="parsedNodes.length > 0">
                <div class="node-line" (click)="toggleNode(parsedNodes[0])">
                  <span class="toggle-icon" *ngIf="parsedNodes[0]?.hasChildren">
                    {{ parsedNodes[0]?.expanded ? '▼' : '►' }}
                  </span>
                  <span class="node-tag">
                    &lt;<span class="tag-name">{{ parsedNodes[0]?.name }}</span>
                    <span *ngIf="parsedNodes[0]?.attributes" class="attributes">
                      <span *ngFor="let attr of parsedNodes[0]?.attributes" class="attribute">
                        {{ attr.name }}="<span class="attribute-value">{{ attr.value }}</span>"
                      </span>
                    </span>
                    &gt;
                  </span>
                </div>
                
                <div *ngIf="parsedNodes[0]?.expanded" class="node-children">
                  <app-xml-node 
                    [nodes]="parsedNodes[0]?.children || []"
                    [depth]="1"
                    (nodeToggle)="onNodeToggle($event)">
                  </app-xml-node>
                </div>
                
                <div class="closing-tag">
                  &lt;/<span class="tag-name">{{ parsedNodes[0]?.name }}</span>&gt;
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./xml-viewer.scss']
})
export class XmlViewerComponent implements OnChanges {
  @Input() initialXml: string = '';

  // Input methods
  activeInputMethod: 'manual' | 'file' | 'url' = 'manual';
  xmlInput: string = '';
  
  // File upload
  selectedFile: File | null = null;
  fileLoading: boolean = false;
  fileError: string | null = null;
  isDragOver: boolean = false;
  
  // URL loading
  urlInput: string = '';
  urlLoading: boolean = false;
  urlError: string | null = null;
  urlSuccess: boolean = false;

  // XML data
  xmlData: string | null = null;
  parsedNodes: XmlNode[] = [];
  parsingError: string | null = null;
  allExpanded: boolean = false;
  stats: XmlViewerStats = {
    totalNodes: 0,
    maxDepth: 0,
    totalAttributes: 0,
    isValid: false
  };

  constructor(private xmlUtils: XmlUtilsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialXml'] && this.initialXml) {
      this.xmlInput = this.initialXml;
      this.parseXmlData();
    }
  }

  setInputMethod(method: 'manual' | 'file' | 'url'): void {
    this.activeInputMethod = method;
    this.clearErrors();
  }

  // Manual input methods
  onXmlInputChange(): void {
    this.parseXmlData();
  }

  private parseXmlData(): void {
    this.parsingError = null;
    this.parsedNodes = [];
    this.stats = {
      totalNodes: 0,
      maxDepth: 0,
      totalAttributes: 0,
      isValid: false
    };

    if (!this.xmlInput?.trim()) {
      this.xmlData = null;
      return;
    }

    this.xmlData = this.xmlInput.trim();
    const result = this.xmlUtils.parseXml(this.xmlData);
    this.parsedNodes = result.nodes;
    this.stats = result.stats;
    this.parsingError = result.error;
  }

  // File upload methods
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.fileError = null;
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      this.fileError = null;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  async loadFile(): Promise<void> {
    if (!this.selectedFile) return;

    this.fileLoading = true;
    this.fileError = null;

    const result = await this.xmlUtils.readXmlFromFile(this.selectedFile);
    
    this.fileLoading = false;

    if (result.error) {
      this.fileError = result.error;
      return;
    }

    this.xmlInput = result.content;
    this.parseXmlData();
    this.activeInputMethod = 'manual'; // Switch to manual view after loading
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = null;
  }

  // URL loading methods
  async loadFromUrl(): Promise<void> {
    if (!this.urlInput) return;

    this.urlLoading = true;
    this.urlError = null;
    this.urlSuccess = false;

    try {
      const result = await this.xmlUtils.loadXmlFromUrl(this.urlInput);
      
      this.urlLoading = false;

      if (result.error) {
        this.urlError = result.error;
        return;
      }

      this.xmlInput = result.content;
      this.parseXmlData();
      this.urlSuccess = true;
      this.activeInputMethod = 'manual'; // Switch to manual view after loading
    } catch (error) {
      this.urlLoading = false;
      this.urlError = 'Failed to load XML from URL';
    }
  }

  loadExampleUrl(url: string): void {
    this.urlInput = url;
    this.loadFromUrl();
  }

  // Common methods
  toggleNode(node: XmlNode): void {
    if (node.hasChildren) {
      node.expanded = !node.expanded;
    }
  }

  onNodeToggle(node: XmlNode): void {
    // Handle child node toggles
  }

  toggleExpandAll(): void {
    this.allExpanded = !this.allExpanded;
    this.xmlUtils.setAllNodesExpanded(this.parsedNodes, this.allExpanded);
  }

  expandToLevel(level: number): void {
    this.xmlUtils.setNodesExpandedToLevel(this.parsedNodes, level);
    this.allExpanded = level > 2;
  }

  collapseAll(): void {
    this.xmlUtils.setAllNodesExpanded(this.parsedNodes, false);
    this.allExpanded = false;
  }

  formatXml(): void {
    if (!this.xmlData) return;
    this.xmlInput = this.xmlUtils.formatXml(this.xmlData);
    this.parseXmlData();
  }

  clearXml(): void {
    this.xmlInput = '';
    this.xmlData = null;
    this.parsedNodes = [];
    this.parsingError = null;
    this.allExpanded = false;
    this.clearErrors();
  }

  tryRepair(): void {
    if (!this.xmlData) return;
    this.xmlInput = this.xmlUtils.tryRepairXml(this.xmlData);
    this.parseXmlData();
  }

  async copyToClipboard(): Promise<void> {
    if (!this.xmlData) return;
    
    try {
      await navigator.clipboard.writeText(this.xmlData);
      console.log('XML copied to clipboard');
    } catch (err) {
      console.error('Failed to copy XML: ', err);
    }
  }

  downloadXml(): void {
    if (!this.xmlData) return;
    this.xmlUtils.downloadXml(this.xmlData, 'document.xml');
  }

  loadSampleXml(): void {
    this.xmlInput = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Guide</title>
    <author>John Doe</author>
    <price currency="USD">29.99</price>
    <categories>
      <category>Programming</category>
      <category>Web</category>
    </categories>
  </book>
  <book id="2">
    <title>Advanced XML</title>
    <author>Jane Smith</author>
    <price currency="EUR">39.99</price>
    <categories>
      <category>Programming</category>
      <category>Advanced</category>
    </categories>
  </book>
</catalog>`;
    this.parseXmlData();
  }

  private clearErrors(): void {
    this.fileError = null;
    this.urlError = null;
    this.urlSuccess = false;
  }
}