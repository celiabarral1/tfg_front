import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioEmotionsComponent } from './audio-emotions.component';

describe('AudioRecordedComponent', () => {
  let component: AudioEmotionsComponent;
  let fixture: ComponentFixture<AudioEmotionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioEmotionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioEmotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
