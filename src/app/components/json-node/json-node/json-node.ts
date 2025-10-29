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
        
        <!-- Toggle Button with + and - -->
        <div class="toggle-section" *ngIf="hasChildren">
          <span class="toggle-icon">{{ node.expanded ? '-' : '+' }}</span>
        </div>

        <div class="toggle-section placeholder" *ngIf="!hasChildren">
          <span class="leaf-spacer"></span>
        </div>

        <!-- Type Square -->
        <div class="type-square" [class]="'type-' + node.type"></div>

        <!-- Key Section -->
        <div class="key-section" *ngIf="node.key !== 'root'">
          <span class="key">{{ node.key }}</span>
          <span class="colon">:</span>
        </div>

        <!-- Value Display -->
        <div class="value-section">
          <span class="value" [class]="'type-' + node.type" [title]="getTooltip()">
            {{ getValueDisplay() }}
          </span>
        </div>

        <!-- Info Badge -->
        <div class="info-badge" *ngIf="showInfoBadge()">
          <span class="badge" [class]="'badge-' + node.type">
            {{ getInfoBadge() }}
          </span>
        </div>
      </div>
      
      <!-- Children Container -->
      <div class="children-container" *ngIf="hasChildren">
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
      font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
      font-size: 0.75rem;
      line-height: 1.1;
      margin: 0;
    }

    /* Highlight States */
    .json-node.highlighted .node-line {
      background: #fff3cd !important;
    }

    .json-node.current-search .node-line {
      background: #d4edda !important;
      font-weight: 600;
    }

    /* Node Line */
    .node-line {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      padding: 1px 2px;
      cursor: pointer;
      border: 1px solid transparent;
      min-height: 16px;
      margin: 0;
      
      &:hover {
        background: #f8f9fa;
      }
    }

    /* Toggle Section */
    .toggle-section {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      width: 10px;
      height: 10px;
      flex-shrink: 0;
      margin-top: 1px;
      
      &.placeholder {
        opacity: 0;
      }
    }

    .toggle-icon {
      font-size: 0.6rem;
      color: #6c757d;
      font-weight: bold;
      width: 8px;
      height: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .leaf-spacer {
      width: 8px;
      height: 8px;
    }

    /* Type Square */
    .type-square {
      width: 8px;
      height: 8px;
      flex-shrink: 0;
      border-radius: 1px;
      margin-top: 1px;
      
      &.type-object {
        background: #1976d2;
      }
      
      &.type-array {
        background: #7b1fa2;
      }
      
      &.type-string {
        background: #388e3c;
      }
      
      &.type-number {
        background: #f57c00;
      }
      
      &.type-boolean {
        background: #0288d1;
      }
      
      &.type-null {
        background: #757575;
      }
    }

    /* Key Section */
    .key-section {
      display: flex;
      align-items: flex-start;
      gap: 2px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .key {
      color: #881391;
      font-weight: 600;
    }

    .colon {
      color: #6c757d;
    }

    /* Value Section */
    .value-section {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      flex: 1;
      min-width: 0;
    }

    .value {
      white-space: normal;
      word-wrap: break-word;
      word-break: break-all;
      line-height: 1.2;
      
      &.type-string {
        color: #c41a16;
      }
      
      &.type-number {
        color: #1c00cf;
        font-weight: 600;
      }
      
      &.type-boolean {
        color: #0d22aa;
        font-weight: 600;
      }
      
      &.type-null {
        color: #757575;
        font-style: italic;
      }
      
      &.type-object,
      &.type-array {
        color: #495057;
        font-style: italic;
      }
    }

    /* Info Badge */
    .info-badge {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .badge {
      font-size: 0.6rem;
      padding: 1px 3px;
      border-radius: 4px;
      font-weight: 600;
      
      &.badge-object {
        color: #0d47a1;
      }
      
      &.badge-array {
        color: #4a148c;
      }
    }

    /* Children Container */
    .children {
      border-left: 1px solid #e9ecef;
      margin-left: 6px;
      padding-left: 4px;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .json-node {
        font-size: 0.7rem;
      }
      
      .node-line {
        padding: 1px;
        gap: 3px;
      }
      
      .value {
        font-size: 0.7rem;
      }
      
      .badge {
        font-size: 0.55rem;
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
    return 2 + (this.level * 8);
  }

  toggle(): void {
    if (this.hasChildren) {
      this.node.expanded = !this.node.expanded;
    }
  }

  getValueDisplay(): string {
    switch (this.node.type) {
      case 'string':
        const str = this.node.value as string;
        // Remove truncation - show full content
        return `"${str}"`;
      case 'null':
        return 'null';
      case 'object':
        return '{...}';
      case 'array':
        return `[${this.node.children?.length || 0}]`;
      default:
        return String(this.node.value);
    }
  }

  getTooltip(): string {
    if (this.node.type === 'string') {
      const str = this.node.value as string;
      return str.length > 100 ? str : '';
    }
    return '';
  }

  showInfoBadge(): boolean {
    return this.hasChildren && !this.node.expanded;
  }

  getInfoBadge(): string {
    if (!this.hasChildren) return '';
    
    const count = this.node.children?.length || 0;
    switch (this.node.type) {
      case 'object':
        return `${count}k`;
      case 'array':
        return `${count}i`;
      default:
        return `${count}`;
    }
  }
}