// tools.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="tools-container">
      <div class="tools-header">
        <h1>JSON & XML Tools Collection</h1>
        <p class="subtitle">Various utilities for working with JSON and XML data</p>
      </div>

      <div class="tools-grid">
        <div class="tool-card" routerLink="/viewer">
          <div class="tool-icon">🔍</div>
          <h3>JSON Viewer</h3>
          <p>Visualize and explore JSON data with our interactive tree viewer</p>
          <div class="tool-features">
            <span class="feature-tag">Tree View</span>
            <span class="feature-tag">Syntax Highlight</span>
            <span class="feature-tag">Validation</span>
          </div>
        </div>

        <div class="tool-card" routerLink="/xml-viewer">
          <div class="tool-icon">🔧</div>
          <h3>XML Viewer</h3>
          <p>Visualize and explore XML data with our interactive tree viewer</p>
          <div class="tool-features">
            <span class="feature-tag">Tree View</span>
            <span class="feature-tag">Syntax Highlight</span>
            <span class="feature-tag">Validation</span>
          </div>
        </div>

        <div class="tool-card " routerLink="/json-differ">
          <div class="tool-icon">⚡</div>
          <h3>JSON Differ</h3>
          <p>Compare two JSON objects and find differences with visual highlighting</p>
          <div class="tool-features">
            <span class="feature-tag">Diff View</span>
            <span class="feature-tag">Side by Side</span>
            <span class="feature-tag">Visual Compare</span>
          </div>
        </div>

        <!-- NEW: XML Code Editor Tool -->
        <!-- <div class="tool-card" routerLink="/xml-code">
          <div class="tool-icon">📝</div>
          <h3>XML Code Editor</h3>
          <p>Advanced XML editor with syntax highlighting, folding, and formatting features</p>
          <div class="tool-features">
            <span class="feature-tag">Line Numbers</span>
            <span class="feature-tag">Code Folding</span>
            <span class="feature-tag">Syntax Highlight</span>
            <span class="feature-tag">Auto Format</span>
          </div>
        </div> -->

        <!-- <div class="tool-card" routerLink="/xml-viewer">
          <div class="tool-icon">🔧</div>
          <h3>XML Viewer</h3>
          <p>Visualize and explore XML data with our interactive tree viewer</p>
          <div class="tool-features">
            <span class="feature-tag">Tree View</span>
            <span class="feature-tag">Syntax Highlight</span>
            <span class="feature-tag">Validation</span>
          </div>
        </div> -->

        <div class="tool-card " routerLink="/xml-differ">
          <div class="tool-icon">🔄</div>
          <h3>XML Differ</h3>
          <p>Compare two XML documents and find differences with visual highlighting</p>
          <div class="tool-features">
            <span class="feature-tag">XML Compare</span>
            <span class="feature-tag">Side by Side</span>
            <span class="feature-tag">Visual Diff</span>
          </div>
        </div>

        <div class="tool-card coming-soon">
          <div class="tool-icon">🔐</div>
          <h3>JSON Convertor</h3>
          <p>Converting JSON (Coming Soon)</p>
          <div class="tool-features">
            <span class="feature-tag">Conversion</span>
            <span class="feature-tag">Batch Processing</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./tools.scss']
})
export class ToolsComponent {}