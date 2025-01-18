// audio-utils.ts
export class AudioUtils {
    // Método para convertir un Blob a un archivo WAV
    async convertBlobToWav(blob: Blob): Promise<Blob> {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
      const wavData = this.encodeWav(audioBuffer);
      return new Blob([wavData], { type: 'audio/wav' });
    }
  
    encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
      const numOfChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const samples = audioBuffer.getChannelData(0); // Asumiendo un solo canal (mono)
    
      const buffer = new ArrayBuffer(44 + samples.length * 2); // 44 bytes para el encabezado WAV
      const view = new DataView(buffer);
    
      // Escribir el encabezado WAV
      this.writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + samples.length * 2, true); // ChunkSize
      this.writeString(view, 8, 'WAVE');
      this.writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true); // Subchunk1Size
      view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
      view.setUint16(22, numOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numOfChannels * 2, true); // ByteRate
      view.setUint16(32, numOfChannels * 2, true); // BlockAlign
      view.setUint16(34, 16, true); // BitsPerSample
      this.writeString(view, 36, 'data');
      view.setUint32(40, samples.length * 2, true); // Subchunk2Size
    
      // Escribir los datos de audio
      let offset = 44;
      for (let i = 0; i < samples.length; i++) {
        view.setInt16(offset, samples[i] * 0x7FFF, true); // Convertir a PCM 16-bit
        offset += 2;
      }
    
      return buffer;
    }
    
    // Función para escribir una cadena en el DataView
    writeString(view: DataView, offset: number, string: string): void {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }

    convertBlobToBase64(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string); // El resultado es la cadena base64
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob); // Convierte el blob a base64
      });
    }
    
  }
  