import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { XmlNode } from '../../../services/xml-utils.service';

@Component({
  selector: 'app-xml-node',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="xml-node"
         *ngFor="let node of nodes"
         [class.expanded]="node.expanded"
         [class.collapsed]="!node.expanded">
      
      <!-- Node Line -->
      <div class="node-line" 
           [style.padding-left.px]="getPadding()"
           (click)="toggleNode(node)">
        
        <!-- Toggle Icon -->
        <span class="toggle-icon" *ngIf="node.hasChildren">
          {{ node.expanded ? '▼' : '►' }}
        </span>
        
        <!-- Opening Tag -->
        <span class="node-tag">
          &lt;<span class="tag-name">{{ node.name }}</span>
          
          <!-- Attributes -->
          <span *ngIf="node.attributes" class="attributes">
            <span *ngFor="let attr of node.attributes" class="attribute">
              {{ attr.name }}="<span class="attribute-value">{{ attr.value }}</span>"
            </span>
          </span>
          
          <span *ngIf="node.selfClosing && !node.children?.length"> /</span>&gt;
        </span>
        
        <!-- Content -->
        <span *ngIf="!node.selfClosing && node.children?.length === 0 && node.content" 
              class="node-content">
          {{ node.content }}
        </span>
        
        <!-- Empty Content -->
        <span *ngIf="!node.selfClosing && (!node.children || node.children.length === 0) && !node.content" 
              class="node-content empty">
          [empty]
        </span>
      </div>
      
      <!-- Children -->
      <div *ngIf="node.expanded && node.children" class="node-children">
        <app-xml-node 
          [nodes]="node.children"
          [depth]="depth + 1"
          (nodeToggle)="nodeToggle.emit($event)">
        </app-xml-node>
      </div>
      
      <!-- Closing Tag -->
      <div *ngIf="!node.selfClosing" class="closing-tag-line"
           [style.padding-left.px]="getPadding()">
        &lt;/<span class="tag-name">{{ node.name }}</span>&gt;
      </div>
    </div>
  `,
  styleUrls: ['./xml-node.scss']
})
export class XmlNodeComponent {
  @Input() nodes: XmlNode[] = [];
  @Input() depth: number = 0;
  @Output() nodeToggle = new EventEmitter<XmlNode>();

  getPadding(): number {
    // Responsive padding based on screen size
    const basePadding = Math.min(this.depth * 16, 200); // Limit maximum padding
    return basePadding;
  }

  toggleNode(node: XmlNode): void {
    if (node.hasChildren) {
      node.expanded = !node.expanded;
      this.nodeToggle.emit(node);
    }
  }
}