// xml-code-editor.component.ts
import { 
  Component, 
  ElementRef, 
  ViewChild, 
  AfterViewInit, 
  Input, 
  Output, 
  EventEmitter, 
  OnChanges, 
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface XmlLine {
  number: number;
  content: string;
  indentLevel: number;
  isOpeningTag: boolean;
  isClosingTag: boolean;
  tagName: string;
  isSelfClosing: boolean;
  foldable: boolean;
  folded: boolean;
  parentLine?: number;
  closingLine?: number;
  hasChildren?: boolean;
}

@Component({
  selector: 'app-xml-code-editor',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="xml-editor-page">
      <!-- Header with Back Button -->
      <div class="page-header">
        <button class="back-button" routerLink="/tools">
          ← Back to Tools
        </button>
        <h1>XML Code Editor</h1>
        <p class="page-subtitle">Advanced XML editing with syntax highlighting and code folding</p>
      </div>

      <!-- Editor Container -->
      <div class="editor-main-container">
        <div class="xml-editor-container">
          <div class="editor-header">
            <span class="editor-title">XML Editor</span>
            <div class="editor-actions">
              <button (click)="formatXml()" class="format-btn" title="Format XML">
                <span>🔧</span> Format
              </button>
              <button (click)="foldAll()" class="fold-btn" title="Fold All">
                <span>📁</span> Fold All
              </button>
              <button (click)="unfoldAll()" class="unfold-btn" title="Unfold All">
                <span>📂</span> Unfold All
              </button>
            </div>
          </div>
          
          <div class="editor-wrapper" #editorWrapper>
            <!-- Line numbers and code in same scrollable container -->
            <div class="scroll-container" #scrollContainer>
              <div class="code-area">
                <!-- Line numbers -->
                <div class="line-numbers">
                  @for (line of xmlLines; track line.number) {
                    <div 
                      class="line-number"
                      [class.foldable]="line.foldable"
                      [class.folded]="line.folded"
                      [class.hidden]="isLineHiddenByFold(line.number - 1)"
                      (click)="toggleFold(line.number)"
                    >
                      @if (!isLineHiddenByFold(line.number - 1)) {
                        {{ line.number }}
                        @if (line.foldable) {
                          <span class="fold-icon">
                            {{ line.folded ? '▶' : '▼' }}
                          </span>
                        }
                      }
                    </div>
                  }
                </div>
                
                <!-- Code content -->
                <div class="code-content">
                  <!-- Indentation guides -->
                  <div class="indentation-guides">
                    @for (line of xmlLines; track line.number; let i = $index) {
                      <div 
                        class="indentation-line"
                        [class.hidden]="isLineHiddenByFold(i)"
                        [style.height.px]="lineHeight"
                      >
                        @for (level of getIndentLevels(line.indentLevel); track level) {
                          <div 
                            class="indent-level"
                            [class.has-children]="hasChildrenAtLevel(i, level)"
                            [style.left.px]="level * indentWidth + 12"
                          ></div>
                        }
                      </div>
                    }
                  </div>

                  <textarea
                    #editor
                    class="code-editor"
                    [value]="xmlContent"
                    (input)="onContentChange($event)"
                    (keydown)="onKeyDown($event)"
                    (scroll)="syncScroll($event)"
                    spellcheck="false"
                    placeholder="Paste your XML here or start typing..."
                  ></textarea>
                  
                  <!-- Code highlighter overlay -->
                  <div class="code-highlighter" #codeHighlighter [innerHTML]="getHighlightedContent()"></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Status bar -->
          <div class="status-bar">
            <span>Lines: {{ xmlLines.length }}</span>
            <span>Foldable: {{ getFoldableCount() }} sections</span>
            <span>Folded: {{ getFoldedCount() }} regions</span>
            <span>Total Characters: {{ xmlContent.length }}</span>
          </div>
        </div>

        <!-- Sample XML Section -->
        <div class="sample-section">
          <h3>Quick Samples</h3>
          <div class="sample-buttons">
            <button (click)="loadSample('mixed')" class="sample-btn">Mixed Tags</button>
            <button (click)="loadSample('nested')" class="sample-btn">Nested Structure</button>
            <button (click)="loadSample('config')" class="sample-btn">Configuration</button>
            <button (click)="clearEditor()" class="sample-btn clear">Clear</button>
          </div>
          <div class="folding-info">
            <h4>Folding Rules:</h4>
            <ul>
              <li>✅ Foldable: Opening and closing tags on separate lines</li>
              <li>❌ Not Foldable: Self-closing tags</li>
              <li>❌ Not Foldable: Both tags on same line</li>
              <li>❌ Not Foldable: XML declaration, comments</li>
            </ul>
          </div>
          <div class="auto-close-info">
            <h4>Auto-Close Feature:</h4>
            <p>Type <code>&lt;tagname&gt;</code> and it will automatically close with <code>&lt;/tagname&gt;</code></p>
          </div>
          <div class="visual-guide-info">
            <h4>Visual Guides:</h4>
            <ul>
              <li><span class="guide-solid"></span> Solid lines: Regular indentation</li>
              <li><span class="guide-dashed"></span> Dashed lines: Has child elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .xml-editor-page {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .back-button {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-bottom: 15px;
      font-size: 14px;
    }

    .back-button:hover {
      background: #5a6268;
    }

    .page-header h1 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }

    .page-subtitle {
      color: #7f8c8d;
      font-size: 1.1em;
      margin: 0;
    }

    .editor-main-container {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 20px;
      align-items: start;
    }

    .xml-editor-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      background: #fafafa;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: #2c3e50;
      color: white;
      border-radius: 8px 8px 0 0;
    }

    .editor-title {
      font-weight: bold;
      font-size: 16px;
    }

    .editor-actions {
      display: flex;
      gap: 10px;
    }

    .editor-actions button {
      padding: 6px 12px;
      border: 1px solid #34495e;
      background: #34495e;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: background 0.2s;
    }

    .editor-actions button:hover {
      background: #4a6572;
    }

    .editor-wrapper {
      position: relative;
      min-height: 500px;
      max-height: 70vh;
      overflow: hidden;
    }

    .scroll-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      background: white;
    }

    .code-area {
      display: flex;
      min-height: 100%;
      position: relative;
    }

    .line-numbers {
      background: #f8f9fa;
      border-right: 1px solid #dee2e6;
      padding: 12px 15px 12px 12px;
      text-align: right;
      user-select: none;
      min-width: 70px;
      color: #6c757d;
      font-size: 13px;
      flex-shrink: 0;
      z-index: 3;
    }

    .line-number {
      height: 21px;
      cursor: default;
      position: relative;
      padding: 0 5px;
      transition: background-color 0.2s;
      white-space: nowrap;
    }

    .line-number.hidden {
      display: none;
    }

    .line-number.foldable {
      cursor: pointer;
      font-weight: bold;
      color: #2c3e50;
      background-color: #e8f4fd;
    }

    .line-number.foldable:hover {
      background: #d1ecf1;
      border-radius: 3px;
    }

    .line-number.foldable.folded {
      background-color: #fff3cd;
    }

    .fold-icon {
      position: absolute;
      right: 2px;
      font-size: 10px;
      color: #17a2b8;
    }

    .code-content {
      position: relative;
      flex: 1;
      min-height: 100%;
    }

    .indentation-guides {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .indentation-line {
      display: flex;
      align-items: flex-start;
      height: 21px;
      position: relative;
    }

    .indentation-line.hidden {
      display: none;
    }

    .indent-level {
      position: absolute;
      top: 0;
      width: 1px;
      height: 100%;
      border-left: 1px solid #e0e0e0;
    }

    .indent-level.has-children {
      border-left: 1px dashed #007acc;
      height: 100%;
    }

    .code-editor {
      width: 100%;
      height: 100%;
      border: none;
      padding: 12px;
      background: transparent;
      color: transparent;
      caret-color: #2c3e50;
      resize: none;
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
    }

    .code-editor:focus {
      outline: none;
    }

    .code-highlighter {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 12px;
      background: white;
      pointer-events: none;
      white-space: pre;
      overflow: hidden;
      z-index: 1;
      border: 1px solid red !important; /* Debug border */
    }

    .xml-tag {
      color: #8e44ad !important;
      font-weight: bold !important;
    }

    .xml-attribute {
      color: #e74c3c !important;
    }

    .xml-value {
      color: #2980b9 !important;
    }

    .xml-data {
      color: #d35400 !important;
      font-weight: normal !important;
    }

    .xml-comment {
      color: #27ae60 !important;
      font-style: italic !important;
    }

    .xml-cdata {
      color: #8e44ad !important;
      font-style: italic !important;
    }

    .xml-declaration {
      color: #2c3e50 !important;
      font-weight: bold !important;
    }

    .folded-content {
      color: #6c757d;
      font-style: italic;
      background: #fff3cd;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .status-bar {
      display: flex;
      justify-content: space-between;
      padding: 8px 20px;
      background: #ecf0f1;
      border-top: 1px solid #bdc3c7;
      font-size: 12px;
      color: #7f8c8d;
      border-radius: 0 0 8px 8px;
    }

    .sample-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .sample-section h3 {
      margin: 0 0 15px 0;
      color: #2c3e50;
    }

    .sample-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .sample-btn {
      padding: 10px 15px;
      border: 1px solid #3498db;
      background: white;
      color: #3498db;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }

    .sample-btn:hover {
      background: #3498db;
      color: white;
    }

    .sample-btn.clear {
      border-color: #e74c3c;
      color: #e74c3c;
      margin-top: 10px;
    }

    .sample-btn.clear:hover {
      background: #e74c3c;
      color: white;
    }

    .folding-info {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #17a2b8;
      margin-bottom: 15px;
    }

    .auto-close-info {
      background: #e8f5e8;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #28a745;
      margin-bottom: 15px;
    }

    .visual-guide-info {
      background: #e8f4fd;
      padding: 15px;
      border-radius: 6px;
      border-left: 4px solid #007acc;
    }

    .folding-info h4,
    .auto-close-info h4,
    .visual-guide-info h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 14px;
    }

    .folding-info ul,
    .auto-close-info ul,
    .visual-guide-info ul {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: #6c757d;
    }

    .folding-info li,
    .auto-close-info li,
    .visual-guide-info li {
      margin-bottom: 4px;
      display: flex;
      align-items: center;
    }

    .auto-close-info p {
      margin: 0;
      font-size: 12px;
      color: #6c757d;
    }

    .auto-close-info code {
      background: #f1f3f4;
      padding: 2px 4px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }

    .guide-solid,
    .guide-dashed {
      display: inline-block;
      width: 20px;
      height: 2px;
      margin-right: 8px;
    }

    .guide-solid {
      background: #e0e0e0;
    }

    .guide-dashed {
      background: repeating-linear-gradient(
        to right,
        #007acc,
        #007acc 2px,
        transparent 2px,
        transparent 4px
      );
    }

    @media (max-width: 1024px) {
      .editor-main-container {
        grid-template-columns: 1fr;
      }
      
      .sample-section {
        order: -1;
      }
    }
  `]
})
export class XmlCodeEditorComponent implements AfterViewInit, OnChanges {
  @ViewChild('editor') editor!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('codeHighlighter') codeHighlighter!: ElementRef<HTMLDivElement>;
  @ViewChild('editorWrapper') editorWrapper!: ElementRef<HTMLDivElement>;
  
  @Input() xmlContent: string = '';
  @Output() contentChange = new EventEmitter<string>();
  
  xmlLines: XmlLine[] = [];
  cursorPosition = { line: 1, column: 1 };
  private isSyncingScroll = false;
  
  // Visual guide settings
  lineHeight = 21;
  indentWidth = 20;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['xmlContent']) {
      this.parseXmlContent();
    }
  }

  ngAfterViewInit() {
    this.parseXmlContent();
    this.setupScrollSync();
    this.cdRef.detectChanges();
  }

  private setupScrollSync() {
    const textarea = this.editor.nativeElement;
    
    textarea.addEventListener('scroll', (event) => {
      if (this.isSyncingScroll) return;
      
      this.isSyncingScroll = true;
      const scrollTop = textarea.scrollTop;
      const scrollLeft = textarea.scrollLeft;
      
      if (this.codeHighlighter) {
        this.codeHighlighter.nativeElement.scrollTop = scrollTop;
        this.codeHighlighter.nativeElement.scrollLeft = scrollLeft;
      }
      
      this.isSyncingScroll = false;
    });
  }

  syncScroll(event: Event) {
    if (this.isSyncingScroll) return;
    
    this.isSyncingScroll = true;
    const textarea = event.target as HTMLTextAreaElement;
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    
    if (this.codeHighlighter) {
      this.codeHighlighter.nativeElement.scrollTop = scrollTop;
      this.codeHighlighter.nativeElement.scrollLeft = scrollLeft;
    }
    
    this.isSyncingScroll = false;
  }

  private parseXmlContent() {
    if (!this.xmlContent) {
      this.xmlLines = [{
        number: 1,
        content: '',
        indentLevel: 0,
        isOpeningTag: false,
        isClosingTag: false,
        tagName: '',
        isSelfClosing: false,
        foldable: false,
        folded: false
      }];
      return;
    }

    const lines = this.xmlContent.split('\n');
    this.xmlLines = [];
    const tagStack: { lineIndex: number, tagName: string, indentLevel: number }[] = [];

    // First pass: identify all tags and their positions
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const indentLevel = this.getIndentLevel(line);
      
      const isOpeningTag = trimmed.startsWith('<') && 
                          !trimmed.startsWith('</') && 
                          !trimmed.endsWith('/>') && 
                          !trimmed.startsWith('<?') &&
                          !trimmed.startsWith('<!');
      const isClosingTag = trimmed.startsWith('</');
      const isSelfClosing = trimmed.endsWith('/>');
      
      let tagName = '';
      if (isOpeningTag || isClosingTag || isSelfClosing) {
        const match = trimmed.match(/<(\/)?([^\\s>]+)/);
        tagName = match ? match[2] : '';
      }

      const xmlLine: XmlLine = {
        number: index + 1,
        content: line,
        indentLevel,
        isOpeningTag,
        isClosingTag,
        tagName,
        isSelfClosing,
        foldable: false,
        folded: false,
        parentLine: undefined,
        closingLine: undefined,
        hasChildren: false
      };

      this.xmlLines.push(xmlLine);
    });

    // Second pass: determine foldable sections and children
    this.determineFoldableSections();
    this.determineChildRelationships();
  }

  private determineFoldableSections() {
    // Store current folding state before resetting
    const foldedStates = new Map<number, boolean>();
    this.xmlLines.forEach((line, index) => {
      if (line.foldable) {
        foldedStates.set(index, line.folded);
      }
    });

    // Reset all foldable flags
    this.xmlLines.forEach(line => line.foldable = false);

    for (let i = 0; i < this.xmlLines.length; i++) {
      const line = this.xmlLines[i];
      
      if (line.isOpeningTag && !line.isSelfClosing) {
        // Find the matching closing tag
        const closingLineIndex = this.findMatchingClosingTag(i, line.tagName, line.indentLevel);
        
        if (closingLineIndex !== -1 && closingLineIndex > i) {
          // Check if there are any lines between opening and closing tags
          const hasContentBetween = this.hasContentBetween(i, closingLineIndex);
          
          if (hasContentBetween) {
            line.foldable = true;
            line.closingLine = closingLineIndex + 1;
            
            // Restore previous folding state if it exists
            if (foldedStates.has(i)) {
              line.folded = foldedStates.get(i)!;
            }
          }
        }
      }
    }
  }

  private determineChildRelationships() {
    // Determine which lines have children for visual guides
    for (let i = 0; i < this.xmlLines.length; i++) {
      const currentLine = this.xmlLines[i];
      if (currentLine.isOpeningTag && !currentLine.isSelfClosing) {
        // Look for child elements
        for (let j = i + 1; j < this.xmlLines.length; j++) {
          const nextLine = this.xmlLines[j];
          if (nextLine.indentLevel <= currentLine.indentLevel) {
            break; // Reached sibling or parent
          }
          if (nextLine.indentLevel === currentLine.indentLevel + 1 && 
              (nextLine.isOpeningTag || nextLine.content.trim())) {
            currentLine.hasChildren = true;
            break;
          }
        }
      }
    }
  }

  private findMatchingClosingTag(openingIndex: number, tagName: string, openingIndent: number): number {
    let stack = 0;
    
    for (let i = openingIndex + 1; i < this.xmlLines.length; i++) {
      const currentLine = this.xmlLines[i];
      
      if (currentLine.isOpeningTag && currentLine.tagName === tagName && currentLine.indentLevel >= openingIndent) {
        stack++;
      } else if (currentLine.isClosingTag && currentLine.tagName === tagName) {
        if (stack === 0 && currentLine.indentLevel === openingIndent) {
          return i; // Found matching closing tag
        } else if (stack > 0) {
          stack--;
        }
      }
    }
    
    return -1; // No matching closing tag found
  }

  private hasContentBetween(startIndex: number, endIndex: number): boolean {
    for (let i = startIndex + 1; i < endIndex; i++) {
      const line = this.xmlLines[i];
      const trimmed = line.content.trim();
      
      // If there's any non-empty, non-comment line between opening and closing tags
      if (trimmed && !trimmed.startsWith('<!--') && !trimmed.endsWith('-->')) {
        return true;
      }
    }
    return false;
  }

  private getIndentLevel(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? Math.floor(match[1].length / this.indentWidth) : 0;
  }

  // Helper for indentation guides
  getIndentLevels(indentLevel: number): number[] {
    return Array.from({length: indentLevel}, (_, i) => i);
  }

  hasChildrenAtLevel(lineIndex: number, level: number): boolean {
    if (lineIndex >= this.xmlLines.length - 1) return false;
    
    const currentLine = this.xmlLines[lineIndex];
    
    // Check if this line has children at the specified level
    if (currentLine.hasChildren && level === currentLine.indentLevel - 1) {
      return true;
    }
    
    // Also check if there are any child elements in the following lines
    for (let i = lineIndex + 1; i < this.xmlLines.length; i++) {
      const nextLine = this.xmlLines[i];
      if (nextLine.indentLevel <= currentLine.indentLevel) break;
      if (nextLine.indentLevel === level + 1) {
        return true;
      }
    }
    
    return false;
  }

  isLineHiddenByFold(lineIndex: number): boolean {
    for (let i = 0; i < lineIndex; i++) {
      const line = this.xmlLines[i];
      if (line.foldable && line.folded && line.closingLine && 
          lineIndex > i && lineIndex < line.closingLine - 1) {
        return true;
      }
    }
    return false;
  }

  onContentChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.xmlContent = target.value;
    this.parseXmlContent();
    this.contentChange.emit(this.xmlContent);
    this.updateCursorPosition();
    this.cdRef.detectChanges(); // Force update
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();
      this.insertText('  ');
    } else if (event.key === '>') {
      this.autoCloseTag(event);
    } else if (event.key === 'Enter') {
      this.autoIndent(event);
    }
  }

  private autoCloseTag(event: KeyboardEvent) {
    const textarea = this.editor.nativeElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.xmlContent.substring(0, cursorPos);
    
    // Check if we just typed a closing angle bracket for an opening tag
    const tagMatch = textBeforeCursor.match(/<([a-zA-Z][a-zA-Z0-9_-]*)$/);
    
    if (tagMatch) {
      const tagName = tagMatch[1];
      
      // Don't auto-close if it's a closing tag, self-closing tag, or special tags
      if (!tagName.startsWith('/') && 
          !tagName.startsWith('?') && 
          !tagName.startsWith('!') &&
          tagName !== '!--') {
        
        event.preventDefault();
        
        const textAfterCursor = this.xmlContent.substring(cursorPos);
        const currentLine = this.getCurrentLine(textarea, cursorPos);
        const indent = this.getCurrentIndent(currentLine);
        
        // Insert the closing bracket and the closing tag
        const closingTag = `</${tagName}>`;
        const newText = textBeforeCursor + '>' + closingTag + textAfterCursor;
        
        this.xmlContent = newText;
        textarea.value = newText;
        
        // Position cursor between the opening and closing tags
        const newCursorPos = cursorPos + 1;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
        
        this.parseXmlContent();
        this.contentChange.emit(this.xmlContent);
        this.cdRef.detectChanges(); // Force update
      }
    }
  }

  private autoIndent(event: KeyboardEvent) {
    const textarea = this.editor.nativeElement;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = this.xmlContent.substring(0, cursorPos);
    
    // Get current line and its indentation
    const currentLine = this.getCurrentLine(textarea, cursorPos);
    const currentIndent = this.getCurrentIndent(currentLine);
    
    // Check if we're after an opening tag
    const lines = textBeforeCursor.split('\n');
    const previousLine = lines[lines.length - 2] || ''; // Line before current
    
    if (previousLine.trim().match(/<[^/][^>]*[^/]>$/)) {
      // We're after an opening tag, increase indent
      event.preventDefault();
      
      const textAfterCursor = this.xmlContent.substring(cursorPos);
      const newIndent = '  '.repeat(currentIndent + 1);
      const newText = textBeforeCursor + '\n' + newIndent + '\n' + '  '.repeat(currentIndent) + textAfterCursor;
      
      this.xmlContent = newText;
      textarea.value = newText;
      
      // Position cursor on the new indented line
      const newCursorPos = cursorPos + 1 + newIndent.length;
      textarea.selectionStart = newCursorPos;
      textarea.selectionEnd = newCursorPos;
      
      this.parseXmlContent();
      this.contentChange.emit(this.xmlContent);
      this.cdRef.detectChanges(); // Force update
    }
  }

  private getCurrentLine(textarea: HTMLTextAreaElement, cursorPos: number): string {
    const textUpToCursor = textarea.value.substring(0, cursorPos);
    const lines = textUpToCursor.split('\n');
    return lines[lines.length - 1];
  }

  private getCurrentIndent(line: string): number {
    const match = line.match(/^(\s*)/);
    return match ? Math.floor(match[1].length / this.indentWidth) : 0;
  }

  private insertText(text: string) {
    const textarea = this.editor.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    this.xmlContent = this.xmlContent.substring(0, start) + text + this.xmlContent.substring(end);
    textarea.value = this.xmlContent;
    
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    this.parseXmlContent();
    this.contentChange.emit(this.xmlContent);
    this.cdRef.detectChanges(); // Force update
  }

  toggleFold(lineNumber: number) {
    const lineIndex = lineNumber - 1;
    const line = this.xmlLines[lineIndex];
    
    if (line && line.foldable) {
      line.folded = !line.folded;
      this.cdRef.detectChanges();
    }
  }

  foldAll() {
    this.xmlLines.forEach(line => {
      if (line.foldable) {
        line.folded = true;
      }
    });
    this.cdRef.detectChanges();
  }

  unfoldAll() {
    this.xmlLines.forEach(line => {
      line.folded = false;
    });
    this.cdRef.detectChanges();
  }

  formatXml() {
    if (!this.xmlContent.trim()) return;

    try {
      // Store current folding state before formatting
      const foldingState = this.xmlLines
        .map((line, index) => ({ 
          index, 
          folded: line.folded, 
          foldable: line.foldable, 
          tagName: line.tagName,
          content: line.content.trim(),
          indentLevel: line.indentLevel
        }))
        .filter(item => item.foldable);

      // STEP 1: Add proper line breaks to single-line XML
      let withLineBreaks = this.addLineBreaks(this.xmlContent);
      
      // STEP 2: Apply indentation
      const lines = withLineBreaks.split('\n');
      let formatted = '';
      let indentLevel = 0;

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        // Handle comments - keep as-is
        if (line.startsWith('<!--')) {
          formatted += '  '.repeat(indentLevel) + line + '\n';
          continue;
        }

        // DECREASE indent for closing tags BEFORE writing the line
        if (line.startsWith('</')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Write the line with current indentation
        formatted += '  '.repeat(indentLevel) + line + '\n';

        // INCREASE indent for opening tags AFTER writing the line
        if (line.startsWith('<') && 
            !line.startsWith('</') && 
            !line.endsWith('/>') && 
            !line.startsWith('<?') &&
            !line.startsWith('<!--')) {
          indentLevel++;
        }
      }

      this.xmlContent = formatted.trim();
      this.parseXmlContent();
      
      // Restore folding state
      foldingState.forEach(state => {
        const potentialMatches = this.xmlLines
          .map((line, index) => ({ line, index }))
          .filter(item => 
            item.line.tagName === state.tagName && 
            item.line.foldable && 
            Math.abs(item.line.indentLevel - state.indentLevel) <= 1
          );
        
        if (potentialMatches.length > 0) {
          const match = potentialMatches[0];
          match.line.folded = state.folded;
        }
      });
      
      this.contentChange.emit(this.xmlContent);
      this.cdRef.detectChanges();
    } catch (error) {
      console.error('Error formatting XML:', error);
      this.basicFormatXml();
    }
  }

  private addLineBreaks(xml: string): string {
    let result = '';
    let i = 0;
    const len = xml.length;
    let inTag = false;
    let inQuote = false;
    let currentLine = '';

    while (i < len) {
      const char = xml[i];
      
      if (char === '"') {
        inQuote = !inQuote;
        currentLine += char;
      } else if (char === '<' && !inQuote) {
        // If we have content before the tag, add it as a separate line
        if (currentLine.trim()) {
          result += currentLine + '\n';
          currentLine = '';
        }
        inTag = true;
        currentLine += char;
      } else if (char === '>' && !inQuote) {
        currentLine += char;
        result += currentLine + '\n';
        currentLine = '';
        inTag = false;
      } else if (char === '\n' || char === '\r') {
        // Preserve existing line breaks
        if (currentLine.trim()) {
          result += currentLine + '\n';
          currentLine = '';
        }
      } else {
        currentLine += char;
      }
      
      i++;
    }

    // Add any remaining content
    if (currentLine.trim()) {
      result += currentLine;
    }

    return result.trim();
  }

  private basicFormatXml() {
    // Simple fallback formatting
    let formatted = '';
    let indentLevel = 0;
    const lines = this.xmlContent.split('\n');
    
    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      formatted += '  '.repeat(indentLevel) + trimmed + '\n';
      
      if (trimmed.startsWith('<') && 
          !trimmed.startsWith('</') && 
          !trimmed.endsWith('/>') && 
          !trimmed.startsWith('<?') &&
          !trimmed.startsWith('<!--')) {
        indentLevel++;
      }
    }
    
    this.xmlContent = formatted.trim();
    this.parseXmlContent();
    this.contentChange.emit(this.xmlContent);
  }

  // FIXED HIGHLIGHTING METHOD WITH DEBUG LOGGING
  getHighlightedContent(): string {
    if (!this.xmlContent) {
      console.log('❌ No XML content');
      return '';
    }

    console.log('🔍 Original XML:', this.xmlContent);

    // STEP 1: Escape HTML FIRST
    let highlighted = this.xmlContent
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    console.log('🔍 After escaping:', highlighted);

    // STEP 2: Apply colors to ESCAPED content
    
    // Highlight comments (green)
    const beforeComments = highlighted;
    highlighted = highlighted.replace(/(&lt;!--.*?--&gt;)/g, '<span class="xml-comment">$1</span>');
    if (beforeComments !== highlighted) {
      console.log('✅ Comments found and highlighted');
    }

    // Highlight ALL tags in VIOLET (using &lt; and &gt;)
    const beforeTags = highlighted;
    highlighted = highlighted.replace(/(&lt;\/?[^&]+&gt;)/g, '<span class="xml-tag">$1</span>');
    if (beforeTags !== highlighted) {
      console.log('✅ Tags found and highlighted');
    } else {
      console.log('❌ NO TAGS FOUND - Regex issue');
      console.log('🔍 Content being searched:', highlighted);
      
      // Test the regex manually
      const testMatches = highlighted.match(/(&lt;\/?[^&]+&gt;)/g);
      console.log('🔍 Regex test matches:', testMatches);
    }

    console.log('🔍 Final highlighted:', highlighted);

    // STEP 3: Handle folded content
    const lines = highlighted.split('\n');
    console.log('🔍 Lines after highlighting:', lines);

    const resultLines: string[] = [];
    
    let skipUntil = -1;
    for (let i = 0; i < this.xmlLines.length; i++) {
      const line = this.xmlLines[i];
      
      if (i < skipUntil) continue;
      if (this.isLineHiddenByFold(i)) continue;
      
      if (line.foldable && line.folded && line.closingLine) {
        resultLines.push(lines[i] || '');
        resultLines.push('  '.repeat(line.indentLevel) + '<span class="folded-content">...</span>');
        skipUntil = line.closingLine - 1;
      } else {
        resultLines.push(lines[i] || '');
      }
    }
    
    const finalResult = resultLines.join('\n');
    console.log('🔍 Final result:', finalResult);
    
    return finalResult;
  }

  private updateCursorPosition() {
    const textarea = this.editor.nativeElement;
    const text = textarea.value.substring(0, textarea.selectionStart);
    const lines = text.split('\n');
    this.cursorPosition = {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  focusEditor() {
    this.editor.nativeElement.focus();
  }

  getFoldedCount(): number {
    return this.xmlLines.filter(line => line.folded).length;
  }

  getFoldableCount(): number {
    return this.xmlLines.filter(line => line.foldable).length;
  }

  loadSample(type: string) {
    const samples: { [key: string]: string } = {
      mixed: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <!-- This is a comment -->
  <selfclosing tag="value"/>
  <singleline>content</singleline>
  <multiline>
    <child>Content here</child>
    <child>More content</child>
  </multiline>
  <mixed attr="value">
    <nested>
      <deep>Deep content</deep>
    </nested>
    <another>Text content</another>
  </mixed>
  <emptytags></emptytags>
</root>`,

      nested: `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <database>
    <connection>
      <host>localhost</host>
      <port>5432</port>
      <credentials>
        <username>admin</username>
        <password>secret</password>
      </credentials>
    </connection>
    <pool>
      <max-connections>20</max-connections>
      <timeout>30</timeout>
    </pool>
  </database>
  <services>
    <api>
      <endpoints>
        <users>/api/users</users>
        <products>/api/products</products>
      </endpoints>
    </api>
  </services>
</configuration>`,

      config: `<?xml version="1.0" encoding="UTF-8"?>
<appSettings>
  <logging>
    <level>INFO</level>
    <file>/var/log/app.log</file>
  </logging>
  <features>
    <authentication enabled="true">
      <providers>
        <local>true</local>
        <oauth2>false</oauth2>
      </providers>
    </authentication>
    <caching enabled="false"/>
  </features>
</appSettings>`
    };

    this.xmlContent = samples[type] || samples['mixed'];
    this.parseXmlContent();
    this.contentChange.emit(this.xmlContent);
    this.cdRef.detectChanges(); // Force update
  }

  clearEditor() {
    this.xmlContent = '';
    this.parseXmlContent();
    this.contentChange.emit(this.xmlContent);
    this.cdRef.detectChanges(); // Force update
  }
}