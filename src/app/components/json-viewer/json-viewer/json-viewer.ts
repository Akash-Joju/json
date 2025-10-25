import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JsonUtilsService, JsonNode, SearchResult } from '../../../services/json-utils.service';
import { JsonNodeComponent } from '../../json-node/json-node/json-node';
import { FileSizePipe } from '../../../pipes/file-size.pipe';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonNodeComponent, FileSizePipe],
  template: `
    <div class="json-viewer-container">
      <!-- Header -->
      <div class="page-header">
        <h1>🔍 JSON Viewer</h1>
        <p>Paste, validate, and visualize your JSON data</p>
      </div>

      <!-- Main Content Area -->
      <div class="main-content-area">
        <!-- Left Panel - Input and Tree View -->
        <section class="viewer-panel">
          <!-- Sticky Controls Header -->
          <div class="sticky-controls-header">
            <div class="viewer-controls">
              <div class="mode-switcher">
                <button 
                  class="mode-btn" 
                  [class.active]="currentMode === 'input'"
                  (click)="switchMode('input')">
                  📝 Edit
                </button>
                <button 
                  class="mode-btn viewer-btn"
                  [class.active]="currentMode === 'tree'"
                  [disabled]="!isValid || !jsonInput.trim()"
                  (click)="switchMode('tree')">
                  🌳 Viewer
                </button>
              </div>
              
              <div class="action-buttons" *ngIf="currentMode === 'input'">
                <button 
                  (click)="formatJson()" 
                  [disabled]="!isValid || !jsonInput.trim()"
                  class="btn btn-format">
                  🔧 Format
                </button>
                <button 
                  (click)="minifyJson()" 
                  [disabled]="!isValid || !jsonInput.trim()"
                  class="btn btn-minify">
                  📏 Minify
                </button>
                <button 
                  (click)="copyToClipboard()" 
                  [disabled]="!isValid || !jsonInput.trim()"
                  class="btn btn-copy">
                  📋 Copy
                </button>
                <button 
                  (click)="clearAll()" 
                  class="btn btn-clear">
                  🗑️ Clear
                </button>
              </div>

              <div class="tree-controls" *ngIf="currentMode === 'tree' && isValid && jsonTree.length > 0">
                <button 
                  (click)="expandAll()" 
                  class="btn btn-expand">
                  ➕ Expand All
                </button>
                <button 
                  (click)="collapseAll()" 
                  class="btn btn-collapse">
                  ➖ Collapse All
                </button>

                <!-- Search in Tree Mode -->
                <div class="tree-search" *ngIf="isValid && jsonTree.length > 0">
                  <div class="search-input-container">
                    <input
                      type="text"
                      [(ngModel)]="searchTerm"
                      (input)="onSearch()"
                      placeholder="Search keys or values..."
                      class="search-input"
                    >
                    <button
                      (click)="clearSearch()"
                      *ngIf="searchTerm"
                      class="clear-search-btn"
                      title="Clear search">
                      ✕
                    </button>
                  </div>
                  
                  <!-- Search Results Navigation -->
                  <div class="search-navigation" *ngIf="searchResults.length > 0">
                    <div class="results-info">
                      <span class="results-count">
                        {{ getGroupedSearchResults().length }} object(s) found
                      </span>
                      <span class="current-position" *ngIf="getGroupedSearchResults().length > 1">
                        ({{ currentGroupIndex + 1 }} of {{ getGroupedSearchResults().length }})
                      </span>
                    </div>
                    <div class="navigation-buttons" *ngIf="getGroupedSearchResults().length > 1">
                      <button 
                        (click)="previousGroup()" 
                        [disabled]="currentGroupIndex === 0"
                        class="nav-btn prev-btn">
                        ◀
                      </button>
                      <button 
                        (click)="nextGroup()" 
                        [disabled]="currentGroupIndex === getGroupedSearchResults().length - 1"
                        class="nav-btn next-btn">
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="content-area">
            <!-- Input Methods Section with Tabs -->
            <div class="input-methods" *ngIf="currentMode === 'input'">
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
                    <h3>JSON Content</h3>
                    <div class="input-actions">
                      <button class="btn btn-sm" (click)="loadSampleJson()">Load Sample</button>
                    </div>
                  </div>
                  
                  <!-- Quick View Button -->
                  <div class="quick-view-container">
                    <button 
                      class="quick-view-btn"
                      [disabled]="!isValid || !jsonInput.trim()"
                      (click)="switchToTreeView()">
                      🌳 Quick View
                    </button>
                    <span class="quick-view-hint" *ngIf="!isValid || !jsonInput.trim()">
                      Enter valid JSON to enable tree view
                    </span>
                  </div>

                  <!-- FIXED: Textarea with full width -->
                  <div class="textarea-container">
                    <textarea
                      class="json-textarea"
                      [(ngModel)]="jsonInput"
                      (ngModelChange)="onJsonInputChange()"
                      placeholder='Paste your JSON here... Example: {"name": "John", "age": 30, "hobbies": ["reading", "gaming"]}'
                      spellcheck="false"
                      [class.error]="!isValid && jsonInput.trim() !== ''">
                    </textarea>
                  </div>

                  <div class="input-info">
                    <span class="char-count">{{ jsonInput?.length || 0 }} characters</span>
                    <span class="error-count" *ngIf="!isValid && jsonInput.trim() !== ''">⚠️ Invalid JSON</span>
                    <span class="success-count" *ngIf="isValid && jsonInput.trim() !== ''">✓ Valid JSON</span>
                  </div>

                  <!-- Error Message -->
                  <div *ngIf="errorMessage" class="error-message">
                    <span class="error-icon">❌</span>
                    {{ errorMessage }}
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
                      accept=".json,application/json"
                      class="file-input">
                    
                    <div class="upload-content" *ngIf="!selectedFile">
                      <div class="upload-icon">📁</div>
                      <h3>Upload JSON File</h3>
                      <p>Drag & drop your JSON file here or click to browse</p>
                      <button class="btn btn-primary" (click)="fileInput.click()">
                        Choose File
                      </button>
                      <p class="upload-hint">Supports .json files up to 5MB</p>
                    </div>

                    <div class="file-info" *ngIf="selectedFile">
                      <div class="file-icon">📄</div>
                      <div class="file-details">
                        <h4>{{ selectedFile.name }}</h4>
                        <p>{{ selectedFile.size | fileSize }} • {{ selectedFile.type || 'Unknown type' }}</p>
                      </div>
                      <div class="file-actions">
                        <button class="btn btn-sm" (click)="loadFile()" [disabled]="fileLoading">
                          {{ fileLoading ? 'Loading...' : 'Load JSON' }}
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
                      placeholder="https://example.com/data.json"
                      class="url-input"
                      [class.error]="urlError"
                      [disabled]="urlLoading">
                    <button 
                      class="btn btn-primary" 
                      (click)="loadFromUrl()"
                      [disabled]="!urlInput || urlLoading">
                      {{ urlLoading ? 'Loading...' : 'Load JSON' }}
                    </button>
                  </div>
                  
                  <div class="url-examples">
                    <p class="examples-title">Try these sample JSON URLs:</p>
                    <div class="example-links">
                      <a *ngFor="let exampleUrl of workingExamples" 
                         (click)="loadExampleUrl(exampleUrl)">
                         {{ getUrlDisplayName(exampleUrl) }}
                      </a>
                    </div>
                  </div>

                  <div class="url-status" *ngIf="urlLoading">
                    <div class="loading-spinner"></div>
                    <p>Loading JSON from URL... (this may take a few seconds)</p>
                  </div>

                  <div class="url-error" *ngIf="urlError">
                    <div class="error-icon">❌</div>
                    <p class="error-message">{{ urlError }}</p>
                  </div>

                  <div class="url-success" *ngIf="urlSuccess">
                    <div class="success-icon">✅</div>
                    <p>JSON loaded successfully from URL!</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- View Area (for Tree Mode) -->
            <div class="view-area" *ngIf="currentMode === 'tree'">
              <div class="tree-mode">
                <div #treeContainer class="tree-container">
                  <app-json-node 
                    *ngFor="let node of jsonTree" 
                    [node]="node"
                    [level]="0"
                    [isHighlighted]="isNodeHighlighted(node)"
                    [isCurrentSearch]="isCurrentSearchNode(node)"
                    [searchTerm]="searchTerm"
                    [currentSearchPath]="currentSearchResult?.path || ''">
                  </app-json-node>

                  <!-- Empty State -->
                  <div *ngIf="!jsonInput.trim()" class="empty-state">
                    <div class="empty-icon">📄</div>
                    <h3>No JSON Data</h3>
                    <p>Switch to Edit mode and enter JSON to get started</p>
                  </div>

                  <!-- Invalid State -->
                  <div *ngIf="!isValid && jsonInput.trim() !== ''" class="invalid-state">
                    <div class="invalid-icon">⚠️</div>
                    <h3>Invalid JSON</h3>
                    <p>Please fix the errors in your JSON to view the tree structure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Right Panel - Search Results (Only in Tree Mode) -->
        <section class="search-results-panel" *ngIf="currentMode === 'tree' && searchResults.length > 0">
          <!-- Sticky Search Results Header -->
          <div class="sticky-search-header">
            <div class="search-results-header">
              <h3>Search Results</h3>
              <span class="results-count">{{ getGroupedSearchResults().length }} objects</span>
            </div>
          </div>
          
          <div class="search-results-container">
            <div class="results-table" *ngIf="getCurrentGroup() as parent">
              <div class="parent-header">
                {{ parent.parentName }}
                <span class="match-type" *ngIf="parent.matchType === 'object'">(Object)</span>
                <span class="match-type" *ngIf="parent.matchType === 'array'">(Array)</span>
                <span class="match-type" *ngIf="parent.matchType === 'key'">(Property)</span>
                <span class="match-type" *ngIf="parent.matchType === 'array-item'">(Array Item)</span>
              </div>
              <div class="table-header">
                <div class="header-name">Name</div>
                <div class="header-value">Value</div>
              </div>
              
              <div class="table-body">
                <div 
                  *ngFor="let result of parent.results"
                  class="result-row"
                  [class.highlighted-match]="result.isMatch"
                  (click)="selectSearchResult(result.originalIndex)">
                  
                  <div class="result-name">
                    <span class="name-text">{{ result.key }}</span>
                    <span class="match-badge" *ngIf="result.isMatch">🔍</span>
                    <span class="array-badge" *ngIf="result.isArrayItem">📋</span>
                  </div>
                  
                  <div class="result-value" [class.object-value]="result.isObject">
                    {{ result.displayValue }}
                  </div>
                </div>
              </div>
            </div>

            <!-- No results message -->
            <div *ngIf="getGroupedSearchResults().length === 0" class="no-results">
              <div class="no-results-icon">🔍</div>
              <h4>No matching objects found</h4>
              <p>Try a different search term</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./json-viewer.scss']
})
export class JsonViewerComponent {
  @ViewChild('treeContainer') treeContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Input methods
  activeInputMethod: 'manual' | 'file' | 'url' = 'manual';
  
  // JSON data
  jsonInput: string = '';
  isValid: boolean = true;
  errorMessage: string = '';
  jsonTree: JsonNode[] = [];
  
  // Mode management
  currentMode: 'input' | 'tree' = 'input';
  
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
  workingExamples: string[] = [
    'https://jsonplaceholder.typicode.com/users',
    'https://jsonplaceholder.typicode.com/posts', 
    'https://jsonplaceholder.typicode.com/todos'
  ];
  
  // Search functionality
  searchTerm: string = '';
  searchResults: SearchResult[] = [];
  currentSearchIndex: number = -1;
  currentGroupIndex: number = 0;
  currentSearchResult: SearchResult | null = null;
  highlightedNodePath: string = '';

  constructor(
    private jsonUtils: JsonUtilsService,
    private cdRef: ChangeDetectorRef
  ) {}

  // Input method management
  setInputMethod(method: 'manual' | 'file' | 'url'): void {
    this.activeInputMethod = method;
    this.clearErrors();
  }

  // NEW METHOD: Switch to tree view from input area
  switchToTreeView(): void {
    if (this.isValid && this.jsonInput.trim()) {
      this.switchMode('tree');
    }
  }

  // Mode switching
  switchMode(mode: 'input' | 'tree'): void {
    if (mode === 'tree' && (!this.isValid || !this.jsonInput.trim())) {
      return;
    }
    
    this.currentMode = mode;
    
    if (mode === 'tree') {
      this.buildTree();
      // Initially collapse all nodes
      this.collapseAll();
    }
  }

  // When JSON input changes
  onJsonInputChange(): void {
    this.errorMessage = '';
    this.clearSearch();
    
    if (!this.jsonInput.trim()) {
      this.isValid = true;
      this.jsonTree = [];
      return;
    }

    const validation = this.jsonUtils.validateJson(this.jsonInput);
    this.isValid = validation.isValid;

    if (!this.isValid) {
      this.errorMessage = validation.error || 'Invalid JSON format';
      this.jsonTree = [];
      return;
    }

    // Auto-build tree but don't switch mode
    this.buildTree();
  }

  // Format the JSON
  formatJson(): void {
    try {
      this.jsonInput = this.jsonUtils.formatJson(this.jsonInput);
      this.buildTree();
    } catch (error) {
      this.errorMessage = (error as Error).message;
    }
  }

  // Minify the JSON
  minifyJson(): void {
    try {
      this.jsonInput = this.jsonUtils.minifyJson(this.jsonInput);
      this.buildTree();
    } catch (error) {
      this.errorMessage = (error as Error).message;
    }
  }

  // Build the tree structure
  buildTree(): void {
    try {
      const parsedJson = JSON.parse(this.jsonInput);
      this.jsonTree = this.jsonUtils.jsonToTree(parsedJson);
    } catch (error) {
      this.jsonTree = [];
    }
  }

  // Copy to clipboard
  copyToClipboard(): void {
    try {
      const formattedJson = this.jsonUtils.formatJson(this.jsonInput);
      navigator.clipboard.writeText(formattedJson).then(() => {
        console.log('JSON copied to clipboard!');
      });
    } catch (error) {
      this.errorMessage = 'Failed to copy to clipboard';
    }
  }

  // Clear everything
  clearAll(): void {
    this.jsonInput = '';
    this.urlInput = '';
    this.selectedFile = null;
    this.isValid = true;
    this.errorMessage = '';
    this.jsonTree = [];
    this.clearSearch();
    this.clearErrors();
    this.currentMode = 'input';
    this.activeInputMethod = 'manual';
  }

  // Expand all nodes
  expandAll(): void {
    this.setAllExpanded(true);
    this.cdRef.detectChanges();
  }

  // Collapse all nodes
  collapseAll(): void {
    this.setAllExpanded(false);
    this.cdRef.detectChanges();
  }

  // Helper method to expand/collapse all nodes
  private setAllExpanded(expanded: boolean): void {
    const setExpanded = (nodes: JsonNode[]): void => {
      nodes.forEach(node => {
        if (node.children) {
          node.expanded = expanded;
          setExpanded(node.children);
        }
      });
    };
    
    setExpanded(this.jsonTree);
  }

  // NEW: File upload methods with drag & drop
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

    try {
      const content = await this.jsonUtils.readJsonFile(this.selectedFile);
      this.jsonInput = content;
      this.onJsonInputChange();
      this.activeInputMethod = 'manual';
    } catch (error: any) {
      this.fileError = error.message || 'Failed to load file';
    } finally {
      this.fileLoading = false;
    }
  }

  clearFile(): void {
    this.selectedFile = null;
    this.fileError = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // NEW: URL loading methods with improved UI
  async loadFromUrl(): Promise<void> {
    if (!this.urlInput?.trim()) {
      this.urlError = 'Please enter a URL';
      return;
    }

    this.urlLoading = true;
    this.urlError = null;
    this.urlSuccess = false;

    try {
      const jsonData = await this.jsonUtils.loadJsonFromUrl(this.urlInput);
      this.jsonInput = jsonData;
      this.onJsonInputChange();
      this.urlSuccess = true;
      this.activeInputMethod = 'manual';
    } catch (error: any) {
      this.urlError = error.message || 'Failed to load from URL';
    } finally {
      this.urlLoading = false;
    }
  }

  loadExampleUrl(url: string): void {
    this.urlInput = url;
    this.loadFromUrl();
  }

  getUrlDisplayName(url: string): string {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname.split('/').pop() || 'data';
    return `${hostname} - ${pathname}`;
  }

  loadSampleJson(): void {
    this.jsonInput = `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipcode": "10001"
      },
      "hobbies": ["reading", "gaming", "coding"]
    },
    {
      "id": 2,
      "name": "Jane Smith", 
      "email": "jane@example.com",
      "address": {
        "street": "456 Oak Ave",
        "city": "Los Angeles", 
        "zipcode": "90210"
      },
      "hobbies": ["painting", "traveling"]
    }
  ]
}`;
    this.onJsonInputChange();
  }

  // Enhanced Search methods
  onSearch() {
    if (!this.searchTerm.trim()) {
      this.clearSearch();
      return;
    }

    try {
      const jsonData = JSON.parse(this.jsonInput);
      this.searchResults = this.jsonUtils.searchInJson(jsonData, this.searchTerm);
      
      if (this.searchResults.length > 0) {
        this.currentGroupIndex = 0;
        this.currentSearchIndex = 0;
        this.navigateToSearchResult(this.currentSearchIndex);
      } else {
        this.currentSearchIndex = -1;
        this.currentGroupIndex = 0;
        this.currentSearchResult = null;
        this.highlightedNodePath = '';
      }
    } catch (error) {
      this.searchResults = [];
      this.currentSearchIndex = -1;
      this.currentGroupIndex = 0;
      this.currentSearchResult = null;
      this.highlightedNodePath = '';
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.currentGroupIndex = 0;
    this.currentSearchResult = null;
    this.highlightedNodePath = '';
  }

  // Group Navigation methods
  nextGroup() {
    const groups = this.getGroupedSearchResults();
    if (this.currentGroupIndex < groups.length - 1) {
      this.currentGroupIndex++;
      const currentGroup = groups[this.currentGroupIndex];
      if (currentGroup.results.length > 0) {
        const firstMatch = currentGroup.results.find((r: { isMatch: any; }) => r.isMatch);
        if (firstMatch) {
          this.selectSearchResult(firstMatch.originalIndex);
        } else {
          this.selectSearchResult(currentGroup.results[0].originalIndex);
        }
      }
    }
  }

  previousGroup() {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
      const currentGroup = this.getGroupedSearchResults()[this.currentGroupIndex];
      if (currentGroup.results.length > 0) {
        const firstMatch = currentGroup.results.find((r: { isMatch: any; }) => r.isMatch);
        if (firstMatch) {
          this.selectSearchResult(firstMatch.originalIndex);
        } else {
          this.selectSearchResult(currentGroup.results[0].originalIndex);
        }
      }
    }
  }

  // Individual result navigation
  selectSearchResult(index: number) {
    if (index >= 0 && index < this.searchResults.length) {
      this.navigateToSearchResult(index);
    }
  }

  navigateToSearchResult(index: number) {
    if (index < 0 || index >= this.searchResults.length) return;
    
    this.currentSearchIndex = index;
    this.currentSearchResult = this.searchResults[index];
    this.highlightedNodePath = this.currentSearchResult.path;
    
    this.updateGroupIndexForResult(index);
    this.expandToPath(this.currentSearchResult.path);
    this.scrollToHighlightedNode();
    
    this.cdRef.detectChanges();
  }

  private updateGroupIndexForResult(resultIndex: number) {
    const groups = this.getGroupedSearchResults();
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      if (group.results.some((r: { originalIndex: number; }) => r.originalIndex === resultIndex)) {
        this.currentGroupIndex = i;
        break;
      }
    }
  }

  // Expand tree to show the specific path
  private expandToPath(searchPath: string) {
    if (!searchPath) return;
    
    setTimeout(() => {
      const treePath = this.convertSearchPathToTreePath(searchPath);
      if (!treePath) return;
      
      const pathParts = this.splitTreePath(treePath);
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length; i++) {
        currentPath = currentPath ? `${currentPath}.${pathParts[i]}` : pathParts[i];
        
        const expandNode = (nodes: JsonNode[]): boolean => {
          for (const node of nodes) {
            if (node.path === currentPath) {
              node.expanded = true;
              this.cdRef.detectChanges();
              return true;
            }
            if (node.children && node.children.length > 0) {
              const found = expandNode(node.children);
              if (found) {
                node.expanded = true;
                this.cdRef.detectChanges();
                return true;
              }
            }
          }
          return false;
        };
        
        expandNode(this.jsonTree);
      }
    }, 200);
  }

  private convertSearchPathToTreePath(searchPath: string): string {
    if (!searchPath) return '';
    
    if (searchPath.startsWith('root')) {
      return searchPath;
    }
    
    const jsonData = JSON.parse(this.jsonInput);
    
    if (Array.isArray(jsonData)) {
      for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        const valueAtPath = this.getObjectByPath(item, searchPath);
        if (valueAtPath !== undefined && valueAtPath !== null) {
          return `root[${i}].${searchPath}`;
        }
      }
    }
    
    return `root.${searchPath}`;
  }

  private splitTreePath(path: string): string[] {
    const parts: string[] = [];
    let currentPart = '';
    let inArray = false;
    
    for (let i = 0; i < path.length; i++) {
      const char = path[i];
      
      if (char === '[') {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
        inArray = true;
        currentPart += char;
      } else if (char === ']') {
        currentPart += char;
        parts.push(currentPart);
        currentPart = '';
        inArray = false;
      } else if (char === '.' && !inArray) {
        if (currentPart) {
          parts.push(currentPart);
          currentPart = '';
        }
      } else {
        currentPart += char;
      }
    }
    
    if (currentPart) {
      parts.push(currentPart);
    }
    
    return parts;
  }

  private scrollToHighlightedNode() {
    setTimeout(() => {
      const highlightedElement = document.querySelector('.json-node.current-search');
      if (highlightedElement && this.treeContainer) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);
  }

  // Enhanced Group search results by parent object with array support
  getGroupedSearchResults(): any[] {
    const grouped = new Map<string, any>();
    
    this.searchResults.forEach((result, index) => {
      // Determine the display path based on whether it's an array item or not
      let displayPath: string;
      let matchType: 'object' | 'array' | 'key' | 'array-item';
      
      // Check if this is an array item
      if (result.isArrayItem && result.arrayParentPath) {
        // For array items, group by the parent array
        displayPath = result.arrayParentPath;
        matchType = 'array-item';
      } else {
        // For non-array items, use the existing logic
        const matchedObject = this.getObjectByPath(JSON.parse(this.jsonInput), result.path);
        const isObjectMatch = matchedObject && typeof matchedObject === 'object' && result.matchesKey;
        
        if (isObjectMatch) {
          displayPath = result.path;
          matchType = Array.isArray(matchedObject) ? 'array' : 'object';
        } else {
          displayPath = this.getImmediateParentPath(result.path);
          const parentObject = this.getObjectByPath(JSON.parse(this.jsonInput), displayPath);
          matchType = Array.isArray(parentObject) ? 'array' : 'object';
        }
      }
      
      const displayObject = this.getObjectByPath(JSON.parse(this.jsonInput), displayPath);
      
      if (!grouped.has(displayPath)) {
        grouped.set(displayPath, {
          parentName: this.getParentDisplayName(displayPath),
          parentPath: displayPath,
          matchType: matchType,
          results: []
        });
      }
      
      const group = grouped.get(displayPath)!;
      
      // Clear results to avoid duplicates when multiple matches in same parent
      if (group.results.length === 0 && displayObject) {
        if (Array.isArray(displayObject)) {
          // For arrays, show all items
          displayObject.forEach((item, itemIndex) => {
            const isObject = typeof item === 'object' && item !== null;
            const isMatch = result.arrayIndex === itemIndex;
            
            group.results.push({
              key: `[${itemIndex}]`,
              displayValue: isObject ? '--' : this.getDisplayValue(item),
              isObject: isObject,
              isMatch: isMatch,
              isArrayItem: true,
              originalIndex: index
            });
          });
        } else if (typeof displayObject === 'object' && !Array.isArray(displayObject)) {
          // Add ALL properties of the display object
          Object.keys(displayObject).forEach(key => {
            const value = displayObject[key];
            const isObject = typeof value === 'object' && value !== null;
            const isArray = Array.isArray(value);
            
            // Check if this property is the matched one
            let isMatch = false;
            if (matchType === 'object' || matchType === 'array') {
              // For object/array matches, the entire object is considered a match
              isMatch = true;
            } else {
              // For key matches, check if this specific key matches
              isMatch = result.key === key;
            }
            
            group.results.push({
              key: key,
              displayValue: isObject || isArray ? '--' : this.getDisplayValue(value),
              isObject: isObject || isArray,
              isMatch: isMatch,
              originalIndex: index
            });
          });
        }
      }
    });
    
    return Array.from(grouped.values());
  }

  getCurrentGroup(): any {
    const groups = this.getGroupedSearchResults();
    return groups.length > 0 ? groups[this.currentGroupIndex] : null;
  }

  private getImmediateParentPath(path: string): string {
    const arrayMatch = path.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      return arrayMatch[1];
    }
    
    const parts = path.split('.');
    if (parts.length <= 1) return '';
    return parts.slice(0, -1).join('.');
  }

  private getParentDisplayName(parentPath: string): string {
    if (!parentPath) return 'Root Object';
    
    const arrayMatch = parentPath.match(/\[(\d+)\]$/);
    if (arrayMatch) {
      return `Item ${arrayMatch[1]}`;
    }
    
    const parts = parentPath.split('.');
    return parts[parts.length - 1] || 'Root';
  }

  private getDisplayValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    return String(value);
  }

  private getObjectByPath(obj: any, path: string): any {
    if (!path) return obj;
    
    const arrayMatch = path.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const arrayPath = arrayMatch[1];
      const index = parseInt(arrayMatch[2]);
      const array = this.getObjectByPath(obj, arrayPath);
      return Array.isArray(array) ? array[index] : null;
    }
    
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return null;
      }
    }
    
    return current;
  }

  isNodeHighlighted(node: JsonNode): boolean {
    return this.searchResults.some(result => {
      const searchTreePath = this.convertSearchPathToTreePath(result.path);
      return searchTreePath === node.path;
    });
  }

  isCurrentSearchNode(node: JsonNode): boolean {
    if (!this.highlightedNodePath) return false;
    const highlightedTreePath = this.convertSearchPathToTreePath(this.highlightedNodePath);
    return highlightedTreePath === node.path;
  }

  private clearErrors(): void {
    this.fileError = null;
    this.urlError = null;
    this.urlSuccess = false;
    this.errorMessage = '';
  }
}