(() => {
    const explorer = document.querySelector('.fluorescence-explorer');
    if (!explorer) return;
    const steps = [
        ['Blue light · excitation', 'Blue light illuminates the sample and excites the fluorescent molecules produced by the biological construct.'],
        ['Sample · green fluorescence', 'The biological construct produces a fluorescent signal in response to 2,4-D. Under blue excitation light, the fluorescent molecules emit green light.'],
        ['Filter · separating the light', 'The optical filter separates excitation and emission wavelengths, preventing blue excitation light from dominating the green fluorescence measurement.'],
        ['Sensor · detecting the signal', 'The optical sensor measures the resulting green fluorescence. The device processes this measurement to provide an interpretable result.']
    ];
    const buttons = explorer.querySelectorAll('[data-optical-step]');
    const detail = explorer.querySelector('#optical-detail');
    buttons.forEach(button => button.addEventListener('click', () => {
        const step = steps[Number(button.dataset.opticalStep)];
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        detail.querySelector('h4').textContent = step[0];
        detail.querySelector('p').textContent = step[1];
    }));
})();
