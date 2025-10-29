// xml-tree-node.component.ts - UPDATED WITH COLOR SUPPORT
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XmlNode,ColorTheme } from '../../xml-viewer/xml-viewer/xml-viewer';

@Component({
  selector: 'app-xml-tree-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tree-node" 
         [class.selected]="selectedNode === node"
         (click)="onNodeClick()"
         [style.background]="selectedNode === node ? currentColors.selectedBackground : 'transparent'"
         (mouseover)="isHovered = true"
         (mouseleave)="isHovered = false"
         [style.background]="isHovered && selectedNode !== node ? currentColors.hoverBackground : (selectedNode === node ? currentColors.selectedBackground : 'transparent')">
      
      <div class="node-content" [style.padding-left.px]="node.level * 20">
        <!-- Toggle Button -->
        <span class="toggle" 
              (click)="onToggleClick($event)"
              *ngIf="node.children.length > 0"
              [style.color]="currentColors.expandIcon"
              [style.background]="currentColors.expandIcon + '20'">
          {{ node.isExpanded ? '−' : '+' }}
        </span>

        <!-- Special Node Icon -->
        <span *ngIf="isSpecialNode(node)" class="special-node-icon">
          {{ getSpecialNodeSymbol(node) }}
        </span>

        <!-- Opening Tag -->
        <span class="tag open-tag">
          <span class="punctuation" [style.color]="currentColors.punctuation">&lt;</span>
          
          <span class="tag-name" [style.color]="getTagColor(node)">
            {{ getNodeDisplayName(node) }}
          </span>
          
          <!-- Attributes -->
          <span class="attribute" *ngFor="let attr of objectKeys(node.attributes)">
            <span class="attr-name" [style.color]="currentColors.attributeName"> {{ attr }}</span>
            <span class="punctuation" [style.color]="currentColors.punctuation">="</span>
            <span class="attr-value" [style.color]="currentColors.attributeValue">{{ node.attributes[attr] }}</span>
            <span class="punctuation" [style.color]="currentColors.punctuation">"</span>
          </span>
          
          <!-- Self-closing if no children or text -->
          <span class="punctuation" [style.color]="currentColors.punctuation" *ngIf="isSelfClosing()">/</span>
          <span class="punctuation" [style.color]="currentColors.punctuation">&gt;</span>
        </span>
      </div>
    </div>

    <!-- Expanded Content -->
    <div *ngIf="node.isExpanded">
      <!-- Child Nodes -->
      <app-xml-tree-node 
        [node]="child" 
        [selectedNode]="selectedNode"
        [currentColors]="currentColors"
        (nodeSelected)="nodeSelected.emit($event)"
        *ngFor="let child of node.children">
      </app-xml-tree-node>
      
      <!-- Text Content -->
      <div *ngIf="node.textContent" 
           class="text-content" 
           [style.padding-left.px]="(node.level + 1) * 20"
           [style.color]="getTextColor(node)">
        {{ node.textContent }}
      </div>

      <!-- Closing Tag -->
      <div *ngIf="!isSelfClosing()" 
           class="tree-node closing-tag"
           [style.background]="isHovered ? currentColors.hoverBackground : 'transparent'">
        <div class="node-content" [style.padding-left.px]="node.level * 20">
          <span class="tag close-tag">
            <span class="punctuation" [style.color]="currentColors.punctuation">&lt;/</span>
            <span class="tag-name" [style.color]="getTagColor(node)">{{ getNodeClosingName(node) }}</span>
            <span class="punctuation" [style.color]="currentColors.punctuation">&gt;</span>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .closing-tag {
      opacity: 0.8;
    }

    .special-node-icon {
      margin-right: 4px;
      font-size: 12px;
    }
  `]
})
export class XmlTreeNodeComponent {
  @Input() node!: XmlNode;
  @Input() selectedNode: XmlNode | null = null;
  @Input() currentColors!: ColorTheme;
  @Output() nodeSelected = new EventEmitter<XmlNode>();

  isHovered = false;
  objectKeys = Object.keys;

  onNodeClick(): void {
    this.nodeSelected.emit(this.node);
  }

  onToggleClick(event: Event): void {
    event.stopPropagation();
    this.node.isExpanded = !this.node.isExpanded;
  }

  isSelfClosing(): boolean {
    return this.node.children.length === 0 && !this.node.textContent;
  }

  isSpecialNode(node: XmlNode): boolean {
    return node.nodeType === 'comment' || node.nodeType === 'cdata';
  }

  getSpecialNodeSymbol(node: XmlNode): string {
    if (node.nodeType === 'comment') return '💬';
    if (node.nodeType === 'cdata') return '📄';
    return '';
  }

  getTagColor(node: XmlNode): string {
    if (node.nodeType === 'comment') return this.currentColors.comment;
    if (node.nodeType === 'cdata') return this.currentColors.cdata;
    return this.currentColors.tagName;
  }

  getTextColor(node: XmlNode): string {
    if (node.nodeType === 'comment') return this.currentColors.comment;
    if (node.nodeType === 'cdata') return this.currentColors.cdata;
    return this.currentColors.textContent;
  }

  getNodeDisplayName(node: XmlNode): string {
    if (node.nodeType === 'comment') return '!--';
    if (node.nodeType === 'cdata') return '![CDATA[';
    return node.name;
  }

  getNodeClosingName(node: XmlNode): string {
    if (node.nodeType === 'comment') return '--';
    if (node.nodeType === 'cdata') return ']]';
    return node.name;
  }
}