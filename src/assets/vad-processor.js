class VADProcessor extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [];
    }

    constructor() {
        super();
        this.energy = 0;
        this.energy_offset = 1e-8;
        this.energy_threshold_ratio_pos = 0.2;
        this.energy_threshold_ratio_neg = 0.05;
        this.energy_integration = 1;
        this.voiceTrend = 0;
        this.voiceTrendMax = 7;
        this.voiceTrendMin = -7;
        this.voiceTrendStart = 3;
        this.voiceTrendEnd = -3;
    }

    process(inputs) {
        console.log("Procesando audio...", inputs);
        if (inputs.length === 0 || inputs[0].length === 0) return true;

        let input = inputs[0][0]; // First channel
        let energy = 0;
        let maxEnergy = 0; // 🔹 Declare maxEnergy before using it

        // Compute energy and find max absolute value in the buffer
        for (let i = 0; i < input.length; i++) {
            energy += input[i] * input[i];
            maxEnergy = Math.max(maxEnergy, Math.abs(input[i])); // 🔹 Update maxEnergy
        }
    
        let gainFactor = 1e6;  // Amplification factor
    
        if (maxEnergy > 0) {
            energy = ((energy / input.length) / (maxEnergy * maxEnergy)) * gainFactor;
            energy = Math.log10(1 + energy);
        } else {
            energy = 0;  // Avoid division by zero
        }
    
        const signal = energy - this.energy_offset;

        console.log("Energia: ", energy)
        console.log("Señal: ", signal)

        // Voice Activity Detection logic
        if (signal > this.energy_threshold_ratio_pos) {
            this.voiceTrend = Math.min(this.voiceTrend + 1, this.voiceTrendMax);
        } else if (signal < -this.energy_threshold_ratio_neg) {
            this.voiceTrend = Math.max(this.voiceTrend - 1, this.voiceTrendMin);
        } else {
            if (this.voiceTrend > 0) this.voiceTrend--;
            else if (this.voiceTrend < 0) this.voiceTrend++;
        }

        let start = this.voiceTrend > this.voiceTrendStart;
        let end = this.voiceTrend < this.voiceTrendEnd;

        if (this.voiceTrend >= this.voiceTrendStart) {
            console.log("🔥 VOZ DETECTADA");
            this.port.postMessage({ event: "voice_start" });
        }
        if (this.voiceTrend <= this.voiceTrendEnd) {
            console.log("❌ SILENCIO DETECTADO");
            this.port.postMessage({ event: "voice_stop" });
        }
        

        return true;
    }
}

// Register the processor
registerProcessor("vad-processor", VADProcessor);
