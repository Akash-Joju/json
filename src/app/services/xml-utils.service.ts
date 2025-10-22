import { Injectable } from '@angular/core';

export interface XmlNode {
  name: string;
  attributes?: XmlAttribute[];
  depth: number;
  expanded: boolean;
  hasChildren: boolean;
  selfClosing: boolean;
  content?: string;
  children?: XmlNode[];
}

export interface XmlAttribute {
  name: string;
  value: string;
}

export interface XmlViewerStats {
  totalNodes: number;
  maxDepth: number;
  totalAttributes: number;
  isValid: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class XmlUtilsService {
  
  parseXml(xmlString: string): { nodes: XmlNode[], stats: XmlViewerStats, error: string | null } {
    const stats: XmlViewerStats = {
      totalNodes: 0,
      maxDepth: 0,
      totalAttributes: 0,
      isValid: false
    };

    if (!xmlString?.trim()) {
      return { nodes: [], stats, error: null };
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString.trim(), 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        throw new Error(parseError.textContent || 'Invalid XML format');
      }

      if (!xmlDoc.documentElement) {
        throw new Error('No root element found');
      }

      const nodes = this.parseNode(xmlDoc.documentElement, 0, stats);
      stats.isValid = true;
      return { nodes, stats, error: null };

    } catch (error) {
      stats.isValid = false;
      stats.error = error instanceof Error ? error.message : 'Unknown parsing error';
      return { nodes: [], stats, error: stats.error };
    }
  }

  private parseNode(element: Element, depth: number, stats: XmlViewerStats): XmlNode[] {
    const nodes: XmlNode[] = [];
    
    const attributes: XmlAttribute[] = [];
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes.push({ name: attr.name, value: attr.value });
      stats.totalAttributes++;
    }

    const childElements = Array.from(element.children);
    const textContent = element.textContent?.trim() || '';
    const hasTextContent = textContent.length > 0 && 
                          !childElements.some(child => 
                            textContent.includes(child.textContent || '')
                          );
    
    const node: XmlNode = {
      name: element.tagName,
      attributes: attributes.length > 0 ? attributes : undefined,
      depth: depth,
      expanded: depth < 2,
      hasChildren: childElements.length > 0 || hasTextContent,
      selfClosing: childElements.length === 0 && !hasTextContent,
      content: hasTextContent ? textContent : undefined,
      children: []
    };

    stats.totalNodes++;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (childElements.length > 0) {
      node.children = childElements.flatMap(child => 
        this.parseNode(child as Element, depth + 1, stats)
      );
    }

    nodes.push(node);
    return nodes;
  }

  formatXml(xmlString: string): string {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      return this.formatXmlString(formatted);
    } catch (error) {
      console.error('Formatting error:', error);
      return xmlString;
    }
  }

  private formatXmlString(xml: string): string {
    const PADDING = '  ';
    const reg = /(>)(<)(\/*)/g;
    let formatted = xml.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    
    return formatted.split('\r\n').map((line) => {
      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      const padding = PADDING.repeat(pad);
      pad += indent;
      return padding + line;
    }).join('\r\n');
  }

  validateXml(xmlString: string): { isValid: boolean; error?: string } {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        return { 
          isValid: false, 
          error: parseError.textContent || 'Invalid XML format' 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  tryRepairXml(xmlString: string): string {
    let repaired = xmlString.trim();
    
    repaired = repaired.replace(/<\?xml[^?]*\?>\s*/g, '');
    
    if (!repaired.match(/<[^>]+>/) && repaired.length > 0) {
      repaired = `<root>${repaired}</root>`;
    }
    
    const openTags = (repaired.match(/<([^\/][^>]*)>/g) || []).length;
    const closeTags = (repaired.match(/<\/([^>]*)>/g) || []).length;
    
    if (openTags > closeTags) {
      const lastOpenTag = repaired.lastIndexOf('<');
      if (lastOpenTag !== -1) {
        const tagContent = repaired.substring(lastOpenTag + 1).split('>')[0].split(' ')[0];
        repaired += `</${tagContent}>`;
      }
    }
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n${repaired}`;
  }

  downloadXml(xmlString: string, filename: string = 'document.xml'): void {
    const blob = new Blob([xmlString], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  setAllNodesExpanded(nodes: XmlNode[], expanded: boolean): void {
    nodes.forEach(node => {
      if (node.hasChildren) {
        node.expanded = expanded;
        if (node.children) {
          this.setAllNodesExpanded(node.children, expanded);
        }
      }
    });
  }

  setNodesExpandedToLevel(nodes: XmlNode[], level: number): void {
    nodes.forEach(node => {
      if (node.hasChildren) {
        node.expanded = node.depth < level;
        if (node.children) {
          this.setNodesExpandedToLevel(node.children, level);
        }
      }
    });
  }

  async loadXmlFromUrl(url: string): Promise<{ content: string; error?: string }> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('xml')) {
        throw new Error('URL does not point to an XML file');
      }
      
      const content = await response.text();
      return { content };
    } catch (error) {
      return { 
        content: '', 
        error: error instanceof Error ? error.message : 'Failed to load XML from URL' 
      };
    }
  }

  readXmlFromFile(file: File): Promise<{ content: string; error?: string }> {
    return new Promise((resolve) => {
      if (!file.type.includes('xml') && !file.name.endsWith('.xml')) {
        resolve({ content: '', error: 'Please select an XML file' });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        resolve({ content: '', error: 'File size too large. Maximum 10MB allowed.' });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          resolve({ content });
        } catch (error) {
          resolve({ content: '', error: 'Failed to read file' });
        }
      };
      
      reader.onerror = () => {
        resolve({ content: '', error: 'Error reading file' });
      };
      
      reader.readAsText(file);
    });
  }
}