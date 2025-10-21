import { Component, Input } from '@angular/core';
import { JsonNode } from '../../../services/json-utils.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-json-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="json-node" 
         [class.highlighted]="isHighlighted" 
         [class.current-search]="isCurrentSearch">
      <div class="node-line" (click)="toggle()" [style.padding-left.px]="level * 20">
        <!-- Toggle icon for expandable nodes -->
        <span 
          class="toggle-icon" 
          *ngIf="hasChildren">
          {{ node.expanded ? '▼' : '►' }}
        </span>
        
        <!-- Key with search highlighting -->
        <span class="key" *ngIf="node.key !== 'root'" [innerHTML]="getHighlightedKey()"></span>
        
        <!-- Value display with search highlighting -->
        <span class="value" [class]="'type-' + node.type" [innerHTML]="getHighlightedValue()"></span>
      </div>
      
      <!-- Children -->
      <div class="children" *ngIf="node.expanded && node.children">
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
  `,
  styles: [`
    .json-node {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 14px;
      line-height: 1.4;
    }

    .json-node.highlighted {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin: 2px 0;
    }

    .json-node.current-search {
      background: #d4edda;
      border: 2px solid #c3e6cb;
      border-radius: 4px;
      margin: 2px 0;
    }

    .node-line {
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 3px;
      
      &:hover {
        background-color: #f0f0f0;
      }
    }

    .toggle-icon {
      display: inline-block;
      width: 16px;
      color: #666;
      font-size: 12px;
    }

    .key {
      color: #881391;
      font-weight: bold;
    }

    .value {
      &.type-string { color: #c41a16; }
      &.type-number { color: #1c00cf; }
      &.type-boolean { color: #0d22aa; }
      &.type-null { color: #808080; font-style: italic; }
      &.type-object { color: #666; font-style: italic; }
      &.type-array { color: #666; font-style: italic; }
    }

    .children {
      border-left: 1px dashed #e0e0e0;
      margin-left: 8px;
    }

    /* Search highlighting styles */
    .search-highlight {
      background-color: #ffeb3b;
      padding: 1px 2px;
      border-radius: 2px;
      font-weight: bold;
    }

    .key .search-highlight {
      background-color: #4caf50;
      color: white;
    }
  `]
})
export class JsonNodeComponent {
  @Input() node!: JsonNode;
  @Input() level: number = 0;
  @Input() isHighlighted: boolean = false;
  @Input() isCurrentSearch: boolean = false;
  @Input() searchTerm: string = '';
  @Input() currentSearchPath: string = ''; // Fix: Remove optional operator

  constructor(private sanitizer: DomSanitizer) {}

  get hasChildren(): boolean {
    return !!this.node.children && this.node.children.length > 0;
  }

  toggle(): void {
    if (this.hasChildren) {
      this.node.expanded = !this.node.expanded;
    }
  }

  // Highlight key if it matches search
  getHighlightedKey(): SafeHtml {
    if (!this.searchTerm || this.node.key === 'root') {
      return this.node.key;
    }

    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
    const highlighted = this.node.key.replace(regex, '<mark class="search-highlight">$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }

  // Highlight value if it matches search
  getHighlightedValue(): SafeHtml {
    if (!this.searchTerm) {
      return this.getValueDisplay();
    }

    let valueToDisplay = this.getValueDisplay();
    
    // For strings, numbers, and booleans, highlight the search term
    if (this.node.type === 'string' || this.node.type === 'number' || this.node.type === 'boolean') {
      const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
      const highlighted = valueToDisplay.replace(regex, '<mark class="search-highlight">$1</mark>');
      return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }

    return valueToDisplay;
  }

  getValueDisplay(): string {
    switch (this.node.type) {
      case 'string':
        return `"${this.node.value}"`;
      case 'null':
        return 'null';
      case 'object':
      case 'array':
        return this.node.value;
      default:
        return this.node.value.toString();
    }
  }

  // Helper method to escape regex special characters
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}