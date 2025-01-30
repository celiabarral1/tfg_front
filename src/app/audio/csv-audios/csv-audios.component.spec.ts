import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CsvAudiosComponent } from './csv-audios.component';
import { RecordingEmotions } from '../audio-vad-live/model/recording-emotions';
import { CsvGestor } from '../../@core/common/utils/csv-gestor';
import { Alignment } from '../audio-vad-live/model/alignment';

describe('CsvAudiosComponent', () => {
  let component: CsvAudiosComponent;
  let fixture: ComponentFixture<CsvAudiosComponent>;
  let mockCsvGestor: jasmine.SpyObj<CsvGestor>;

  const mockCsvData: RecordingEmotions[] = [
    {
      fileName: 'audio1.wav',
      transcription: 'Hola mundo',
      alignments: [],
      audioBlob: new Blob(['audio content'], { type: 'audio/wav' }),
      Emotion_1_label: 'emo1',
      Emotion_1_mean: 0.2,
      Emotion_1_std: 0.123,
      Emotion_2_label: 'emo2',
      Emotion_2_mean: 0.4,
      Emotion_2_std: 0.134,
      Emotion_3_label: 'emo3',
      Emotion_3_mean: 0.5,
      Emotion_3_std: 0.876,
      valence: 0.123,
      arousal: -0.86,
      dominance: 0.234,
      userId: 1,
      timestamp: 0,
      toCSVRow: function (): string {
        throw new Error('Function not implemented.');
      }
    },
  ];

  beforeEach(async () => {
    mockCsvGestor = jasmine.createSpyObj('CsvGestor', ['loadCsv']);

    await TestBed.configureTestingModule({
      declarations: [CsvAudiosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CsvAudiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('onFileSelected', () => {
    it('debería cargar el archivo CSV y asignar los datos a recordings', async () => {
      const csvGestorInstance = new CsvGestor();
      spyOn(csvGestorInstance, 'loadCsv').and.returnValue(Promise.resolve(mockCsvData));

      const mockFile = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockFile);
      input.files = dataTransfer.files;

      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input });

      await component.onFileSelected(event);

      expect(component.recordings).toEqual(mockCsvData);
    });

    it('debería manejar errores al cargar el archivo CSV', async () => {
      const csvGestorInstance = new CsvGestor();
      spyOn(csvGestorInstance, 'loadCsv').and.returnValue(Promise.reject(new Error('Error al cargar CSV')));

      const mockFile = new File(['dummy content'], 'test.csv', { type: 'text/csv' });
      const input = document.createElement('input');
      input.type = 'file';
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockFile);
      input.files = dataTransfer.files;

      const event = new Event('change');
      Object.defineProperty(event, 'target', { value: input });

      const consoleSpy = spyOn(console, 'error');

      await component.onFileSelected(event);

      expect(consoleSpy).toHaveBeenCalledWith('Error al cargar el archivo CSV:', jasmine.any(Error));
    });
  });

  describe('extractData', () => {
    it('debería convertir las rutas de audio en blobs y procesar alineaciones', async () => {
      const mockResponse = new Response(new Blob(['audio content'], { type: 'audio/wav' }));
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse));

      const mockRecording: RecordingEmotions = {
        fileName: 'audio1.wav',
        transcription: 'Hola mundo',
        alignments: [
          { word: 'Hola', start: 0, end: 1 },
          { word: 'mundo', start: 1, end: 2 },
        ],
        audioBlob: new Blob(['hola'], { type: 'audio/wav' }),
        Emotion_1_label: 'emo1',
        Emotion_1_mean: 0.2,
        Emotion_1_std: 0.123,
        Emotion_2_label: 'emo2',
        Emotion_2_mean: 0.4,
        Emotion_2_std: 0.134,
        Emotion_3_label: 'emo3',
        Emotion_3_mean: 0.5,
        Emotion_3_std: 0.876,
        valence: 0.123,
        arousal: -0.86,
        dominance: 0.234,
        userId: 1,
        timestamp: 0,
        toCSVRow: function (): string {
          throw new Error('Function not implemented.');
        }
      };

      component.recordings = [mockRecording];

      await component.extractData();

      expect(component.recordings[0].audioBlob).toBeInstanceOf(Blob);
      expect(component.recordings[0].alignments).toEqual([
        { word: 'Hola', start: 0, end: 1 },
        { word: 'mundo', start: 1, end: 2 },
      ]);
    });

    it('debería manejar errores al cargar el audio', async () => {
      spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('Error al cargar audio')));

      const mockRecording: RecordingEmotions = {
        fileName: 'audio1.wav',
        transcription: 'Hola mundo',
        alignments: [],
        audioBlob: new Blob(['hola'], { type: 'audio/wav' }),
        Emotion_1_label: 'emo1',
        Emotion_1_mean: 0.2,
        Emotion_1_std: 0.123,
        Emotion_2_label: 'emo2',
        Emotion_2_mean: 0.4,
        Emotion_2_std: 0.134,
        Emotion_3_label: 'emo3',
        Emotion_3_mean: 0.5,
        Emotion_3_std: 0.876,
        valence: 0.123,
        arousal: -0.86,
        dominance: 0.234,
        userId: 1,
        timestamp: 0,
        toCSVRow: function (): string {
          throw new Error('Function not implemented.');
        }
      };

      component.recordings = [mockRecording];

      const consoleSpy = spyOn(console, 'error');

      await component.extractData();

      expect(consoleSpy).toHaveBeenCalledWith('Error al cargar el audio:', jasmine.any(Error));
    });
  });

  describe('processAlignments', () => {
    it('debería procesar correctamente las alineaciones', () => {
      const mockAlignments: Alignment[] = [
        { word: 'Hola', start: 0, end: 1 },
        { word: 'mundo', start: 1, end: 2 },
      ];

      const result = component.processAlignments(mockAlignments);

      expect(result).toEqual([
        { word: 'Hola', start: 0, end: 1 },
        { word: 'mundo', start: 1, end: 2 },
      ]);
    });
  });
});
