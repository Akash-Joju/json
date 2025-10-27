import { Injectable } from '@angular/core';

interface ComparisonData {
  leftXml: string;
  rightXml: string;
  leftDoc: Document | null;
  rightDoc: Document | null;
  options: any;
}

@Injectable({
  providedIn: 'root'
})
export class XmlCompareService {
  private comparisonData: ComparisonData | null = null;

  setComparisonData(data: ComparisonData): void {
    this.comparisonData = data;
  }

  getComparisonData(): ComparisonData | null {
    return this.comparisonData;
  }

  clearComparisonData(): void {
    this.comparisonData = null;
  }
}