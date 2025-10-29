import { Injectable } from '@angular/core';

export interface XmlNode {
  type: string;
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
    console.log('XmlUtilsService: parseXml started, input length:', xmlString?.length);
    
    const stats: XmlViewerStats = {
      totalNodes: 0,
      maxDepth: 0,
      totalAttributes: 0,
      isValid: false
    };

    try {
      if (!xmlString?.trim()) {
        console.log('XmlUtilsService: Empty XML string provided');
        return { nodes: [], stats, error: null };
      }

      // Pre-validation checks
      const preValidation = this.preParseValidation(xmlString);
      if (!preValidation.isValid) {
        console.error('XmlUtilsService: Pre-validation failed:', preValidation.error);
        stats.error = preValidation.error;
        return { nodes: [], stats, error: preValidation.error || 'Invalid XML structure' };
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString.trim(), 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        const errorText = parseError.textContent || 'Invalid XML format';
        console.error('XmlUtilsService: XML parsing error:', errorText);
        stats.error = errorText;
        return { nodes: [], stats, error: errorText };
      }

      if (!xmlDoc.documentElement) {
        console.error('XmlUtilsService: No root element found in XML');
        stats.error = 'No root element found';
        return { nodes: [], stats, error: 'No root element found' };
      }

      const nodes = this.parseNode(xmlDoc.documentElement, 0, stats);
      stats.isValid = true;
      console.log('XmlUtilsService: XML parsed successfully, nodes:', nodes.length);
      return { nodes, stats, error: null };

    } catch (error) {
      console.error('XmlUtilsService: Unexpected parsing error:', error);
      stats.isValid = false;
      stats.error = error instanceof Error ? error.message : 'Unknown parsing error';
      return { nodes: [], stats, error: stats.error };
    }
  }

  // Enhanced pre-parsing validation
  private preParseValidation(xmlString: string): { isValid: boolean; error?: string } {
    console.log('XmlUtilsService: Running pre-parse validation');
    try {
      const trimmed = xmlString.trim();
      
      // Check for empty content
      if (!trimmed) {
        return { isValid: false, error: 'XML content is empty' };
      }

      // Check for basic XML structure
      if (!trimmed.startsWith('<') && !trimmed.startsWith('<?xml')) {
        return { isValid: false, error: 'Invalid XML: Content must start with < or <?xml' };
      }

      // Check for unclosed comments
      const commentOpenCount = (trimmed.match(/<!--/g) || []).length;
      const commentCloseCount = (trimmed.match(/-->/g) || []).length;
      if (commentOpenCount !== commentCloseCount) {
        return { isValid: false, error: 'Unclosed XML comments detected' };
      }

      // Check for CDATA sections
      const cdataOpenCount = (trimmed.match(/<!\[CDATA\[/g) || []).length;
      const cdataCloseCount = (trimmed.match(/\]\]>/g) || []).length;
      if (cdataOpenCount !== cdataCloseCount) {
        return { isValid: false, error: 'Unclosed CDATA sections detected' };
      }

      // Check for potential security issues
      if (this.containsPotentialSecurityIssues(trimmed)) {
        console.warn('XmlUtilsService: Potential security issues detected in XML');
        // Continue parsing but log warning
      }

      return { isValid: true };
    } catch (error) {
      console.error('XmlUtilsService: Error in preParseValidation:', error);
      return { isValid: false, error: 'Pre-validation check failed' };
    }
  }

  // Security check for potential XML vulnerabilities
  private containsPotentialSecurityIssues(xmlString: string): boolean {
    const dangerousPatterns = [
      /<!ENTITY.*?SYSTEM.*?>/gi, // External entity references
      /<!DOCTYPE.*?\[.*?\]/gis,  // DOCTYPE with internal subset
      /xlink:href\s*=\s*["']\s*javascript:/gi, // JavaScript in links
      /<script.*?>.*?<\/script>/gis // Script tags
    ];

    return dangerousPatterns.some(pattern => pattern.test(xmlString));
  }

  private parseNode(element: Element, depth: number, stats: XmlViewerStats): XmlNode[] {
    console.log('XmlUtilsService: Parsing node:', element.tagName, 'depth:', depth);
    
    const nodes: XmlNode[] = [];
    
    try {
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
        expanded: depth < 2, // Auto-expand first two levels
        hasChildren: childElements.length > 0 || hasTextContent,
        selfClosing: childElements.length === 0 && !hasTextContent,
        content: hasTextContent ? textContent : undefined,
        children: [],
        type: ''
      };

      stats.totalNodes++;
      stats.maxDepth = Math.max(stats.maxDepth, depth);

      if (childElements.length > 0) {
        node.children = childElements.flatMap(child => 
          this.parseNode(child as Element, depth + 1, stats)
        );
      }

      nodes.push(node);
    } catch (error) {
      console.error('XmlUtilsService: Error parsing node:', element.tagName, error);
    }

    return nodes;
  }

  formatXml(xmlString: string): string {
    console.log('XmlUtilsService: Formatting XML, input length:', xmlString.length);
    try {
      // Validate before formatting
      const validation = this.validateXml(xmlString);
      if (!validation.isValid) {
        console.warn('XmlUtilsService: Cannot format invalid XML:', validation.error);
        return xmlString;
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      const serializer = new XMLSerializer();
      const formatted = serializer.serializeToString(xmlDoc);
      const result = this.formatXmlString(formatted);
      console.log('XmlUtilsService: XML formatted successfully');
      return result;
    } catch (error) {
      console.error('XmlUtilsService: Formatting error:', error);
      return xmlString;
    }
  }

  private formatXmlString(xml: string): string {
    try {
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
    } catch (error) {
      console.error('XmlUtilsService: Error in formatXmlString:', error);
      return xml;
    }
  }

  minifyXml(xmlString: string): string {
    console.log('XmlUtilsService: Minifying XML, input length:', xmlString.length);
    try {
      // Validate before minifying
      const validation = this.validateXml(xmlString);
      if (!validation.isValid) {
        console.warn('XmlUtilsService: Cannot minify invalid XML:', validation.error);
        return xmlString;
      }

      let minified = xmlString;
      
      // Remove comments
      minified = minified.replace(/<!--[\s\S]*?-->/g, '');
      
      // Remove extra whitespace between tags
      minified = minified.replace(/>\s+</g, '><');
      
      // Remove whitespace at the beginning and end
      minified = minified.trim();
      
      // Remove extra whitespace within tags (but preserve attribute spacing)
      minified = minified.replace(/\s+/g, ' ');
      
      // Remove whitespace around equal signs in attributes
      minified = minified.replace(/\s*=\s*/g, '=');
      
      // Remove line breaks and tabs
      minified = minified.replace(/\r?\n|\r|\t/g, '');
      
      console.log('XmlUtilsService: XML minified successfully, output length:', minified.length);
      return minified;
    } catch (error) {
      console.error('XmlUtilsService: Minification error:', error);
      return xmlString;
    }
  }

  validateXml(xmlString: string): { isValid: boolean; error?: string } {
    console.log('XmlUtilsService: Validating XML, input length:', xmlString?.length);
    try {
      if (!xmlString?.trim()) {
        return { isValid: false, error: 'XML content is empty' };
      }

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
      if (parseError) {
        const errorText = parseError.textContent || 'Invalid XML format';
        console.error('XmlUtilsService: XML validation failed:', errorText);
        return { 
          isValid: false, 
          error: errorText 
        };
      }
      
      console.log('XmlUtilsService: XML validation successful');
      return { isValid: true };
    } catch (error) {
      console.error('XmlUtilsService: Validation error:', error);
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : 'Unknown validation error' 
      };
    }
  }

  tryRepairXml(xmlString: string): string {
    console.log('XmlUtilsService: Attempting to repair XML, input length:', xmlString.length);
    try {
      let repaired = xmlString.trim();
      
      // Add XML declaration if missing and content looks like XML
      if (!repaired.startsWith('<?xml') && repaired.startsWith('<')) {
        repaired = `<?xml version="1.0" encoding="UTF-8"?>\n${repaired}`;
        console.log('XmlUtilsService: Added missing XML declaration');
      }
      
      // Basic tag balancing
      const openTags: string[] = [];
      const tagRegex = /<(\/?)([^>\s\/]+)([^>]*)\s*(\/?)>/g;
      let match;
      
      while ((match = tagRegex.exec(repaired)) !== null) {
        const [fullTag, isClosing, tagName, attributes, isSelfClosing] = match;
        
        if (isSelfClosing) {
          continue; // Self-closing tags don't affect balance
        }
        
        if (isClosing) {
          // Find matching open tag
          const lastIndex = openTags.lastIndexOf(tagName);
          if (lastIndex !== -1) {
            openTags.splice(lastIndex, 1);
          }
        } else {
          openTags.push(tagName);
        }
      }
      
      // Close any unclosed tags
      while (openTags.length > 0) {
        const tag = openTags.pop();
        if (tag) {
          repaired += `</${tag}>`;
        }
      }
      
      // Validate the repaired XML
      const validation = this.validateXml(repaired);
      if (validation.isValid) {
        console.log('XmlUtilsService: XML repair successful');
      } else {
        console.warn('XmlUtilsService: XML repair attempted but result is still invalid:', validation.error);
      }
      
      return repaired;
    } catch (error) {
      console.error('XmlUtilsService: Error in tryRepairXml:', error);
      return xmlString;
    }
  }

  downloadXml(xmlString: string, filename: string = 'document.xml'): void {
    console.log('XmlUtilsService: Downloading XML as:', filename);
    try {
      const blob = new Blob([xmlString], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      console.log('XmlUtilsService: XML download initiated');
    } catch (error) {
      console.error('XmlUtilsService: Error downloading XML:', error);
    }
  }

  setAllNodesExpanded(nodes: XmlNode[], expanded: boolean): void {
    console.log('XmlUtilsService: Setting all nodes expanded to:', expanded);
    try {
      nodes.forEach(node => {
        if (node.hasChildren) {
          node.expanded = expanded;
          if (node.children) {
            this.setAllNodesExpanded(node.children, expanded);
          }
        }
      });
    } catch (error) {
      console.error('XmlUtilsService: Error in setAllNodesExpanded:', error);
    }
  }

  setNodesExpandedToLevel(nodes: XmlNode[], level: number): void {
    console.log('XmlUtilsService: Setting nodes expanded to level:', level);
    try {
      nodes.forEach(node => {
        if (node.hasChildren) {
          node.expanded = node.depth < level;
          if (node.children) {
            this.setNodesExpandedToLevel(node.children, level);
          }
        }
      });
    } catch (error) {
      console.error('XmlUtilsService: Error in setNodesExpandedToLevel:', error);
    }
  }

  async loadXmlFromUrl(url: string): Promise<{ content: string; error?: string }> {
    console.log('XmlUtilsService: Loading XML from URL:', url);
    try {
      const cleanUrl = url.trim();
      
      if (!cleanUrl) {
        console.error('XmlUtilsService: Empty URL provided');
        return { content: '', error: 'Please enter a URL' };
      }

      // Validate URL format
      try {
        new URL(cleanUrl);
      } catch {
        console.error('XmlUtilsService: Invalid URL format:', cleanUrl);
        return { content: '', error: 'Invalid URL format' };
      }

      // Try direct fetch first
      let content: string | null = null;
      let error: string | null = null;

      try {
        const response = await fetch(cleanUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/xml, text/xml, */*'
          }
        });

        if (response.ok) {
          content = await response.text();
          console.log('XmlUtilsService: Successfully loaded XML from URL, length:', content.length);
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (directError) {
        error = `Failed to load from URL: ${directError instanceof Error ? directError.message : 'Unknown error'}`;
        console.error('XmlUtilsService: Error loading XML from URL:', error);
      }

      if (!content) {
        return { content: '', error: error || 'Failed to load XML from URL' };
      }

      // Validate the content
      if (!content.trim()) {
        console.error('XmlUtilsService: Empty response received from URL');
        return { content: '', error: 'Empty response received' };
      }

      // Check if content is XML
      const trimmedContent = content.trim();
      const isXml = trimmedContent.startsWith('<?xml') || 
                   trimmedContent.startsWith('<') ||
                   /^<\w+[\s>]/.test(trimmedContent);

      if (!isXml) {
        console.error('XmlUtilsService: URL does not contain valid XML content');
        return { content: '', error: 'The URL does not contain valid XML content' };
      }

      // Final validation
      const validation = this.validateXml(content);
      if (!validation.isValid) {
        console.error('XmlUtilsService: Loaded XML content is invalid:', validation.error);
        return { content: '', error: validation.error || 'Invalid XML format' };
      }

      console.log('XmlUtilsService: XML loaded and validated successfully from URL');
      return { content };

    } catch (error) {
      console.error('XmlUtilsService: URL loading error:', error);
      return { 
        content: '', 
        error: `Failed to load XML from URL: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  readXmlFromFile(file: File): Promise<{ content: string; error?: string }> {
    console.log('XmlUtilsService: Reading XML from file:', file.name);
    return new Promise((resolve) => {
      try {
        if (!file) {
          console.error('XmlUtilsService: No file provided');
          resolve({ content: '', error: 'No file selected' });
          return;
        }

        const isXmlFile = file.type.includes('xml') || 
                         file.name.toLowerCase().endsWith('.xml') ||
                         file.type === 'text/plain' ||
                         file.type === 'application/xml' ||
                         file.type === 'text/xml';

        if (!isXmlFile) {
          console.error('XmlUtilsService: Invalid file type:', file.type);
          resolve({ content: '', error: 'Please select an XML file (.xml)' });
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          console.error('XmlUtilsService: File too large:', file.size);
          resolve({ content: '', error: 'File size too large. Maximum 10MB allowed.' });
          return;
        }

        if (file.size === 0) {
          console.error('XmlUtilsService: File is empty');
          resolve({ content: '', error: 'File is empty' });
          return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            if (!content) {
              console.error('XmlUtilsService: Failed to read file content');
              resolve({ content: '', error: 'Failed to read file content' });
              return;
            }
            console.log('XmlUtilsService: File read successfully, length:', content.length);
            resolve({ content });
          } catch (error) {
            console.error('XmlUtilsService: Error processing file content:', error);
            resolve({ content: '', error: 'Failed to process file content' });
          }
        };
        
        reader.onerror = () => {
          console.error('XmlUtilsService: Error reading file');
          resolve({ content: '', error: 'Error reading file' });
        };
        
        reader.readAsText(file, 'UTF-8');
      } catch (error) {
        console.error('XmlUtilsService: Error in readXmlFromFile:', error);
        resolve({ content: '', error: 'Error processing file' });
      }
    });
  }

  getWorkingExamples(): string[] {
    console.log('XmlUtilsService: Getting working examples');
    return [
      'https://www.w3schools.com/xml/note.xml',
      'https://www.w3schools.com/xml/cd_catalog.xml',
      'https://www.w3schools.com/xml/plant_catalog.xml',
      'https://feeds.bbci.co.uk/news/rss.xml?format=xml'
    ];
  }

  // Helper method to count nodes for stats
  countNodes(nodes: XmlNode[]): { total: number; maxDepth: number; totalAttributes: number } {
    console.log('XmlUtilsService: Counting nodes');
    try {
      let total = 0;
      let maxDepth = 0;
      let totalAttributes = 0;

      const countRecursive = (nodeList: XmlNode[], currentDepth: number) => {
        nodeList.forEach(node => {
          total++;
          maxDepth = Math.max(maxDepth, currentDepth);
          totalAttributes += node.attributes?.length || 0;
          
          if (node.children && node.children.length > 0) {
            countRecursive(node.children, currentDepth + 1);
          }
        });
      };

      countRecursive(nodes, 0);
      console.log('XmlUtilsService: Node count - total:', total, 'maxDepth:', maxDepth, 'attributes:', totalAttributes);
      return { total, maxDepth, totalAttributes };
    } catch (error) {
      console.error('XmlUtilsService: Error in countNodes:', error);
      return { total: 0, maxDepth: 0, totalAttributes: 0 };
    }
  }
}