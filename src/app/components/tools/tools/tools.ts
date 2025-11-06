// tools.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="tools-section">
      <h2 class="section-title">Tools</h2>

      <div class="tools-grid">
        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/brain.svg" alt="" />
          </div>
          <h3>JSON Viewer</h3>
          <p>Pretty print and explore JSON instantly.</p>
          <a routerLink="/viewer" class="card-cta">Open Tool →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/arrow-both.svg" alt="" />
          </div>
          <h3>JSON Diff</h3>
          <p>Compare two JSON files side by side.</p>
          <a routerLink="/json-differ" class="card-cta">Compare Now →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/a-b-2.svg" alt="" />
          </div>
          <h3>XML Compare</h3>
          <p>Spot differences in XML structures.</p>
          <a routerLink="/xml-differ" class="card-cta">Try XML Diff →</a>
        </article>

        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/api-app-off.svg" alt="" />
          </div>
          <h3>JSON ↔ CSV Converter</h3>
          <p>Convert between structured formats in one click.</p>
          <a routerLink="/json-csv" class="card-cta">Convert Data →</a>
        </article>


        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/activity.svg" alt="" />
          </div>
          <h3>XML Viewer</h3>
          <p>Beautify and analyze XML Documents</p>
          <a routerLink="/xml-viewer" class="card-cta">Open Viewer →</a>
        </article>


        <article class="tool-card">
          <div class="tool-icon">
            <img src="assets/icons/article.svg" alt="" />
          </div>
          <h3>XML ↔ CSV Converter</h3>
          <p>Convert between structured formats in one click.</p>
          <a routerLink="/xml-csv" class="card-cta">Open Converter →</a>
        </article>


          
      </div>
    </section>

  `,
  styleUrls: ['./tools.scss']
})
export class ToolsComponent {}