import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XmlNode } from './xml-node';

describe('XmlNode', () => {
  let component: XmlNode;
  let fixture: ComponentFixture<XmlNode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XmlNode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XmlNode);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
