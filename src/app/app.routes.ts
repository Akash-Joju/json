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
import { XmlCodeEditorComponent } from './components/xml-code/xml-code/xml-code';
import { JsonCsvConverterComponent } from './components/json-csv/json-csv/json-csv';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Xonify Tools' },
  { path: 'viewer', component: JsonViewerComponent, title: 'Xonify Tools-JSON Viewer' },
  { path: 'tools', component: ToolsComponent, title: 'Xonify Tools' },
  { path: 'json-differ', component: JsonDifferComponent, title: 'Xonify Tools-JSON Differ' },
  { path: 'results', component: JsonResultsComponent, title: 'Xonify Tools-JSON Result' },
  { path: 'xml-viewer', component: XmlViewerComponent, title: 'Xonify Tools-XML Viewer' },
  { path: 'xml-code', component: XmlCodeEditorComponent, title: 'Xonify Tools-XML code' },
  { path: 'xml-differ', component: XmlDifferComponent, title: 'Xonify Tools-XML Differ' }, // Add this route
  { path: 'xml-results', component: XmlResultsComponent, title: 'Xonify Tools-XML Result' },
   { path: 'json-csv', component: JsonCsvConverterComponent, title: 'Json-CSV' },
  { path: 'about', component: AboutComponent, title: 'About' },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];