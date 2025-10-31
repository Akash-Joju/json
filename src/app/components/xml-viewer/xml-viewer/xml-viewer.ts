// xml-viewer.component.ts - WITH IMPROVED XML VALIDATION AND MOBILE SUPPORT
import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface XmlNode {
  treeLineNumber: any;
  name: string;
  attributes: { [key: string]: string };
  children: XmlNode[];
  textContent?: string;
  isExpanded: boolean;
  level: number;
  nodeType?: 'element' | 'text' | 'comment' | 'cdata';
  isVisible?: boolean;
  parent?: XmlNode;
  isHovered?: boolean;
}

export interface ColorTheme {
  tagName: string;
  attributeName: string;
  attributeValue: string;
  textContent: string;
  comment: string;
  cdata: string;
  punctuation: string;
  expandIcon: string;
  hoverBackground: string;
  selectedBackground: string;
  lineNumber: string;
  indentationLine: string;
}

export interface TreeLine {
  number: number;
  node: XmlNode;
  type: 'open' | 'close' | 'text' | 'self-closing';
  level: number;
  isVisible: boolean;
  displayNumber: number;
}

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './xml-viewer.html',
  styleUrls: ['./xml-viewer.scss']
})
export class XmlViewerComponent implements OnChanges, AfterViewInit {
  @Input() xmlData: string = '';
  @Input() editable: boolean = true;
  @Input() showLineNumbers: boolean = true;
  @Input() showTreeLineNumbers: boolean = true;
  @Input() theme: 'light' | 'dark' = 'light';
  @Input() colorScheme: 'default' | 'vibrant' | 'pastel' | 'monokai' = 'default';
  @Output() xmlChanged = new EventEmitter<string>();
  
  @ViewChild('xmlTextArea') xmlTextArea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('lineNumbers') lineNumbers!: ElementRef<HTMLDivElement>;
  @ViewChild('treeContentArea') treeContentArea!: ElementRef<HTMLDivElement>;

  parsedData: XmlNode | null = null;
  error: string = '';
  viewMode: 'tree' | 'raw' = 'tree';
  searchTerm: string = '';
  filteredNodes: XmlNode[] = [];
  selectedNode: XmlNode | null = null;
  lineCount: number = 1;
  isSyncingScroll: boolean = false;
  
  treeLines: TreeLine[] = [];
  private nextDisplayLineNumber: number = 1;

  // Mobile detection
  isMobileView: boolean = false;

  // Color themes (same as before)
  colorThemes: { [key: string]: ColorTheme } = {
    default: {
      tagName: '#e11d48',
      attributeName: '#3b82f6',
      attributeValue: '#ea580c',
      textContent: '#16a34a',
      comment: '#6b7280',
      cdata: '#9333ea',
      punctuation: '#1f2937',
      expandIcon: '#6b7280',
      hoverBackground: '#fef3c7',
      selectedBackground: '#bfdbfe',
      lineNumber: '#6b7280',
      indentationLine: '#d1d5db'
    },
    vibrant: {
      tagName: '#e11d48',
      attributeName: '#3b82f6',
      attributeValue: '#ea580c',
      textContent: '#16a34a',
      comment: '#6b7280',
      cdata: '#9333ea',
      punctuation: '#1f2937',
      expandIcon: '#6b7280',
      hoverBackground: '#fef3c7',
      selectedBackground: '#bfdbfe',
      lineNumber: '#6b7280',
      indentationLine: '#d1d5db'
    },
    pastel: {
      tagName: '#7dd3fc',
      attributeName: '#c4b5fd',
      attributeValue: '#fda4af',
      textContent: '#bbf7d0',
      comment: '#d1d5db',
      cdata: '#f0abfc',
      punctuation: '#9ca3af',
      expandIcon: '#9ca3af',
      hoverBackground: '#f8fafc',
      selectedBackground: '#e0e7ff',
      lineNumber: '#9ca3af',
      indentationLine: '#e5e7eb'
    },
    monokai: {
      tagName: '#f92672',
      attributeName: '#a6e22e',
      attributeValue: '#e6db74',
      textContent: '#ffffff',
      comment: '#75715e',
      cdata: '#ae81ff',
      punctuation: '#f8f8f2',
      expandIcon: '#f8f8f2',
      hoverBackground: '#3e3d32',
      selectedBackground: '#49483e',
      lineNumber: '#75715e',
      indentationLine: '#75715e'
    }
  };

  darkColorThemes: { [key: string]: ColorTheme } = {
    default: {
      tagName: '#f87171',
      attributeName: '#60a5fa',
      attributeValue: '#fb923c',
      textContent: '#4ade80',
      comment: '#9ca3af',
      cdata: '#c084fc',
      punctuation: '#f8fafc',
      expandIcon: '#9ca3af',
      hoverBackground: '#374151',
      selectedBackground: '#1e3a8a',
      lineNumber: '#9ca3af',
      indentationLine: '#4b5563'
    },
    vibrant: {
      tagName: '#f87171',
      attributeName: '#60a5fa',
      attributeValue: '#fb923c',
      textContent: '#4ade80',
      comment: '#9ca3af',
      cdata: '#c084fc',
      punctuation: '#f8fafc',
      expandIcon: '#9ca3af',
      hoverBackground: '#374151',
      selectedBackground: '#1e3a8a',
      lineNumber: '#9ca3af',
      indentationLine: '#4b5563'
    },
    pastel: {
      tagName: '#7dd3fc',
      attributeName: '#c4b5fd',
      attributeValue: '#fda4af',
      textContent: '#bbf7d0',
      comment: '#d1d5db',
      cdata: '#f0abfc',
      punctuation: '#9ca3af',
      expandIcon: '#9ca3af',
      hoverBackground: '#374151',
      selectedBackground: '#4338ca',
      lineNumber: '#9ca3af',
      indentationLine: '#6b7280'
    },
    monokai: {
      tagName: '#f92672',
      attributeName: '#a6e22e',
      attributeValue: '#e6db74',
      textContent: '#ffffff',
      comment: '#75715e',
      cdata: '#ae81ff',
      punctuation: '#f8f8f2',
      expandIcon: '#f8f8f2',
      hoverBackground: '#3e3d32',
      selectedBackground: '#49483e',
      lineNumber: '#75715e',
      indentationLine: '#75715e'
    }
  };

  objectKeys = Object.keys;

  get currentColors(): ColorTheme {
    const themes = this.theme === 'dark' ? this.darkColorThemes : this.colorThemes;
    return themes[this.colorScheme] || themes['default'];
  }

  ngOnInit(): void {
    this.checkMobileView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['xmlData']) {
      this.parseXml();
      this.updateLineCount();
      setTimeout(() => this.synchronizeHeights(), 0);
    }
  }

  ngAfterViewInit(): void {
    this.setupScrollSync();
    this.updateLineCount();
    setTimeout(() => this.synchronizeHeights(), 100);
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth <= 768;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkMobileView();
    setTimeout(() => this.synchronizeHeights(), 0);
  }

  private setupScrollSync(): void {
    // Setup sync for raw editor - bidirectional sync between textarea and line numbers
    // if (this.xmlTextArea && this.lineNumbers) {
    //   const textArea = this.xmlTextArea.nativeElement;
    //   const lineNumbers = this.lineNumbers.nativeElement;

    //   // Sync from textarea to line numbers
    //   textArea.addEventListener('scroll', () => {
    //     if (!this.isSyncingScroll) {
    //       this.isSyncingScroll = true;
    //       lineNumbers.scrollTop = textArea.scrollTop;
    //       setTimeout(() => this.isSyncingScroll = false, 10);
    //     }
    //   });

    //   // Sync from line numbers to textarea
    //   lineNumbers.addEventListener('scroll', () => {
    //     if (!this.isSyncingScroll) {
    //       this.isSyncingScroll = true;
    //       textArea.scrollTop = lineNumbers.scrollTop;
    //       setTimeout(() => this.isSyncingScroll = false, 10);
    //     }
    //   });
    // }
  }

  private synchronizeHeights(): void {
    if (!this.xmlTextArea || !this.lineNumbers) return;

    const textArea = this.xmlTextArea.nativeElement;
    const lineNumbers = this.lineNumbers.nativeElement;

    const textAreaStyle = window.getComputedStyle(textArea);
    const lineHeight = parseInt(textAreaStyle.lineHeight) || 21;

    // For raw view, we don't need to set explicit heights
    // The containers will naturally fill the available space
    // and the main scrollbar will handle scrolling
    
    const lineNumberElements = lineNumbers.querySelectorAll('.line-number');
    lineNumberElements.forEach((lineEl: any) => {
      lineEl.style.height = lineHeight + 'px';
      lineEl.style.lineHeight = lineHeight + 'px';
    });

    textArea.style.lineHeight = lineHeight + 'px';
  }

  private updateLineCount(): void {
    if (this.xmlData) {
      this.lineCount = Math.max(this.xmlData.split('\n').length, 1);
    } else {
      this.lineCount = 1;
    }
  }

  parseXml(): void {
    if (!this.xmlData?.trim()) {
      this.parsedData = null;
      this.error = '';
      this.treeLines = [];
      return;
    }

    try {
      // Pre-process XML to escape special characters
      const processedXml = this.preprocessXml(this.xmlData);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedXml, 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        const errorText = parseError.textContent || 'Unknown XML parsing error';
        const lineMatch = errorText.match(/line\s+(\d+)/i);
        const columnMatch = errorText.match(/column\s+(\d+)/i);
        
        let detailedError = errorText;
        if (lineMatch && columnMatch) {
          const lineNum = parseInt(lineMatch[1]);
          const columnNum = parseInt(columnMatch[1]);
          detailedError = `XML Error at line ${lineNum}, column ${columnNum}: ${errorText}`;
        }
        
        this.error = detailedError;
        this.parsedData = null;
        this.treeLines = [];
        return;
      }

      this.error = '';
      this.parsedData = this.parseNode(xmlDoc.documentElement, 0);
      this.generateTreeLines();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to parse XML';
      this.parsedData = null;
      this.treeLines = [];
    }
  }

  private preprocessXml(xml: string): string {
    // Replace unescaped ampersands that are not part of valid entities
    return xml.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;');
  }

  private parseNode(node: Element, level: number): XmlNode {
    const xmlNode: XmlNode = {
      name: node.nodeName,
      attributes: {},
      children: [],
      isExpanded: level < 2,
      level: level,
      nodeType: 'element',
      isVisible: true,
      treeLineNumber: undefined
    };

    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      xmlNode.attributes[attr.name] = attr.value;
    }

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      
      if (child.nodeType === Node.ELEMENT_NODE) {
        const childNode = this.parseNode(child as Element, level + 1);
        childNode.parent = xmlNode;
        xmlNode.children.push(childNode);
      } else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        if (child.textContent.includes('<!--') && child.textContent.includes('-->')) {
          const commentNode: XmlNode = {
            name: 'comment',
            attributes: {},
            children: [],
            textContent: child.textContent.replace(/<!--|-->/g, '').trim(),
            isExpanded: true,
            level: level + 1,
            nodeType: 'comment',
            isVisible: true,
            parent: xmlNode,
            treeLineNumber: undefined
          };
          xmlNode.children.push(commentNode);
        } else if (child.textContent.includes('<![CDATA[') && child.textContent.includes(']]>')) {
          const cdataNode: XmlNode = {
            name: 'cdata',
            attributes: {},
            children: [],
            textContent: child.textContent.replace(/<!\[CDATA\[|\]\]>/g, '').trim(),
            isExpanded: true,
            level: level + 1,
            nodeType: 'cdata',
            isVisible: true,
            parent: xmlNode,
            treeLineNumber: undefined
          };
          xmlNode.children.push(cdataNode);
        } else {
          xmlNode.textContent = child.textContent.trim();
        }
      }
    }

    return xmlNode;
  }

  private generateTreeLines(): void {
    this.treeLines = [];
    this.nextDisplayLineNumber = 1;
    
    if (this.parsedData) {
      this.generateNodeLines(this.parsedData);
    }
  }

  private generateNodeLines(node: XmlNode): void {
    if (!node.isVisible) return;

    const isSelfClosing = node.children.length === 0 && !node.textContent;
    const lineType = isSelfClosing ? 'self-closing' : 'open';

    this.treeLines.push({
      number: this.nextDisplayLineNumber,
      node: node,
      type: lineType,
      level: node.level,
      isVisible: true,
      displayNumber: this.nextDisplayLineNumber++
    });

    if (node.isExpanded && !isSelfClosing) {
      node.children.forEach(child => {
        this.generateNodeLines(child);
      });

      if (node.textContent) {
        this.treeLines.push({
          number: this.nextDisplayLineNumber,
          node: node,
          type: 'text',
          level: node.level + 1,
          isVisible: true,
          displayNumber: this.nextDisplayLineNumber++
        });
      }
    }

    if (!isSelfClosing && node.isExpanded) {
      this.treeLines.push({
        number: this.nextDisplayLineNumber,
        node: node,
        type: 'close',
        level: node.level,
        isVisible: true,
        displayNumber: this.nextDisplayLineNumber++
      });
    }
  }

  toggleNode(node: XmlNode): void {
    node.isExpanded = !node.isExpanded;
    this.updateNodeVisibility(node);
    this.generateTreeLines();
  }

  private updateNodeVisibility(node: XmlNode): void {
    node.children.forEach(child => {
      child.isVisible = node.isExpanded;
      if (node.isExpanded) {
        this.updateNodeVisibility(child);
      }
    });
  }

  collapseAll(): void {
    this.collapseNode(this.parsedData);
    this.generateTreeLines();
  }

  expandAll(): void {
    this.expandNode(this.parsedData);
    this.generateTreeLines();
  }

  public collapseNode(node: XmlNode | null): void {
    if (!node) return;
    
    node.isExpanded = false;
    node.children.forEach(child => {
      this.collapseNode(child);
    });
    this.updateTreeLines();
  }

  public expandNode(node: XmlNode | null): void {
    if (!node) return;
    
    node.isExpanded = true;
    node.children.forEach(child => {
      this.expandNode(child);
    });
    this.updateTreeLines();
  }

  updateTreeLines() {
    this.generateTreeLines();
  }

  selectNode(node: XmlNode): void {
    this.selectedNode = node;
  }

  onTextAreaScroll(event: Event): void {
    // if (this.isSyncingScroll) return;
    
    // this.isSyncingScroll = true;
    // const textArea = event.target as HTMLTextAreaElement;
    
    // if (this.lineNumbers) {
    //   this.lineNumbers.nativeElement.scrollTop = textArea.scrollTop;
    // }
    
    // setTimeout(() => this.isSyncingScroll = false, 10);
  }

  onTextAreaKeyup(): void {
    this.updateLineCount();
    setTimeout(() => this.synchronizeHeights(), 0);
  }

  onXmlInputChange(): void {
    this.xmlChanged.emit(this.xmlData);
    this.updateLineCount();
    setTimeout(() => this.synchronizeHeights(), 0);
    if (this.viewMode === 'tree') {
      this.parseXml();
    }
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'tree' ? 'raw' : 'tree';
    if (this.viewMode === 'tree') {
      this.parseXml();
    }
    setTimeout(() => this.synchronizeHeights(), 0);
  }

  changeColorScheme(scheme: 'default' | 'vibrant' | 'pastel' | 'monokai'): void {
    this.colorScheme = scheme;
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

  isSpecialNode(node: XmlNode): boolean {
    return node.nodeType === 'comment' || node.nodeType === 'cdata';
  }

  getSpecialNodeSymbol(node: XmlNode): string {
    if (node.nodeType === 'comment') return '💬';
    if (node.nodeType === 'cdata') return '📄';
    return '';
  }

  isSelfClosing(node: XmlNode): boolean {
    return node.children.length === 0 && !node.textContent;
  }

  getLineContent(treeLine: TreeLine): string {
    const node = treeLine.node;
    
    switch (treeLine.type) {
      case 'open':
        return `<span class="tag-punctuation">&lt;</span><span class="tag-name" style="color: ${this.getTagColor(node)}">${this.getNodeDisplayName(node)}</span>${this.getAttributesString(node)}<span class="tag-punctuation">&gt;</span>`;
      case 'self-closing':
        return `<span class="tag-punctuation">&lt;</span><span class="tag-name" style="color: ${this.getTagColor(node)}">${this.getNodeDisplayName(node)}</span>${this.getAttributesString(node)}<span class="tag-punctuation"> /&gt;</span>`;
      case 'close':
        return `<span class="tag-punctuation">&lt;/</span><span class="tag-name" style="color: ${this.getTagColor(node)}">${this.getNodeClosingName(node)}</span><span class="tag-punctuation">&gt;</span>`;
      case 'text':
        return `<span class="text-content" style="color: ${this.getTextColor(node)}">${node.textContent || ''}</span>`;
      default:
        return '';
    }
  }

  private getAttributesString(node: XmlNode): string {
    const attributes = this.objectKeys(node.attributes);
    if (attributes.length === 0) return '';
    
    return ' ' + attributes.map(attr => 
      `<span class="attr-name" style="color: ${this.currentColors.attributeName}">${attr}</span><span class="tag-punctuation">=</span><span class="attr-value" style="color: ${this.currentColors.attributeValue}">"${node.attributes[attr]}"</span>`
    ).join(' ');
  }

  onTreeLineClick(treeLine: TreeLine): void {
    this.selectNode(treeLine.node);
    
    if ((treeLine.type === 'open' || treeLine.type === 'self-closing') && 
        treeLine.node.children.length > 0) {
      this.toggleNode(treeLine.node);
    }
  }

  onTreeLineHover(treeLine: TreeLine, isHovered: boolean): void {
    treeLine.node.isHovered = isHovered;
  }

  formatXml(): void {
    try {
      // Pre-process XML to escape special characters before formatting
      const processedXml = this.preprocessXml(this.xmlData);
      
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(processedXml, 'text/xml');
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      
      const formattedWithIndent = this.formatXmlString(formatted);
      this.xmlData = formattedWithIndent;
      this.onXmlInputChange();
    } catch (err) {
      this.error = 'Failed to format XML - check for unescaped special characters';
    }
  }

  private formatXmlString(xml: string): string {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = '';
    let pad = 0;
    
    xml = xml.replace(reg, '$1\r\n$2$3');
    
    xml.split('\r\n').forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/) && pad !== 0) {
        pad -= 1;
      } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      }
      
      const padding = new Array(pad + 1).join(PADDING);
      formatted += padding + node + '\r\n';
      pad += indent;
    });
    
    return formatted;
  }

  minifyXml(): void {
    this.xmlData = this.xmlData.replace(/>\s+</g, '><').trim();
    this.onXmlInputChange();
  }

  applySearchFilter(): void {
    if (!this.searchTerm.trim()) {
      this.filteredNodes = [];
      return;
    }

    this.filteredNodes = [];
    this.searchInNode(this.parsedData, this.searchTerm.toLowerCase());
  }

  private searchInNode(node: XmlNode | null, searchTerm: string): void {
    if (!node) return;

    const nodeContent = `${node.name} ${Object.values(node.attributes).join(' ')} ${node.textContent || ''}`.toLowerCase();
    
    if (nodeContent.includes(searchTerm)) {
      this.filteredNodes.push(node);
    }

    node.children.forEach(child => this.searchInNode(child, searchTerm));
  }

  downloadXml(): void {
    const blob = new Blob([this.xmlData], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  getLineNumbers(): number[] {
    return Array.from({ length: this.lineCount }, (_, i) => i + 1);
  }

  onTextAreaKeydown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = this.xmlTextArea.nativeElement.selectionStart;
      const end = this.xmlTextArea.nativeElement.selectionEnd;
      
      this.xmlData = this.xmlData.substring(0, start) + '  ' + this.xmlData.substring(end);
      
      setTimeout(() => {
        this.xmlTextArea.nativeElement.selectionStart = this.xmlTextArea.nativeElement.selectionEnd = start + 2;
        this.onXmlInputChange();
      });
    }

    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      event.preventDefault();
      this.formatXml();
    }
  }

  getNodeLineNumber(node: XmlNode): number {
    const treeLine = this.treeLines.find(tl => tl.node === node);
    return treeLine ? treeLine.displayNumber : 0;
  }

  updateXmlFromTree(): void {
    if (!this.parsedData) return;
    
    try {
      const xmlString = this.serializeNode(this.parsedData);
      this.xmlData = xmlString;
      this.xmlChanged.emit(this.xmlData);
      this.parseXml();
    } catch (err) {
      this.error = 'Failed to update XML from tree changes';
    }
  }

  private serializeNode(node: XmlNode, indent: string = ''): string {
    let xml = '';
    
    xml += `${indent}<${node.name}`;
    
    for (const [key, value] of Object.entries(node.attributes)) {
      xml += ` ${key}="${this.escapeXml(value)}"`;
    }
    
    if (node.children.length === 0 && !node.textContent) {
      xml += '/>';
    } else {
      xml += '>';
      
      if (node.textContent) {
        xml += this.escapeXml(node.textContent);
      }
      
      if (node.children.length > 0) {
        xml += '\n';
        const childIndent = indent + '  ';
        node.children.forEach(child => {
          xml += this.serializeNode(child, childIndent) + '\n';
        });
        xml += indent;
      }
      
      xml += `</${node.name}>`;
    }
    
    return xml;
  }

  private escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  editNodeName(node: XmlNode, newName: string): void {
    if (!this.editable || !newName.trim()) return;
    
    const oldName = node.name;
    node.name = newName.trim();
    this.updateXmlFromTree();
  }

  editNodeAttribute(node: XmlNode, attrName: string, newValue: string): void {
    if (attrName && newValue !== node.attributes[attrName]) {
      node.attributes[attrName] = newValue;
      this.updateXmlFromTree();
    }
  }

  updateAttributeKey(node: XmlNode, oldKey: string, newKey: string): void {
    if (newKey && newKey !== oldKey && !node.attributes[newKey]) {
      const value = node.attributes[oldKey];
      delete node.attributes[oldKey];
      node.attributes[newKey] = value;
      this.updateXmlFromTree();
    }
  }

  addAttribute(node: XmlNode, attrName: string, attrValue: string): void {
    if (attrName && !node.attributes[attrName]) {
      node.attributes[attrName] = attrValue;
      this.updateXmlFromTree();
    }
  }

  removeAttribute(node: XmlNode, attrName: string): void {
    if (node.attributes[attrName]) {
      delete node.attributes[attrName];
      this.updateXmlFromTree();
    }
  }

  editNodeText(node: XmlNode, newText: string): void {
    if (newText !== node.textContent) {
      node.textContent = newText;
      this.updateXmlFromTree();
    }
  }

  onEditNodeName(event: Event, node: XmlNode): void {
    const target = event.target as HTMLInputElement;
    this.editNodeName(node, target.value);
  }

  onEditNodeText(event: Event, node: XmlNode): void {
    const target = event.target as HTMLTextAreaElement;
    this.editNodeText(node, target.value);
  }

  onEditNodeAttribute(event: Event, node: XmlNode, attr: string): void {
    const target = event.target as HTMLInputElement;
    this.editNodeAttribute(node, attr, target.value);
  }

  onUpdateAttributeKey(event: Event, node: XmlNode, oldKey: string): void {
    const target = event.target as HTMLInputElement;
    this.updateAttributeKey(node, oldKey, target.value);
  }

  // New method to auto-fix common XML issues
  autoFixXml(): void {
    try {
      // Fix unescaped ampersands
      this.xmlData = this.preprocessXml(this.xmlData);
      
      // Fix other common issues
      this.xmlData = this.xmlData
        .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      
      this.onXmlInputChange();
    } catch (err) {
      this.error = 'Failed to auto-fix XML';
    }
  }
}