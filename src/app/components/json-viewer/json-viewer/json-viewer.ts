import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JsonUtilsService, JsonNode, SearchResult } from '../../../services/json-utils.service';
import { JsonNodeComponent } from '../../json-node/json-node/json-node';

@Component({
  selector: 'app-json-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonNodeComponent],
  template: `
    <div class="json-viewer-container">
      <!-- Header -->
      <div class="page-header">
        <h1>🔍 JSON Viewer</h1>
        <p>Paste, validate, and visualize your JSON data</p>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Left Panel - Input Only -->
        <section class="left-panel">
          <div class="input-section">
            <div class="section-header">
              <h2>Input JSON</h2>
              <div class="actions">
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
            </div>

            <!-- File Upload Section -->
            <div class="file-upload-section">
              <h3>Upload JSON File</h3>
              <div class="file-input-container">
                <input 
                  type="file" 
                  #fileInput
                  (change)="onFileInputChange($event)"
                  accept=".json,application/json"
                  class="file-input"
                  hidden
                >
                <button 
                  type="button"
                  (click)="fileInput.click()"
                  class="upload-btn">
                  📁 Choose JSON File
                </button>
                <span class="file-hint">Max 5MB, .json files only</span>
              </div>
            </div>

            <!-- URL Loader Section -->
            <div class="url-loader-section">
              <h3>Load from URL</h3>
              <div class="url-input-container">
                <input
                  type="url"
                  [(ngModel)]="urlInput"
                  placeholder="https://example.com/data.json"
                  class="url-input"
                  [disabled]="isLoading"
                >
                <button
                  (click)="loadFromUrl()"
                  [disabled]="!urlInput.trim() || isLoading"
                  class="load-url-btn">
                  {{ isLoading ? '⏳ Loading...' : '🌐 Load URL' }}
                </button>
              </div>

              <!-- Quick sample URLs -->
              <div class="sample-urls">
                <span class="sample-label">Try sample data:</span>
                <button (click)="loadSampleUrl('users')" class="sample-btn">👥 Users</button>
                <button (click)="loadSampleUrl('posts')" class="sample-btn">📝 Posts</button>
                <button (click)="loadSampleUrl('todos')" class="sample-btn">✅ Todos</button>
              </div>
            </div>

            <textarea
              [(ngModel)]="jsonInput"
              (input)="onJsonInputChange()"
              placeholder='Paste your JSON here... Example: {"name": "John", "age": 30, "hobbies": ["reading", "gaming"]}'
              class="json-textarea"
              [class.error]="!isValid && jsonInput.trim() !== ''"
              spellcheck="false">
            </textarea>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="error-message">
              <span class="error-icon">❌</span>
              {{ errorMessage }}
            </div>

            <!-- Validation Status -->
            <div *ngIf="jsonInput.trim() !== ''" class="validation-status">
              <span [class]="isValid ? 'valid' : 'invalid'">
                {{ isValid ? '✅ Valid JSON' : '❌ Invalid JSON' }}
              </span>
            </div>
          </div>
        </section>

        <!-- Right Panel - Search, Context, and Tree -->
        <section class="right-panel">
          <!-- Search Section -->
          <div class="search-section" *ngIf="isValid && jsonTree.length > 0">
            <div class="search-container">
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
                    {{ searchResults.length }} result(s) found
                  </span>
                  <span class="current-position" *ngIf="searchResults.length > 1">
                    ({{ currentSearchIndex + 1 }} of {{ searchResults.length }})
                  </span>
                </div>
                <div class="navigation-buttons" *ngIf="searchResults.length > 1">
                  <button 
                    (click)="previousResult()" 
                    [disabled]="currentSearchIndex === 0"
                    class="nav-btn prev-btn">
                    ◀ Previous
                  </button>
                  <button 
                    (click)="nextResult()" 
                    [disabled]="currentSearchIndex === searchResults.length - 1"
                    class="nav-btn next-btn">
                    Next ▶
                  </button>
                </div>
              </div>

              <!-- Current Search Info -->
              <div class="current-search-info" *ngIf="currentSearchResult">
                <div class="search-match-type">
                  <span class="match-badge key-match" *ngIf="currentSearchResult.matchesKey">
                    Key Match
                  </span>
                  <span class="match-badge value-match" *ngIf="currentSearchResult.matchesValue">
                    Value Match
                  </span>
                </div>
                <div class="search-path">
                  Path: <code>{{ currentSearchResult.fullPath }}</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Context Section -->
          <div class="search-context-section" *ngIf="currentSearchResult && searchContextTree.length > 0">
            <div class="section-header">
              <h2>Search Result Context</h2>
              <div class="context-info">
                <span class="context-badge">{{ getContextType() }}</span>
                <span class="context-path">Path: {{ getParentPath() }}</span>
              </div>
            </div>
            
            <div class="context-container">
              <div class="context-tree">
                <app-json-node 
                  *ngFor="let node of searchContextTree" 
                  [node]="node"
                  [level]="0"
                  [searchTerm]="searchTerm"
                  [currentSearchPath]="currentSearchResult?.path || ''">
                </app-json-node>
              </div>
            </div>
          </div>

          <!-- Tree View Section -->
          <div class="tree-view-section">
            <div class="section-header">
              <h2>JSON Tree View</h2>
              <div class="view-actions">
                <button 
                  (click)="expandAll()" 
                  [disabled]="!isValid || jsonTree.length === 0"
                  class="btn btn-expand">
                  📂 Expand All
                </button>
                <button 
                  (click)="collapseAll()" 
                  [disabled]="!isValid || jsonTree.length === 0"
                  class="btn btn-collapse">
                  📁 Collapse All
                </button>
              </div>
            </div>

            <!-- Tree View -->
            <div class="tree-container" *ngIf="isValid && jsonTree.length > 0">
              <app-json-node 
                *ngFor="let node of jsonTree" 
                [node]="node"
                [level]="0"
                [isHighlighted]="isNodeHighlighted(node)"
                [isCurrentSearch]="isCurrentSearchNode(node)"
                [searchTerm]="searchTerm"
                [currentSearchPath]="currentSearchResult?.path || ''">
              </app-json-node>
            </div>

            <!-- Empty State -->
            <div *ngIf="!jsonInput.trim()" class="empty-state">
              <div class="empty-icon">📄</div>
              <h3>No JSON Data</h3>
              <p>Enter JSON in the left panel to get started</p>
            </div>

            <!-- Invalid State -->
            <div *ngIf="!isValid && jsonInput.trim() !== ''" class="invalid-state">
              <div class="invalid-icon">⚠️</div>
              <h3>Invalid JSON</h3>
              <p>Please fix the errors in your JSON to view the tree structure</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styleUrls: ['./json-viewer.scss']
})
export class JsonViewerComponent {
  jsonInput: string = '';
  isValid: boolean = true;
  errorMessage: string = '';
  jsonTree: JsonNode[] = [];
  searchContextTree: JsonNode[] = [];
  
  // New properties for file upload
  urlInput: string = '';
  isLoading: boolean = false;
  
  // Enhanced search properties
  searchTerm: string = '';
  searchResults: SearchResult[] = [];
  currentSearchIndex: number = -1;
  currentSearchResult: SearchResult | null = null;
  highlightedPaths: Set<string> = new Set();

  constructor(private jsonUtils: JsonUtilsService) {}

  // When JSON input changes
  onJsonInputChange(): void {
    this.errorMessage = '';
    this.clearSearch();
    
    if (!this.jsonInput.trim()) {
      this.isValid = true;
      this.jsonTree = [];
      this.searchContextTree = [];
      return;
    }

    const validation = this.jsonUtils.validateJson(this.jsonInput);
    this.isValid = validation.isValid;

    if (!this.isValid) {
      this.errorMessage = validation.error || 'Invalid JSON format';
      this.jsonTree = [];
      this.searchContextTree = [];
      return;
    }

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
      this.searchContextTree = [];
    } catch (error) {
      this.jsonTree = [];
      this.searchContextTree = [];
    }
  }

  // Copy to clipboard
  copyToClipboard(): void {
    try {
      const formattedJson = this.jsonUtils.formatJson(this.jsonInput);
      navigator.clipboard.writeText(formattedJson).then(() => {
        // You can add a toast notification here later
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
    this.isValid = true;
    this.errorMessage = '';
    this.jsonTree = [];
    this.searchContextTree = [];
    this.clearSearch();
  }

  // Expand all nodes
  expandAll(): void {
    this.setAllExpanded(true);
  }

  // Collapse all nodes
  collapseAll(): void {
    this.setAllExpanded(false);
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

  // File upload methods
  onFileInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Check file type
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        this.errorMessage = 'Please select a JSON file';
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 5MB';
        return;
      }

      this.jsonUtils.readJsonFile(file).then(
        (content) => {
          this.jsonInput = content;
          this.onJsonInputChange();
          // Reset file input
          input.value = '';
        },
        (error) => {
          this.errorMessage = error.message;
        }
      );
    }
  }

  // URL loader methods
  async loadFromUrl() {
    if (!this.urlInput.trim()) {
      this.errorMessage = 'Please enter a URL';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const jsonData = await this.jsonUtils.loadJsonFromUrl(this.urlInput);
      this.jsonInput = jsonData;
      this.onJsonInputChange();
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  loadSampleUrl(type: string) {
    const sampleUrls = {
      users: 'https://jsonplaceholder.typicode.com/users',
      posts: 'https://jsonplaceholder.typicode.com/posts',
      todos: 'https://jsonplaceholder.typicode.com/todos'
    };

    this.urlInput = sampleUrls[type as keyof typeof sampleUrls];
    this.loadFromUrl();
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
        this.currentSearchIndex = 0;
        this.navigateToSearchResult(this.currentSearchIndex);
      } else {
        this.currentSearchIndex = -1;
        this.currentSearchResult = null;
        this.searchContextTree = [];
        this.highlightedPaths.clear();
      }
    } catch (error) {
      this.searchResults = [];
      this.currentSearchIndex = -1;
      this.currentSearchResult = null;
      this.searchContextTree = [];
      this.highlightedPaths.clear();
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.currentSearchResult = null;
    this.searchContextTree = [];
    this.highlightedPaths.clear();
  }

  // Navigation methods
  nextResult() {
    if (this.currentSearchIndex < this.searchResults.length - 1) {
      this.currentSearchIndex++;
      this.navigateToSearchResult(this.currentSearchIndex);
    }
  }

  previousResult() {
    if (this.currentSearchIndex > 0) {
      this.currentSearchIndex--;
      this.navigateToSearchResult(this.currentSearchIndex);
    }
  }

  private navigateToSearchResult(index: number) {
    this.currentSearchResult = this.searchResults[index];
    
    // Expand the path to show the result in full tree
    this.jsonUtils.expandPath(this.jsonTree, this.currentSearchResult.path);
    
    // Update highlighted paths for all search results
    this.highlightedPaths.clear();
    this.searchResults.forEach(result => {
      this.highlightedPaths.add(result.path);
    });

    // Build search context tree (show parent object/array)
    this.buildSearchContextTree();
  }

  private buildSearchContextTree() {
    if (!this.currentSearchResult) {
      this.searchContextTree = [];
      return;
    }

    try {
      const jsonData = JSON.parse(this.jsonInput);
      const parentObject = this.jsonUtils.getParentObjectForSearch(jsonData, this.currentSearchResult);
      
      if (parentObject) {
        // Create a tree showing the parent object with the search result
        this.searchContextTree = this.jsonUtils.jsonToTree(parentObject);
        
        // Auto-expand the context tree
        this.setContextTreeExpanded(this.searchContextTree, true);
      } else {
        // If no parent found, show the result itself
        const resultObject = { [this.currentSearchResult.key]: this.currentSearchResult.value };
        this.searchContextTree = this.jsonUtils.jsonToTree(resultObject);
      }
    } catch (error) {
      this.searchContextTree = [];
    }
  }

  private setContextTreeExpanded(nodes: JsonNode[], expanded: boolean): void {
    const setExpanded = (nodes: JsonNode[]): void => {
      nodes.forEach(node => {
        node.expanded = expanded;
        if (node.children) {
          setExpanded(node.children);
        }
      });
    };
    
    setExpanded(this.searchContextTree);
  }

  getContextType(): string {
    if (!this.currentSearchResult || this.searchContextTree.length === 0) {
      return 'None';
    }

    const firstNode = this.searchContextTree[0];
    if (firstNode.type === 'array') {
      return 'Array';
    } else if (firstNode.type === 'object') {
      return 'Object';
    } else {
      return 'Value';
    }
  }

  getParentPath(): string {
    if (!this.currentSearchResult) {
      return '';
    }

    const pathParts = this.currentSearchResult.path.split('.');
    if (pathParts.length > 1) {
      return pathParts.slice(0, -1).join('.');
    }
    return 'root';
  }

  isNodeHighlighted(node: JsonNode): boolean {
    return this.highlightedPaths.has(node.path);
  }

  isCurrentSearchNode(node: JsonNode): boolean {
    return this.currentSearchResult?.path === node.path;
  }
}