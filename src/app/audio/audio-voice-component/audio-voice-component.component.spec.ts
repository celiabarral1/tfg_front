import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AudioVoiceComponentComponent } from './audio-voice-component.component';

describe('AudioVoiceComponentComponent', () => {
  let component: AudioVoiceComponentComponent;
  let fixture: ComponentFixture<AudioVoiceComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AudioVoiceComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AudioVoiceComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
