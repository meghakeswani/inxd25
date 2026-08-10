export function createControlBindings(state) {
  const controls = {};
  const elements = {
    pitch: document.querySelector('#pitch'),
    voice: document.querySelector('#voice'),
    tenseness: document.querySelector('#tenseness'),
    breathiness: document.querySelector('#breathiness'),
    volume: document.querySelector('#volume'),
    vibrato: document.querySelector('#vibrato'),
    noise: document.querySelector('#noise'),
    tongueStiffness: document.querySelector('#tongueStiffness'),
    tractLength: document.querySelector('#tractLength'),
    resonance: document.querySelector('#resonance'),
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (!element) return;
    const valueOutput = document.querySelector(`#${key}Value`);
    const updateOutput = () => {
      const value = Number(element.value);
      state.params[key] = value;
      if (valueOutput) {
        valueOutput.textContent = value.toFixed(2);
      }
    };

    element.addEventListener('input', updateOutput);
    updateOutput();
    controls[key] = element;
  });

  document.querySelectorAll('.preset-button').forEach((button) => {
    button.addEventListener('click', () => {
      const preset = button.dataset.preset;
      if (preset === 'ah') {
        state.params.pitch = 140;
        state.params.voice = 0.86;
        state.params.tenseness = 0.45;
        state.params.breathiness = 0.22;
        state.params.volume = 0.55;
        state.params.vibrato = 0.16;
        state.params.noise = 0.12;
        state.params.tongueStiffness = 0.18;
        state.params.tractLength = 0.7;
        state.params.resonance = 0.62;
      } else if (preset === 'ee') {
        state.params.pitch = 180;
        state.params.voice = 0.78;
        state.params.tenseness = 0.26;
        state.params.breathiness = 0.09;
        state.params.volume = 0.5;
        state.params.vibrato = 0.12;
        state.params.noise = 0.08;
        state.params.tongueStiffness = 0.22;
        state.params.tractLength = 0.58;
        state.params.resonance = 0.71;
      } else if (preset === 'oo') {
        state.params.pitch = 120;
        state.params.voice = 0.7;
        state.params.tenseness = 0.38;
        state.params.breathiness = 0.15;
        state.params.volume = 0.52;
        state.params.vibrato = 0.14;
        state.params.noise = 0.06;
        state.params.tongueStiffness = 0.16;
        state.params.tractLength = 0.64;
        state.params.resonance = 0.4;
      } else if (preset === 'ss') {
        state.params.pitch = 170;
        state.params.voice = 0.25;
        state.params.tenseness = 0.18;
        state.params.breathiness = 0.36;
        state.params.volume = 0.5;
        state.params.vibrato = 0.08;
        state.params.noise = 0.7;
        state.params.tongueStiffness = 0.28;
        state.params.tractLength = 0.8;
        state.params.resonance = 0.55;
      }

      Object.entries(elements).forEach(([key, element]) => {
        if (element) {
          const value = state.params[key];
          element.value = value;
          const valueOutput = document.querySelector(`#${key}Value`);
          if (valueOutput) {
            valueOutput.textContent = value.toFixed(2);
          }
        }
      });
    });
  });

  return controls;
}
