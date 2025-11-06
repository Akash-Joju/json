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
import { XmlCsvConverterComponent } from './components/xml-csv/xml-csv/xml-csv';
import { PrivacyPolicyComponent } from './components/privacy-policy/privacy-policy/privacy-policy';
import { TermsConditionsComponent } from './components/terms-and-conditions/terms-and-conditions/terms-and-conditions';
export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'AWCS Labs' },
  { path: 'viewer', component: JsonViewerComponent, title: 'AWCS Labs-JSON Viewer' },
  { path: 'tools', component: ToolsComponent, title: 'AWCS Labs-Tools' },
  { path: 'json-differ', component: JsonDifferComponent, title: 'AWCS Labs-JSON Differ' },
  { path: 'results', component: JsonResultsComponent, title: 'AWCS Labs-JSON Result' },
  { path: 'xml-viewer', component: XmlViewerComponent, title: 'AWCS Labs-XML Viewer' },
  { path: 'xml-code', component: XmlCodeEditorComponent, title: 'AWCS Labs-XML code' },
  { path: 'xml-differ', component: XmlDifferComponent, title: 'AWCS Labs-XML Differ' }, // Add this route
  { path: 'xml-results', component: XmlResultsComponent, title: 'AWCS Labs-XML Result' },
   { path: 'json-csv', component: JsonCsvConverterComponent, title: 'AWCS Labs-Json-CSV' },
   { path: 'xml-csv', component: XmlCsvConverterComponent, title: 'AWCS Labs-XML-CSV' },
  { path: 'about', component: AboutComponent, title: 'About' },
   { path: 'privacy-policy', component: PrivacyPolicyComponent, title: 'Privacy-Policy' },
   { path: 'terms', component: TermsConditionsComponent, title: 'Terms and Conditions' },
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];