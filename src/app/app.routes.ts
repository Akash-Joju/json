import { Routes } from '@angular/router';
import { JsonViewerComponent } from './components/json-viewer/json-viewer/json-viewer';
import { AboutComponent } from './components/about/about/about';
import { HomeComponent } from './components/home/home/home';
import { ToolsComponent } from './components/tools/tools/tools';
import { JsonDifferComponent } from './components/json-differ/json-differ/json-differ';
import { XmlViewerComponent } from './components/xml-viewer/xml-viewer/xml-viewer';
import { XmlDifferComponent } from './components/xml-differ/xml-differ/xml-differ'; 
import { JsonResultsComponent } from './components/json-result/json-result/json-result';// Add this import
import { XmlResultsComponent } from './components/xml-result/xml-result/xml-result';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'JSON Viewer - Home' },
  { path: 'viewer', component: JsonViewerComponent, title: 'JSON Viewer' },
  { path: 'tools', component: ToolsComponent, title: 'JSON Tools' },
  { path: 'json-differ', component: JsonDifferComponent, title: 'JSON Differ' },
  { path: 'results', component: JsonResultsComponent, title: 'JSON Result' },
  { path: 'xml-viewer', component: XmlViewerComponent, title: 'XML Viewer' },
  { path: 'xml-differ', component: XmlDifferComponent, title: 'XML Differ' }, // Add this route
  { path: 'xml-results', component: XmlResultsComponent, title: 'XML Result' },
  { path: 'about', component: AboutComponent, title: 'About' },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];