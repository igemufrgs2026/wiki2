(() => {
    const duel = document.querySelector('.pov-duel');
    if (!duel) return;
    const perspectives = {
        grape: ['Protecting crops and livelihoods', 'For sensitive crop growers, drift threatens years of investment and family livelihoods. Early detection offers a way to identify contamination before visible symptoms appear.', '#sensitive-crops', 'Read the growers’ perspective and our consultations →'],
        soy: ['Maintaining affordable weed control', 'Soybean producers rely on 2,4-D as a cost-effective tool, while suitable application weather is rare. Our synthesis of this perspective draws on state specialists and media content.', '#soybean-producers', 'Read the soybean perspective and its sources →']
    };
    const buttons = duel.querySelectorAll('[data-perspective]');
    const detail = duel.querySelector('.duel-detail');
    buttons.forEach(button => button.addEventListener('click', () => {
        const side = button.dataset.perspective;
        const [title, body, href, label] = perspectives[side];
        duel.dataset.side = side;
        buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        detail.querySelector('h3').textContent = title;
        detail.querySelector('p').textContent = body;
        const link = detail.querySelector('a');
        link.setAttribute('href', href);
        link.textContent = label;
    }));
})();
