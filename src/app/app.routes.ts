import { Routes } from '@angular/router';
import { JsonViewerComponent } from './components/json-viewer/json-viewer/json-viewer';
import { AboutComponent } from './components/about/about/about';
import { HomeComponent } from './components/home/home/home';
import { ToolsComponent } from './components/tools/tools/tools';
import { JsonDifferComponent } from './components/json-differ/json-differ/json-differ';
import { XmlViewerComponent } from './components/xml-viewer/xml-viewer/xml-viewer'; // Add this import

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'JSON Viewer - Home' },
  { path: 'viewer', component: JsonViewerComponent, title: 'JSON Viewer' },
  { path: 'tools', component: ToolsComponent, title: 'JSON Tools' },
  { path: 'json-differ', component: JsonDifferComponent, title: 'JSON Differ' },
  { path: 'xml-viewer', component: XmlViewerComponent, title: 'XML Viewer' }, // Add this route
  { path: 'about', component: AboutComponent, title: 'About' },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];