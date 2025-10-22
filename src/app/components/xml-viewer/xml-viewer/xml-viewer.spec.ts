import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlViewer } from './xml-viewer';

describe('XmlViewer', () => {
  let component: XmlViewer;
  let fixture: ComponentFixture<XmlViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
