import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoricComponent } from './categoric.component';

describe('CategoricComponent', () => {
  let component: CategoricComponent;
  let fixture: ComponentFixture<CategoricComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CategoricComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
