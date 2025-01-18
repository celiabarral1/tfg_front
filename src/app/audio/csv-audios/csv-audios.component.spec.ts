import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CsvAudiosComponent } from './csv-audios.component';

describe('CsvAudiosComponent', () => {
  let component: CsvAudiosComponent;
  let fixture: ComponentFixture<CsvAudiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CsvAudiosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CsvAudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
