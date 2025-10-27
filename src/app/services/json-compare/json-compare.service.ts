import { Injectable } from '@angular/core';

interface ComparisonData {
  leftJson: string;
  rightJson: string;
  leftObject: any;
  rightObject: any;
  options: any;
}

@Injectable({
  providedIn: 'root'
})
export class JsonCompareService {
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