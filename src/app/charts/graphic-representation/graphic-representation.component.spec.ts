import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicRepresentationComponent } from './graphic-representation.component';

describe('GraphicRepresentationComponent', () => {
  let component: GraphicRepresentationComponent;
  let fixture: ComponentFixture<GraphicRepresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphicRepresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GraphicRepresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
