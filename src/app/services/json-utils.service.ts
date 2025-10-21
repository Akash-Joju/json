import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Interface for our JSON nodes
export interface JsonNode {
  key: string;
  value: any;
  type: string;
  expanded: boolean;
  children?: JsonNode[];
  path: string;
}

// Enhanced search result interface
export interface SearchResult {
  path: string;
  key: string;
  value: any;
  fullPath: string;
  matchesKey: boolean;
  matchesValue: boolean;
  highlightedValue?: string;
  parentObject?: any;
  parentPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JsonUtilsService {
  private http = inject(HttpClient);
  
  // Validate JSON string
  validateJson(jsonString: string): { isValid: boolean; error?: string } {
    try {
      JSON.parse(jsonString);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: (error as Error).message 
      };
    }
  }

  // Format JSON with proper indentation
  formatJson(jsonString: string): string {
    const result = this.validateJson(jsonString);
    if (!result.isValid) {
      throw new Error(result.error);
    }
    
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  }

  // Minify JSON (remove spaces)
  minifyJson(jsonString: string): string {
    const result = this.validateJson(jsonString);
    if (!result.isValid) {
      throw new Error(result.error);
    }
    
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed);
  }

  // Read JSON file
  async readJsonFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Validate the JSON
          JSON.parse(content);
          resolve(content);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Load JSON from URL
  async loadJsonFromUrl(url: string): Promise<string> {
    // Basic URL validation
    if (!url.trim()) {
      throw new Error('URL cannot be empty');
    }

    // Add https if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      const response = await this.http.get(url, { responseType: 'text' }).toPromise();
      
      if (!response) {
        throw new Error('Empty response from URL');
      }

      // Validate JSON
      JSON.parse(response);
      return response;
      
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('JSON file not found at the provided URL');
      } else if (error.status === 403) {
        throw new Error('Access forbidden to the provided URL');
      } else {
        throw new Error('Failed to load JSON from URL: ' + error.message);
      }
    }
  }

  // Enhanced search method
  searchInJson(jsonData: any, searchTerm: string): SearchResult[] {
    const results: SearchResult[] = [];
    
    const searchRecursive = (obj: any, currentPath: string, parentObj?: any, parentPath?: string) => {
      if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach(key => {
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          const value = obj[key];
          const fullPath = currentPath ? `${currentPath}.${key}` : key;
          
          // Check if key matches search
          const keyMatches = key.toLowerCase().includes(searchTerm.toLowerCase());
          
          // Check if value matches search
          let valueMatches = false;
          let highlightedValue = '';
          
          if (typeof value === 'string') {
            valueMatches = value.toLowerCase().includes(searchTerm.toLowerCase());
            if (valueMatches) {
              highlightedValue = this.highlightText(value, searchTerm);
            }
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            const stringValue = value.toString();
            valueMatches = stringValue.toLowerCase().includes(searchTerm.toLowerCase());
            if (valueMatches) {
              highlightedValue = this.highlightText(stringValue, searchTerm);
            }
          }
          
          if (keyMatches || valueMatches) {
            results.push({
              path: newPath,
              key: key,
              value: value,
              fullPath: fullPath,
              matchesKey: keyMatches,
              matchesValue: valueMatches,
              highlightedValue: highlightedValue,
              parentObject: keyMatches ? obj : parentObj,
              parentPath: parentPath
            });
          }
          
          // Recursively search nested objects/arrays
          if (typeof value === 'object' && value !== null) {
            searchRecursive(value, newPath, obj, newPath);
          }
        });
      }
    };
    
    searchRecursive(jsonData, '');
    return results;
  }

  // Get parent object/array for a search result
  getParentObjectForSearch(jsonData: any, searchResult: SearchResult): any {
    if (searchResult.parentObject) {
      return searchResult.parentObject;
    }
    
    // If no parent object found, try to extract from path
    const pathParts = searchResult.path.split('.');
    if (pathParts.length > 1) {
      let current = jsonData;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (current && typeof current === 'object') {
          current = current[pathParts[i]];
        } else {
          break;
        }
      }
      return current;
    }
    
    return null;
  }

  // Helper method for text highlighting
  private highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Helper method to escape regex special characters
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Find the JSON node by path for navigation
  findNodeByPath(nodes: JsonNode[], path: string): JsonNode | null {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        const found = this.findNodeByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  // Expand all parent nodes to show the searched node
  expandPath(nodes: JsonNode[], path: string): void {
    const pathParts = path.split('.');
    let currentPath = '';
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath = currentPath ? `${currentPath}.${pathParts[i]}` : pathParts[i];
      const node = this.findNodeByPath(nodes, currentPath);
      if (node) {
        node.expanded = true;
      }
    }
  }

  // Convert JSON object to tree structure
  jsonToTree(obj: any, key: string = 'root', path: string = ''): JsonNode[] {
    if (obj === null || obj === undefined) {
      return [{
        key,
        value: null,
        type: 'null',
        expanded: false,
        path: path ? `${path}.${key}` : key
      }];
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      const children = obj.map((item, index) => 
        this.jsonToTree(item, index.toString(), path ? `${path}.${key}` : key)[0]
      );
      
      return [{
        key,
        value: `Array[${obj.length}]`,
        type: 'array',
        expanded: true,
        children,
        path: path ? `${path}.${key}` : key
      }];
    }

    // Handle objects
    if (typeof obj === 'object') {
      const children = Object.keys(obj).map(childKey => 
        this.jsonToTree(obj[childKey], childKey, path ? `${path}.${key}` : key)[0]
      );
      
      return [{
        key,
        value: `Object{${children.length}}`,
        type: 'object',
        expanded: true,
        children,
        path: path ? `${path}.${key}` : key
      }];
    }

    // Handle primitive values
    return [{
      key,
      value: obj,
      type: typeof obj,
      expanded: false,
      path: path ? `${path}.${key}` : key
    }];
  }
}