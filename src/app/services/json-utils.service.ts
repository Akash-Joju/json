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
  parentObject?: any;
  parentPath?: string;
  isArrayItem?: boolean;
  arrayParentPath?: string;
  arrayIndex?: number;
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

  // Enhanced search method with array support
  searchInJson(jsonData: any, searchTerm: string): SearchResult[] {
    const results: SearchResult[] = [];
    const searchTermLower = searchTerm.toLowerCase();
    
    const searchRecursive = (obj: any, currentPath: string = '', parentPath: string = '', isInArray: boolean = false, arrayIndex: number = -1) => {
      if (typeof obj === 'object' && obj !== null) {
        const isArray = Array.isArray(obj);
        
        Object.keys(obj).forEach((key, index) => {
          const value = obj[key];
          const newPath = currentPath ? `${currentPath}.${key}` : key;
          const newParentPath = isArray ? currentPath : newPath;
          
          // Check if key matches search
          const keyMatches = key.toLowerCase().includes(searchTermLower);
          
          // Check if value matches search
          let valueMatches = false;
          
          if (typeof value === 'string') {
            valueMatches = value.toLowerCase().includes(searchTermLower);
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            valueMatches = value.toString().toLowerCase().includes(searchTermLower);
          } else if (value === null) {
            valueMatches = 'null'.includes(searchTermLower);
          }
          
          if (keyMatches || valueMatches) {
            results.push({
              path: newPath,
              key: key,
              value: value,
              fullPath: newPath,
              matchesKey: keyMatches,
              matchesValue: valueMatches,
              parentObject: obj,
              parentPath: parentPath,
              isArrayItem: isArray,
              arrayParentPath: isArray ? currentPath : undefined,
              arrayIndex: isArray ? index : -1
            });
          }
          
          // Recursively search nested objects/arrays
          if (typeof value === 'object' && value !== null) {
            searchRecursive(
              value, 
              newPath, 
              newParentPath, 
              Array.isArray(value),
              Array.isArray(obj) ? index : -1
            );
          }
        });
      }
    };
    
    searchRecursive(jsonData, '', '', Array.isArray(jsonData));
    return results;
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
        expanded: false,
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
        expanded: false,
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

  // Helper method to get array parent path
  getArrayParentPath(path: string): string | null {
    const arrayMatch = path.match(/^(.+)\[\d+\](?:\..*)?$/);
    return arrayMatch ? arrayMatch[1] : null;
  }

  // Helper method to check if path is in array
  isPathInArray(path: string): boolean {
    return /\[\d+\]/.test(path);
  }

  // Helper method to get array index from path
  getArrayIndex(path: string): number {
    const match = path.match(/\[(\d+)\]/);
    return match ? parseInt(match[1]) : -1;
  }
}