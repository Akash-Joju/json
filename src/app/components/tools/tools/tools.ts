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
        <h1>JSON Tools Collection</h1>
        <p class="subtitle">Various utilities for working with JSON data</p>
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

        <div class="tool-card" routerLink="/json-differ">
          <div class="tool-icon">⚡</div>
          <h3>JSON Differ</h3>
          <p>Compare two JSON objects and find differences with visual highlighting</p>
          <div class="tool-features">
            <span class="feature-tag">Diff View</span>
            <span class="feature-tag">Side by Side</span>
            <span class="feature-tag">Visual Compare</span>
          </div>
        </div>

        <div class="tool-card coming-soon">
          <div class="tool-icon">🔧</div>
          <h3>XML Viewer</h3>
          <p>Visualize and explore JSON data with our interactive XML viewer (Coming Soon)</p>
          <div class="tool-features">
            <span class="feature-tag">Schema Validation</span>
            <span class="feature-tag">Error Detection</span>
          </div>
        </div>

        <div class="tool-card coming-soon">
          <div class="tool-icon">🔄</div>
          <h3>XML Differ</h3>
          <p>Compare two XML and find differences with visual highlighting (Coming Soon)</p>
          <div class="tool-features">
            <span class="feature-tag">XML</span>
            <span class="feature-tag">CSV</span>
            <span class="feature-tag">YAML</span>
          </div>
        </div>

        <!-- <div class="tool-card coming-soon">
          <div class="tool-icon">📊</div>
          <h3>JSON Generator</h3>
          <p>Generate mock JSON data for testing (Coming Soon)</p>
          <div class="tool-features">
            <span class="feature-tag">Mock Data</span>
            <span class="feature-tag">Custom Schema</span>
          </div>
        </div> -->

        <div class="tool-card coming-soon">
          <div class="tool-icon">🔐</div>
          <h3>JSON Convertor</h3>
          <p>Converting JSON(Coming Soon)</p>
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