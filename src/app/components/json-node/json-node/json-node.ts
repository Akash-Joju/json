import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JsonNode } from '../../../services/json-utils.service';

@Component({
  selector: 'app-json-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="json-node" 
         [class.highlighted]="isNodeHighlighted" 
         [class.current-search]="isNodeCurrentSearch"
         [class.expanded]="node.expanded"
         [class.collapsed]="!node.expanded && hasChildren">
      
      <!-- Main Node Line -->
      <div class="node-line" (click)="toggle()" [style.padding-left.px]="getIndentation()">
        
        <!-- Toggle Button with Better Icons -->
        <div class="toggle-section" *ngIf="hasChildren">
          <button class="toggle-btn" [class.expanded]="node.expanded">
            <span class="toggle-icon">{{ node.expanded ? '▼' : '▶' }}</span>
          </button>
        </div>

        <div class="toggle-section placeholder" *ngIf="!hasChildren">
          <span class="leaf-spacer">•</span>
        </div>

        <!-- Type Icon -->
        <div class="type-icon" [class]="'type-' + node.type">
          <span class="icon">{{ getTypeIcon() }}</span>
        </div>

        <!-- Key Section -->
        <div class="key-section" *ngIf="node.key !== 'root'">
          <span class="key">{{ node.key }}</span>
          <span class="colon">:</span>
        </div>

        <!-- Value Display with Better Formatting -->
        <div class="value-section">
          <span class="value" [class]="'type-' + node.type">
            {{ getValueDisplay() }}
          </span>
          
          <!-- Array/Object Summary -->
          <span class="summary" *ngIf="hasChildren && !node.expanded">
            {{ getSummary() }}
          </span>
        </div>

        <!-- Quick Info Badge -->
        <div class="info-badge" *ngIf="showInfoBadge()">
          <span class="badge" [class]="'badge-' + node.type">
            {{ getInfoBadge() }}
          </span>
        </div>

        <!-- Search Highlight -->
        <div class="search-highlight" *ngIf="isSearchMatch()">
          <span class="search-indicator">🔍</span>
        </div>
      </div>
      
      <!-- Children Container with Smooth Transition -->
      <div class="children-container" [class.expanded]="node.expanded" *ngIf="hasChildren">
        <div class="children" *ngIf="node.expanded">
          <app-json-node 
            *ngFor="let child of node.children" 
            [node]="child" 
            [level]="level + 1"
            [isHighlighted]="isHighlighted"
            [isCurrentSearch]="isCurrentSearch"
            [searchTerm]="searchTerm"
            [currentSearchPath]="currentSearchPath">
          </app-json-node>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .json-node {
      font-family: 'SF Mono', 'Monaco', 'Consolas', 'Roboto Mono', monospace;
      font-size: 13px;
      line-height: 1.4;
      margin: 1px 0;
      transition: all 0.2s ease;
    }

    /* Highlight States */
    .json-node.highlighted .node-line {
      background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%) !important;
      border: 1px solid #ffd43b;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(255, 212, 59, 0.2);
    }

    .json-node.current-search .node-line {
      background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%) !important;
      border: 2px solid #28a745;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
      font-weight: 600;
    }

    /* Node Line */
    .node-line {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      border-radius: 4px;
      margin: 2px 0;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      min-height: 28px;
      
      &:hover {
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-color: #dee2e6;
        transform: translateX(2px);
      }
    }

    /* Toggle Section */
    .toggle-section {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      
      &.placeholder {
        opacity: 0.3;
      }
    }

    .toggle-btn {
      background: none;
      border: none;
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s ease;
      color: #6c757d;
      
      &:hover {
        // background: #007bff;
        color: white;
        transform: scale(1.1);
      }
      
      &.expanded {
        color: #007bff;
      }
    }

    .toggle-icon {
      font-size: 10px;
      font-weight: bold;
      transition: transform 0.2s ease;
    }

    .leaf-spacer {
      font-size: 8px;
      color: #dee2e6;
    }

    /* Type Icons */
    .type-icon {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      flex-shrink: 0;
      
      &.type-object {
        // background: #e3f2fd;
        color: #1976d2;
      }
      
      &.type-array {
        // background: #f3e5f5;
        color: #7b1fa2;
      }
      
      &.type-string {
        // background: #e8f5e8;
        color: #388e3c;
      }
      
      &.type-number {
        // background: #fff3e0;
        color: #f57c00;
      }
      
      &.type-boolean {
        // background: #e1f5fe;
        color: #0288d1;
      }
      
      &.type-null {
        // background: #f5f5f5;
        color: #757575;
      }
    }

    /* Key Section */
    .key-section {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .key {
      color: #881391;
      font-weight: 600;
      font-family: inherit;
    }

    .colon {
      color: #6c757d;
      font-weight: 500;
    }

    /* Value Section */
    .value-section {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0; /* Allow truncation */
    }

    .value {
      font-family: inherit;
      
      &.type-string {
        color: #c41a16;
        // background: #fff5f5;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid #ffcdd2;
      }
      
      &.type-number {
        color: #1c00cf;
        // background: #fff3e0;
        padding: 1px 4px;
        border-radius: 3px;
        border: 1px solid #ffe0b2;
        font-weight: 600;
      }
      
      &.type-boolean {
        color: #0d22aa;
        // background: #e3f2fd;
        padding: 1px 6px;
        border-radius: 10px;
        border: 1px solid #bbdefb;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
      }
      
      &.type-null {
        color: #757575;
        // background: #f5f5f5;
        padding: 1px 6px;
        border-radius: 10px;
        border: 1px solid #e0e0e0;
        font-style: italic;
        font-size: 11px;
      }
      
      &.type-object,
      &.type-array {
        color: #495057;
        font-style: italic;
      }
    }

    .summary {
      color: #6c757d;
      font-size: 11px;
      // background: #f8f9fa;
      padding: 1px 6px;
      border-radius: 8px;
      border: 1px solid #e9ecef;
      font-style: normal;
    }

    /* Info Badge */
    .info-badge {
      flex-shrink: 0;
    }

    .badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      
      &.badge-object {
        // background: #bbdefb;
        color: #0d47a1;
      }
      
      &.badge-array {
        // background: #e1bee7;
        color: #4a148c;
      }
      
      &.badge-string {
        // background: #c8e6c9;
        color: #1b5e20;
      }
      
      &.badge-number {
        // background: #ffe0b2;
        color: #e65100;
      }
      
      &.badge-boolean {
        // background: #b3e5fc;
        color: #01579b;
      }
      
      &.badge-null {
        // background: #eeeeee;
        color: #424242;
      }
    }

    /* Search Highlight */
    .search-highlight {
      flex-shrink: 0;
    }

    .search-indicator {
      font-size: 10px;
      color: #ff6b6b;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Children Container */
    .children-container {
      overflow: hidden;
      transition: max-height 0.3s ease;
      
      &.expanded {
        max-height: 5000px; /* Large enough to contain expanded content */
      }
      
      &:not(.expanded) {
        max-height: 0;
      }
    }

    .children {
      border-left: 2px solid #e9ecef;
      margin-left: 12px;
      padding-left: 8px;
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        left: -2px;
        top: 0;
        bottom: 0;
        width: 2px;
        //background: linear-gradient(to bottom, transparent 0%, #e9ecef 15%, #e9ecef 85%, transparent 100%);
      }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .json-node {
        font-size: 12px;
      }
      
      .node-line {
        padding: 4px 6px;
        gap: 4px;
      }
      
      .value {
        font-size: 11px;
      }
      
      .summary {
        font-size: 10px;
      }
      
      .badge {
        font-size: 9px;
        padding: 1px 4px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .json-node {
        .node-line:hover {
          //background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
          border-color: #718096;
        }
        
        .value.type-string {
         // background: #2d1c1c;
          border-color: #742a2a;
        }
        
        .value.type-number {
          //background: #332821;
          border-color: #8b5a2b;
        }
        
        .value.type-boolean {
          //background: #1a365d;
          border-color: #2b6cb0;
        }
        
        .value.type-null {
          //background: #2d3748;
          border-color: #718096;
        }
        
        .summary {
          //background: #2d3748;
          border-color: #4a5568;
          color: #a0aec0;
        }
      }
    }

    /* High contrast mode */
    @media (prefers-contrast: high) {
      .json-node {
        .node-line {
          border-width: 2px;
        }
        
        .value {
          border-width: 2px;
        }
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .json-node,
      .node-line,
      .toggle-btn,
      .children-container {
        transition: none;
      }
      
      .node-line:hover {
        transform: none;
      }
      
      .search-indicator {
        animation: none;
      }
    }
  `]
})
export class JsonNodeComponent implements OnChanges {
  @Input() node!: JsonNode;
  @Input() level: number = 0;
  @Input() isHighlighted: boolean = false;
  @Input() isCurrentSearch: boolean = false;
  @Input() searchTerm: string = '';
  @Input() currentSearchPath: string = '';

  isNodeHighlighted: boolean = false;
  isNodeCurrentSearch: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isHighlighted'] || changes['isCurrentSearch'] || changes['currentSearchPath']) {
      this.updateNodeState();
    }
  }

  private updateNodeState(): void {
    this.isNodeHighlighted = this.isHighlighted;
    
    if (this.currentSearchPath && this.node.path) {
      const normalizedCurrentPath = this.normalizePath(this.currentSearchPath);
      const normalizedNodePath = this.normalizePath(this.node.path);
      this.isNodeCurrentSearch = normalizedCurrentPath === normalizedNodePath;
    } else {
      this.isNodeCurrentSearch = this.isCurrentSearch;
    }
  }

  private normalizePath(path: string): string {
    if (!path) return '';
    
    let normalized = path.replace(/^root\./, '');
    normalized = normalized.replace(/\[(\d+)\]/g, '.$1');
    normalized = normalized.replace(/^\./, '');
    
    return normalized;
  }

  get hasChildren(): boolean {
    return !!this.node.children && this.node.children.length > 0;
  }

  getIndentation(): number {
    // Base indentation + level-based indentation
    return 8 + (this.level * 16);
  }

  toggle(): void {
    if (this.hasChildren) {
      this.node.expanded = !this.node.expanded;
    }
  }

  getTypeIcon(): string {
    switch (this.node.type) {
      case 'object': return '{ }';
      case 'array': return '[ ]';
      case 'string': return '""';
      case 'number': return '#';
      case 'boolean': return '✓';
      case 'null': return '∅';
      default: return '?';
    }
  }

  getValueDisplay(): string {
    switch (this.node.type) {
      case 'string':
        // Truncate long strings for better display
        const str = this.node.value as string;
        return str.length > 50 ? `"${str.substring(0, 47)}..."` : `"${str}"`;
      case 'null':
        return 'null';
      case 'object':
        return '{...}';
      case 'array':
        return `Array[${this.node.children?.length || 0}]`;
      default:
        return String(this.node.value);
    }
  }

  getSummary(): string {
    if (!this.hasChildren) return '';
    
    switch (this.node.type) {
      case 'object':
        const keys = this.node.children?.map(child => child.key) || [];
        return `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''} }`;
      case 'array':
        const items = this.node.children?.length || 0;
        const sample = this.node.children?.slice(0, 2).map(child => {
          if (child.type === 'string') return `"${child.value}"`;
          if (child.type === 'object') return '{...}';
          if (child.type === 'array') return '[...]';
          return child.value;
        }).join(', ') || '';
        return `[ ${sample}${items > 2 ? '...' : ''} ]`;
      default:
        return '';
    }
  }

  showInfoBadge(): boolean {
    return this.hasChildren && !this.node.expanded;
  }

  getInfoBadge(): string {
    if (!this.hasChildren) return '';
    
    const count = this.node.children?.length || 0;
    switch (this.node.type) {
      case 'object':
        return `${count} ${count === 1 ? 'key' : 'keys'}`;
      case 'array':
        return `${count} ${count === 1 ? 'item' : 'items'}`;
      default:
        return `${count} items`;
    }
  }

  isSearchMatch(): boolean {
    if (!this.searchTerm) return false;
    
    const searchLower = this.searchTerm.toLowerCase();
    
    // Check if key matches
    if (this.node.key?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if string value matches
    if (this.node.type === 'string' && 
        String(this.node.value).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check if other value matches
    if (this.node.value && 
        String(this.node.value).toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  }
}