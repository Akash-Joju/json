// xml-types.ts
export interface XmlNode {
  isHovered: boolean;
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

export interface TreeNode {
  name: string;
  attributes: { [key: string]: string };
  children: TreeNode[];
  textContent?: string;
  isExpanded: boolean;
  level: number;
  nodeType?: 'element' | 'text' | 'comment' | 'cdata';
  isVisible?: boolean;
  parent?: TreeNode;
  isHovered?: boolean;
}

export interface TreeLine {
  number: number;
  node: TreeNode;
  type: 'open' | 'close' | 'text' | 'self-closing';
  level: number;
  isVisible: boolean;
  displayNumber: number;
}