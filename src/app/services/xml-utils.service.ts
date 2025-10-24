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
  
  // List of CORS proxies to try
  private corsProxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    'https://crossorigin.me/'
  ];

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
      // Clean the URL
      const cleanUrl = url.trim();
      
      if (!cleanUrl) {
        return { content: '', error: 'Please enter a URL' };
      }

      // Validate URL format
      try {
        new URL(cleanUrl);
      } catch {
        return { content: '', error: 'Invalid URL format' };
      }

      console.log('Loading XML from URL:', cleanUrl);

      // Try multiple approaches
      let content: string | null = null;
      let error: string | null = null;

      // Approach 1: Try direct fetch with no-cors (for simple requests)
      try {
        console.log('Trying direct fetch...');
        const response = await fetch(cleanUrl, {
          method: 'GET',
          mode: 'no-cors', // Use no-cors to avoid CORS issues
          headers: {
            'Accept': 'application/xml, text/xml, */*'
          }
        });

        if (response.type === 'opaque') {
          // With no-cors, we can't read the response, but we can try to fetch via proxy
          console.log('No-CORS request made, trying proxy...');
        } else if (response.ok) {
          content = await response.text();
        }
      } catch (directError) {
        console.log('Direct fetch failed:', directError);
      }

      // Approach 2: Try multiple CORS proxies
      if (!content) {
        for (const proxy of this.corsProxies) {
          try {
            console.log(`Trying proxy: ${proxy}`);
            const proxyUrl = proxy + encodeURIComponent(cleanUrl);
            const response = await fetch(proxyUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/xml, text/xml, */*',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });

            if (response.ok) {
              content = await response.text();
              console.log('Success with proxy:', proxy);
              break;
            } else {
              console.log(`Proxy ${proxy} failed with status:`, response.status);
            }
          } catch (proxyError) {
            console.log(`Proxy ${proxy} error:`, proxyError);
          }
        }
      }

      // Approach 3: Try JSONP-like approach for public APIs
      if (!content) {
        content = await this.tryJsonPApproach(cleanUrl);
      }

      if (!content) {
        throw new Error('All fetch attempts failed. The server may be blocking requests from your location.');
      }

      // Validate the content
      if (!content.trim()) {
        throw new Error('Empty response received');
      }

      // Check if content is XML
      const trimmedContent = content.trim();
      const isXml = trimmedContent.startsWith('<?xml') || 
                   trimmedContent.startsWith('<') ||
                   /^<\w+[\s>]/.test(trimmedContent) ||
                   trimmedContent.includes('<?xml');

      if (!isXml) {
        // Try to extract XML from HTML response
        const xmlMatch = trimmedContent.match(/<\?xml[\s\S]*?<\/\w+>$/m) || 
                        trimmedContent.match(/<rss[\s\S]*?<\/rss>/mi) ||
                        trimmedContent.match(/<feed[\s\S]*?<\/feed>/mi);
        
        if (xmlMatch) {
          content = xmlMatch[0];
        } else {
          throw new Error('The URL does not contain valid XML content');
        }
      }

      // Final validation
      const validation = this.validateXml(content);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid XML format');
      }

      return { content };

    } catch (error) {
      console.error('URL loading error:', error);
      
      let errorMessage = 'Failed to load XML from URL.\n\n';
      
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error occurred.';
      }

      errorMessage += '\n\nPossible solutions:';
      errorMessage += '\n• Try a different XML URL from the examples below';
      errorMessage += '\n• Check if the URL works in your browser';
      errorMessage += '\n• The server may be blocking external requests';
      errorMessage += '\n• Try a local XML file instead';
      
      return { 
        content: '', 
        error: errorMessage
      };
    }
  }

  private async tryJsonPApproach(url: string): Promise<string | null> {
    // For specific known APIs that support JSONP or have public access
    try {
      // This is a fallback for specific cases
      if (url.includes('rss') || url.includes('feed')) {
        // Try with different user agent
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml'
          }
        });
        
        if (response.ok) {
          return await response.text();
        }
      }
    } catch (error) {
      console.log('JSONP approach failed:', error);
    }
    return null;
  }

  readXmlFromFile(file: File): Promise<{ content: string; error?: string }> {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ content: '', error: 'No file selected' });
        return;
      }

      const isXmlFile = file.type.includes('xml') || 
                       file.name.toLowerCase().endsWith('.xml') ||
                       file.type === 'text/plain' ||
                       file.type === 'application/xml' ||
                       file.type === 'text/xml';

      if (!isXmlFile) {
        resolve({ content: '', error: 'Please select an XML file (.xml)' });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        resolve({ content: '', error: 'File size too large. Maximum 10MB allowed.' });
        return;
      }

      if (file.size === 0) {
        resolve({ content: '', error: 'File is empty' });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            resolve({ content: '', error: 'Failed to read file content' });
            return;
          }
          resolve({ content });
        } catch (error) {
          resolve({ content: '', error: 'Failed to process file content' });
        }
      };
      
      reader.onerror = () => {
        resolve({ content: '', error: 'Error reading file' });
      };
      
      reader.readAsText(file, 'UTF-8');
    });
  }

  // Method to get working example URLs
  getWorkingExamples(): string[] {
    return [
      'https://www.w3schools.com/xml/note.xml',
      'https://www.w3schools.com/xml/cd_catalog.xml',
      'https://www.w3schools.com/xml/plant_catalog.xml',
      'https://feeds.bbci.co.uk/news/rss.xml?format=xml',
      'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
      'https://feeds.npr.org/1001/rss.xml'
    ];
  }
}