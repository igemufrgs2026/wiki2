window.addEventListener('scroll', () => {
    const zoomSection = document.getElementById('zoomSection');
    if (zoomSection) {
        const zRect = zoomSection.getBoundingClientRect();
        let zp = Math.max(0, Math.min(1, -zRect.top / (zRect.height - window.innerHeight)));

        // Multiplicador aumentado para o zoom acontecer mais rápido
        const zoomAmount = Math.min(zp * 2.5, 1.2);
        document.getElementById('zoomImage').style.transform = `scale(${1 + zoomAmount})`;

        // Diminuímos os limites (thresholds) para acelerar o scroll das etapas
        document.getElementById('initialText').style.opacity = zp > 0.05 ? 0 : 1;
        document.getElementById('scrollArrow').style.opacity = zp > 0.02 ? 0 : 1;

        // O texto "by iGEM UFRGS Brasil" agora aparece com apenas 20% de scroll (antes era 50%)
        document.getElementById('finalContent').style.opacity = zp > 0.2 ? 1 : 0;
    }

    // Map Section
    const mapSection = document.getElementById('mapSection');
    if (mapSection) {
        const mRect = mapSection.getBoundingClientRect();
        const isMobileMap = window.matchMedia('(max-width: 760px)').matches;
        const mapVisual = mapSection.querySelector('.map-visual-container');
        const mapVisualRect = mapVisual ? mapVisual.getBoundingClientRect() : null;
        const sectionScrollRange = Math.max(1, mRect.height - window.innerHeight);
        const sectionProgress = Math.max(0, Math.min(1, -mRect.top / sectionScrollRange));
        const visualScrollRange = mapVisualRect ? window.innerHeight + mapVisualRect.height : 1;
        const visualProgress = mapVisualRect
            ? Math.max(0, Math.min(1, (window.innerHeight - mapVisualRect.top) / visualScrollRange))
            : sectionProgress;
        const mp = isMobileMap ? visualProgress : sectionProgress;

        const imgBrazil = document.getElementById('img-brazil');
        const rsLayer = document.getElementById('rs-container');
        const mapTextInitial = document.getElementById('mapTextInitial');
        const mapTextFinal = document.getElementById('mapTextFinal');

        const zoomEnd = isMobileMap ? 0.62 : 0.6;
        const fadeStart = isMobileMap ? 0.52 : 0.6;
        const fadeEnd = isMobileMap ? 0.68 : 0.85;
        const zoomProgress = Math.max(0, Math.min(1, mp / zoomEnd));
        const fadeProgress = Math.max(0, Math.min(1, (mp - fadeStart) / (fadeEnd - fadeStart)));

        // Brasil com o zoom centrado no RS
        const brazilScale = 1 + zoomProgress * 3.8;
        imgBrazil.style.transformOrigin = '51% 100.9%';
        imgBrazil.style.transform = `scale(${brazilScale})`;
        imgBrazil.style.opacity = String(1 - fadeProgress);

        const rsRevealStart = isMobileMap ? 0.46 : 0.58;
        const rsRevealRange = isMobileMap ? 0.12 : 0.04;
        const rsAppear = Math.max(0, Math.min(1, (mp - rsRevealStart) / rsRevealRange));
        
        // Variaveis de ajuste do mapa do RS
        const offsetX = 2; 
        const offsetY = 4; 
        
        rsLayer.style.transformOrigin = '62% 87%';
        rsLayer.style.transform = `scale(1) translate(${offsetX}px, ${offsetY}px)`;
        rsLayer.style.opacity = String(rsAppear);
        rsLayer.style.pointerEvents = rsAppear > 0.8 ? 'auto' : 'none';

        rsLayer.style.display = 'block';

        if (isMobileMap) {
            mapTextInitial.style.opacity = '1';
            mapTextFinal.classList.add('visible');
        } else {
            mapTextInitial.style.opacity = String(1 - zoomProgress * 1.5);
            mapTextFinal.classList.toggle('visible', mp > 0.4);
}
    }
});

// HOVER NOS PINS DO MAPA
const pins = document.querySelectorAll('.map-pin');
const photoViewer = document.getElementById('pinPhotoViewer');
const activeImg = document.getElementById('pinActiveImg');
const activeName = document.getElementById('pinActiveName');

if (pins.length > 0) {
    pins.forEach(pin => {
        const cityName = pin.getAttribute('data-name') || 'Affected location';
        pin.setAttribute('role', 'button');
        pin.setAttribute('tabindex', '0');
        pin.setAttribute('aria-label', `Show information for ${cityName}`);

            const showPin = (e) => {
                e.stopPropagation();

                // Coloca o cartão na mesma camada dos pontos.
                pin.parentElement.appendChild(photoViewer);

                activeImg.src = pin.getAttribute('data-img');
                activeImg.alt = `Photo of ${cityName}`;
                activeName.textContent = cityName;

                // Acompanha a posição do ponto, inclusive ao redimensionar.
                photoViewer.style.left = `calc(${pin.style.left} + 22px)`;
                photoViewer.style.top = pin.style.top;

                photoViewer.classList.add('visible');
            };
        pin.addEventListener('click', showPin);
        pin.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pin.click();
            }
        });
    });

    // Fecha a janelinha se o usuário clicar em qualquer outro lugar da tela
    window.addEventListener('click', () => {
        if (photoViewer) {
            photoViewer.classList.remove('visible');
        }
    });
}

// TIMELINE
const timelineData = [
    { year: "1940s", title: "Synthesis and discovery of herbicidal activity", text: "Development of 2,4-D marked the beginning of the modern era of selective synthetic herbicides." },
    { year: "1950s-60s", title: "Global agricultural expansion and introduction in Brazil", text: "Consolidation as a key tool for controlling broadleaf weeds in cereals, sugarcane, and pastures." },
    { year: "1960-70", title: "Use in Agent Orange (Vietnam War)", text: "Used as a component of the military defoliant; this episode strongly influenced global public perception of herbicides." },
    { year: "2008-20", title: "Toxicological re-evaluation by ANVISA", text: "Registration maintained with updated safety criteria and restrictions to mitigate health and environmental risks." },
    { year: "2010-20", title: "Regulatory updates and increased use in Brazil", text: "Ban on highly volatile ester formulations, adoption of lower-drift formulations, and increased use driven by glyphosate-resistant weeds." }
];
const track = document.getElementById('timelineTrack'), knob = document.getElementById('timelineKnob'), infoBar = document.getElementById('infoBar');

if (track && knob && infoBar) {
    let timelineDragging = false;

    function initTimeline() {
        timelineData.forEach((d, i) => {
            const pct = (i / (timelineData.length - 1) * 100) + '%';

            const m = document.createElement('div');
            m.className = 'year-marker';
            m.innerText = d.year;
            m.style.top = pct;
            m.onclick = () => snapTo(i);
            track.appendChild(m);

            const lbl = document.createElement('div');
            lbl.className = 'year-label';
            lbl.innerText = d.title;
            lbl.style.top = pct;
            track.appendChild(lbl);
        });
        snapTo(0);
    }
    function moveT(clientY) {
        const r = track.getBoundingClientRect();
        const y = Math.max(0, Math.min(r.height, clientY - r.top));
        const rawIndex = (y / r.height) * (timelineData.length - 1);
        const i = Math.round(rawIndex);
        snapTo(i);
    }
    function snapTo(i) {
        const p = (i / (timelineData.length - 1) * 100) + '%';
        knob.style.top = p; infoBar.style.top = p; updateT(i);
        knob.setAttribute('aria-valuenow', String(i));
        knob.setAttribute('aria-valuetext', `${timelineData[i].year}: ${timelineData[i].title}`);
    }
    function updateT(i) {
        const d = timelineData[i];
        infoBar.classList.add('visible');

        let titleEl = infoBar.querySelector('.info-title');
        let textEl = infoBar.querySelector('.info-text');
        if (!titleEl) {
            titleEl = document.createElement('span');
            titleEl.className = 'info-title';
            textEl = document.createElement('span');
            textEl.className = 'info-text';
            infoBar.innerHTML = '';
            infoBar.appendChild(titleEl);
            infoBar.appendChild(textEl);
        }
        titleEl.innerText = d.title;
        textEl.innerText = d.text;

        document.querySelectorAll('.year-marker').forEach((m, j) => m.classList.toggle('active', i === j));
        document.querySelectorAll('.year-label').forEach((l, j) => l.classList.toggle('active', i === j));
    }
    knob.setAttribute('role', 'slider');
    knob.setAttribute('aria-label', 'Project timeline');
    knob.setAttribute('aria-valuemin', '0');
    knob.setAttribute('aria-valuemax', String(timelineData.length - 1));
    knob.tabIndex = 0;
    track.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        timelineDragging = true;
        track.setPointerCapture(event.pointerId);
        moveT(event.clientY);
    });
    track.addEventListener('pointermove', (event) => {
        if (timelineDragging) moveT(event.clientY);
    });
    track.addEventListener('pointerup', () => { timelineDragging = false; });
    track.addEventListener('pointercancel', () => { timelineDragging = false; });
    knob.addEventListener('keydown', (event) => {
        const currentIndex = Number(knob.getAttribute('aria-valuenow')) || 0;
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') nextIndex++;
        else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') nextIndex--;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = timelineData.length - 1;
        else return;
        event.preventDefault();
        snapTo(Math.max(0, Math.min(timelineData.length - 1, nextIndex)));
    });
    initTimeline();
}

// 3D model animation scrubber
const modelViewer = document.getElementById('meu-dispositivo');
const animationSlider = document.getElementById('slider-abertura');
if (modelViewer && animationSlider) {
    animationSlider.disabled = true;
    animationSlider.setAttribute('aria-label', 'Open device animation');
    const seekAnimation = () => {
        const duration = Number(modelViewer.duration) || 0;
        animationSlider.disabled = duration <= 0;
        if (duration > 0) {
            modelViewer.pause();
            modelViewer.currentTime = (Number(animationSlider.value) / Number(animationSlider.max)) * duration;
        }
    };
    modelViewer.addEventListener('load', seekAnimation);
    animationSlider.addEventListener('input', seekAnimation);
}

// SPRAYER
const canvas = document.getElementById('sprayerCanvas');
const sprayer = document.getElementById('sprayerVisual');
if (canvas && sprayer) {
    const ctx = canvas.getContext('2d');
    function initS() {
        canvas.width = sprayer.offsetWidth; canvas.height = sprayer.offsetHeight;
        const img = new Image(); img.src = 'assets/images/fundo.png';
        img.onload = () => {
            ctx.globalCompositeOperation = 'source-over';
            var ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
            var nw = img.width * ratio, nh = img.height * ratio;
            ctx.drawImage(img, (canvas.width - nw) / 2, (canvas.height - nh) / 2, nw, nh);
        };
    }
    sprayer.onmousemove = (e) => {
        const r = sprayer.getBoundingClientRect();
        document.getElementById('customCursor').style.display = 'block';
        document.getElementById('customCursor').style.left = e.clientX + 'px';
        document.getElementById('customCursor').style.top = e.clientY + 'px';
        ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath();
        ctx.arc(e.clientX - r.left, e.clientY - r.top, 50, 0, Math.PI * 2); ctx.fill();
        
        // Gatilho da infeccao
        if (Math.random() > 0.5) { // Quantidade de particulas
            if (typeof InfectionSys !== 'undefined') {
                InfectionSys.createSpore(e.pageX, e.pageY);
            }
        }
    };
    sprayer.onmouseleave = () => document.getElementById('customCursor').style.display = 'none';
    new IntersectionObserver((entries) => { if (!entries[0].isIntersecting) initS(); }).observe(sprayer);
    initS();
}

// NEWS

const newsData = [
    { title: "Rio Grande do Sul records 40.28% reduction in hormonal herbicide drift cases", summary: "A report from the State Secretariat of Agriculture indicates a reduction in reported herbicide drift incidents in Rio Grande do Sul. Nevertheless, several agricultural areas remain affected...", link: "https://www-revistarural-com-br.translate.goog/2023/05/24/rs-registra-reducao-de-4028-nas-derivas-de-herbicidas-hormonais/?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=pt-BR&_x_tr_pto=wapp", img: "assets/images/news1.jpg" },
    { title: "Court bans the use of the herbicide 2,4-D in regions of Rio Grande do Sul", summary: "A regional court ordered the temporary suspension of 2,4-D use in certain areas of Rio Grande do Sul following multiple reports of damage to fruit crops.", link: "https://g1-globo-com.translate.goog/rs/rio-grande-do-sul/noticia/2025/09/04/justica-proibe-uso-de-agrotoxico-24-d-em-regioes-do-rs-herbicida-afeta-culturas-sensiveis-como-uva-e-maca.ghtml?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=pt-BR&_x_tr_pto=wapp", img: "assets/images/news2.jpg" },
    { title: "The 2,4-D impasse: soybean and grape producers' conflict", summary: "This report describes the conflict between different agricultural sectors regarding the use of 2,4-D. Soybean producers emphasize productivity, whereas grape growers report economic losses.", link: "https://www-revistarural-com-br.translate.goog/2023/05/24/rs-registra-reducao-de-4028-nas-derivas-de-herbicidas-hormonais/?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=pt-BR&_x_tr_pto=wapp", img: "assets/images/news3.jpg" },
];

const carouselTrackNews = document.getElementById('carouselTrack');
const prevNewsBtn = document.getElementById('prevNewsBtn');
const nextNewsBtn = document.getElementById('nextNewsBtn');

if (carouselTrackNews && newsData.length > 0) {

    // 1. Injetar os itens originais no HTML
    const originalHTML = newsData.map(news => `
        <div class="news-card">
            <img src="${news.img}" alt="News Image">
            <h3 class="news-headline">${news.title}</h3>
            <p style="font-family: sans-serif; color: #555; font-size: 0.9rem;">${news.summary}</p>
            <a href="${news.link}" target="_blank" style="color:var(--primary-green); font-weight:bold; text-decoration:none; font-family: sans-serif; font-size:0.9rem;">Read full report &rarr;</a>
        </div>
    `).join('');
    carouselTrackNews.innerHTML = originalHTML;

    // 2. Clonagem para efeito Infinito/Circular
    const cards = Array.from(carouselTrackNews.children);
    const firstClone = cards[0].cloneNode(true);
    const lastClone = cards[cards.length - 1].cloneNode(true);

    carouselTrackNews.appendChild(firstClone);
    carouselTrackNews.insertBefore(lastClone, cards[0]);

let currentNewsIndex = 1;
    let isTransitioning = false;

    function updateNewsCarousel(smooth = true) {
        const allCards = carouselTrackNews.children;
        if (allCards.length === 0) return;

        if (smooth) {
            carouselTrackNews.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
        } else {
            carouselTrackNews.style.transition = "none";
        }

        // Como cada card tem 100% de largura, mover em múltiplos de -100%
        // garante centralização matemática perfeita e constante
        carouselTrackNews.style.transform = `translateX(-${currentNewsIndex * 100}%)`;

        // Atualiza as classes de Destaque
        Array.from(allCards).forEach((card, idx) => {
            card.classList.remove('active-card');
            if (idx === currentNewsIndex) {
                card.classList.add('active-card');
            }
        });
    }

    // Looping infinito limpo baseado em porcentagem
    carouselTrackNews.addEventListener('transitionend', () => {
        isTransitioning = false;
        const allCards = carouselTrackNews.children;

        if (currentNewsIndex === 0) {
            carouselTrackNews.style.transition = "none";
            currentNewsIndex = allCards.length - 2;
            updateNewsCarousel(false);
        } else if (currentNewsIndex === allCards.length - 1) {
            carouselTrackNews.style.transition = "none";
            currentNewsIndex = 1;
            updateNewsCarousel(false);
        }
    });

    if (nextNewsBtn) {
        nextNewsBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentNewsIndex++;
            updateNewsCarousel();
        });
    }

    if (prevNewsBtn) {
        prevNewsBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentNewsIndex--;
            updateNewsCarousel();
        });
    }


    // Inicialização segura esperando o carregamento completo do DOM e CSS
    window.addEventListener('load', () => updateNewsCarousel(false));
    window.addEventListener('resize', () => updateNewsCarousel(false));

    // Fallback caso o evento 'load' já tenha passado
    setTimeout(() => updateNewsCarousel(false), 200);
}

function openTab(i) {
    const folderCover = document.getElementById('folderCover');
    const paper = document.getElementById('folderPaper');
    const content = document.getElementById('tab-content');

    document.querySelectorAll('.tab-btn').forEach((b, j) => b.classList.toggle('active', i === j));

    if (i === 0) {
        folderCover.style.display = 'flex';
        paper.classList.remove('visible');
    } else {
        folderCover.style.display = 'none';
        paper.classList.add('visible');

        // Exibe a notícia baseada no índice (exemplo simples)
        const news = newsData[i - 1] || newsData[0];
        content.innerHTML = `
            <img src="${news.img}" alt="News Image" style="width:100%; height:200px; object-fit:cover; border-radius:4px; margin-bottom:20px;">
            <h3 class="news-headline">${news.title}</h3>
            <p>${news.summary}</p>
            <a href="${news.link}" target="_blank" style="color:var(--primary-green); font-weight:bold;">Read more</a>
        `;
    }
}

// MOBILE MENU TOGGLE
const mobileBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
if (mobileBtn && navMenu) {
    const setMenuOpen = (isOpen) => {
        navMenu.classList.toggle('active', isOpen);
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
        mobileBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    };
    setMenuOpen(false);
    mobileBtn.addEventListener('click', () => {
        setMenuOpen(!navMenu.classList.contains('active'));
    });
    navMenu.addEventListener('click', (event) => {
        if (event.target.closest('a')) setMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') setMenuOpen(false);
    });
}
// VAGALUMES
(function () {
    const containers = [
        { el: document.getElementById('firefliesContainer'), count: 55 }
    ];
    
    containers.forEach(data => {
        if (!data.el) return;
        for (let i = 0; i < data.count; i++) {
            const f = document.createElement('div');
            f.className = 'firefly';
            f.style.left = Math.random() * 100 + '%';
            f.style.top = Math.random() * 100 + '%';
            f.style.setProperty('--duration', (2 + Math.random() * 4).toFixed(2) + 's');
            f.style.setProperty('--drift', (4 + Math.random() * 6).toFixed(2) + 's');
            f.style.setProperty('--dx', (Math.random() * 80 - 40).toFixed(0) + 'px');
            f.style.setProperty('--dy', (Math.random() * 60 - 30).toFixed(0) + 'px');
            f.style.setProperty('--max-opacity', (0.5 + Math.random() * 0.5).toFixed(2));
            f.style.animationDelay = (Math.random() * 5).toFixed(2) + 's';
            data.el.appendChild(f);
        }
    });
})();

// INFECTION & CRUMBLING (2,4-D EFFECT)
const InfectionSys = {
    level: 0,
    max: 100,
    words: [],
    infectionStarted: false,
    maxDist: 1,          

    init() {
        const moleculeInfo = document.querySelector('.molecule-info');
        if (!moleculeInfo) return;

        // Coleta apenas as palavras inteiras, sem quebrar em letras individuais
        const h3 = moleculeInfo.querySelector('h3');
        const h4 = moleculeInfo.querySelector('h4');
        
        // Função simples para envolver palavras em spans para receber a cor
        function wrapWordsSimple(element) {
            if (!element) return;
            const text = element.innerHTML;
            // Mantém as tags HTML existentes (como strong e span.green-highlight) intactas
            // Vamos apenas mapear os nós de texto das tags h3 e h4
            const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
            let node;
            let textNodes = [];
            while(node = walker.nextNode()) {
                textNodes.push(node);
            }

            textNodes.forEach(textNode => {
                const words = textNode.nodeValue.split(/(\s+)/);
                const fragment = document.createDocumentFragment();
                words.forEach(word => {
                    if (word.trim()) {
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'molecule-word';
                        wordSpan.innerText = word;
                        fragment.appendChild(wordSpan);
                    } else {
                        fragment.appendChild(document.createTextNode(word));
                    }
                });
                textNode.parentNode.replaceChild(fragment, textNode);
            });
        }

        wrapWordsSimple(h3);
        wrapWordsSimple(h4);

        this.words = Array.from(moleculeInfo.querySelectorAll('.molecule-word'));

        setTimeout(() => {
            const containerRect = moleculeInfo.getBoundingClientRect();
            const centerX = containerRect.right;
            const centerY = containerRect.top;
                          
            this.words.forEach(word => {
                const rect = word.getBoundingClientRect();
                const wordX = rect.left + rect.width / 2;
                const wordY = rect.top + rect.height / 2;
                              
                const dist = Math.sqrt(Math.pow(wordX - centerX, 2) + Math.pow(wordY - centerY, 2));
                word.dataset.dist = dist;
            });

            if (this.words.length > 0) {
                this.maxDist = Math.max(...this.words.map(w => parseFloat(w.dataset.dist) || 0));
            }
        }, 300);

        const scrollStartThreshold = 0.05;
        const scrollEndThreshold = 0.0001;              

        window.addEventListener('scroll', () => {
            const mRect = moleculeInfo.getBoundingClientRect();
            const startY = window.innerHeight * scrollStartThreshold;
            const endY = window.innerHeight * scrollEndThreshold;
            const range = startY - endY;
                          
            let rawProgress = (startY - mRect.top) / range;
            let masterProgress = Math.max(0, Math.min(1, rawProgress));
            
            // Atualiza o nível de infecção baseado no scroll (apenas cor)
            this.level = masterProgress * this.max;
            this.updateText();
        });
    },          

    startAutoInfection() {
        if (this.infectionStarted) return;
        this.infectionStarted = true;                  
        const autoInfectionInterval = setInterval(() => {
            if (this.level < this.max) {
                this.level = Math.min(this.max, this.level + 0.5);
                this.updateText();
            } else {
                clearInterval(autoInfectionInterval);
            }
        }, 50);
    },          

    createSpore(x, y) {
        const spore = document.createElement('div');
        spore.className = 'brown-spore';
        spore.style.left = x + 'px';
        spore.style.top = y + 'px';                  
        const fallDur = 2 + Math.random() * 2;
        const drift = (Math.random() - 0.5) * 200;                  
        spore.style.setProperty('--fall-dur', fallDur + 's');
        spore.style.setProperty('--drift', drift + 'px');                  
        document.body.appendChild(spore);
        setTimeout(() => { if (spore.parentNode) spore.remove(); }, fallDur * 1000);                  
        this.startAutoInfection();                  
        this.level = Math.min(this.max, this.level + 2); 
        this.updateText();
    },          

    updateText() {
        if (this.words.length === 0 || !this.maxDist) return;                  
        const currentRadius = (this.level / this.max) * (this.maxDist * 1.2);                   
        this.words.forEach(word => {
            const dist = parseFloat(word.dataset.dist) || 0;
            if (dist < currentRadius + 30) {
                word.classList.add('infected-word');
            }
        });
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InfectionSys.init());
} else {
    InfectionSys.init();
}

// Inicializa o sistema
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InfectionSys.init());
} else {
    InfectionSys.init();
}
// ==========================================
// INTERATIVIDADE DO DESIGN BIOLÓGICO
// ==========================================
const bioPins = document.querySelectorAll('.bio-pin');
const bioInfoViewer = document.getElementById('bioInfoViewer');
const bioActiveTitle = document.getElementById('bioActiveTitle');
const bioActiveDesc = document.getElementById('bioActiveDesc');

if (bioPins.length > 0 && bioInfoViewer) {
    bioPins.forEach(pin => {
        pin.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede o fechamento imediato pela janela

            const title = pin.getAttribute('data-title');
            const desc = pin.getAttribute('data-desc');

            bioActiveTitle.textContent = title;
            bioActiveDesc.textContent = desc;

            bioInfoViewer.classList.add('visible');
        });
    });

    // Fecha a janela ao clicar em qualquer área vazia do site
    window.addEventListener('click', () => {
        if (bioInfoViewer) {
            bioInfoViewer.classList.remove('visible');
        }
    });
}

// ==========================================
// INTERATIVIDADE DO VISUALIZADOR 3D DE HARDWARE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.querySelector('#meu-dispositivo');
    const slider = document.querySelector('#slider-abertura');
    const hotspotFinal = document.querySelector('#ponto-final');

    if (viewer && slider && hotspotFinal) {
        viewer.addEventListener('load', () => {
            viewer.pause();
            viewer.currentTime = 0;
            viewer.loop = false;

            // Ajuste dos materiais se aplicável (cor e brilho)
            const material = viewer.model.materials[0];
            if (material) {
                material.pbrMetallicRoughness.setBaseColorFactor([0.5, 0.5, 0.5, 1.0]);
                material.pbrMetallicRoughness.setRoughnessFactor(0.4);
            }
        });

        slider.addEventListener('input', () => {
            if (viewer.duration) {
                viewer.currentTime = slider.value * viewer.duration;
                viewer.pause();

                // Exibe o hotspot quando a animação chega perto do fim (95%)
                if (slider.value > 0.95) {
                    hotspotFinal.style.display = 'block';
                } else {
                    hotspotFinal.style.display = 'none';
                    document.getElementById('anotacao-1').style.display = 'none';
                }
            }
        });
    }
});

// Função chamada pelo clique no hotspot
window.alternarAnotacao = function(idAnotacao) {
    const anotacao = document.getElementById(idAnotacao);
    if (anotacao) {
        if (anotacao.style.display === 'block') {
            anotacao.style.display = 'none';
        } else {
            anotacao.style.display = 'block';
        }
    }
};

async function initBioGifPlayer() {
    const canvas = document.getElementById('img-bio-circuit');
    const slider = document.getElementById('bioProgress');
    const button = document.getElementById('bioPlayPause');
    const label = document.getElementById('bioTime');

    if (!canvas || !slider || !button || !label) return;
    if (canvas.dataset.playerReady) return;

    canvas.dataset.playerReady = 'true';

    try {
        const { parseGIF, decompressFrames } = await import(
            'https://cdn.jsdelivr.net/npm/gifuct-js@2.1.2/+esm'
        );

        const response = await fetch(
            'assets/images/biological_design.gif'
        );

        if (!response.ok) {
            throw new Error(`GIF: HTTP ${response.status}`);
        }

        const gif = parseGIF(await response.arrayBuffer());
        const frames = decompressFrames(gif, true);

        if (!frames.length) {
            throw new Error('O GIF não contém quadros.');
        }

        canvas.width = gif.lsd.width;
        canvas.height = gif.lsd.height;

        const ctx = canvas.getContext('2d');

        // Canvas auxiliar para compor quadros com transparência.
        const patchCanvas = document.createElement('canvas');
        const patchCtx = patchCanvas.getContext('2d');

        // Tempos de início de cada quadro, em milissegundos.
        const starts = [];
        let duration = 0;

        for (const frame of frames) {
            starts.push(duration);
            duration += Math.max(10, frame.delay || 100);
        }

        // Fundo para GIFs sem transparência.
        const background = gif.gct?.[gif.lsd.backgroundColorIndex];
        const opaqueBackground =
            frames[0].transparentIndex === undefined && background;

        function clearArea(x, y, width, height) {
            ctx.clearRect(x, y, width, height);

            if (opaqueBackground) {
                ctx.fillStyle = `rgb(${background.join(',')})`;
                ctx.fillRect(x, y, width, height);
            }
        }

        let renderedFrame = -1;
        let restoreImage = null;

        function resetCanvas() {
            clearArea(0, 0, canvas.width, canvas.height);
            renderedFrame = -1;
            restoreImage = null;
        }

        function renderFrame(target) {
            // Ao retroceder, recompõe a imagem desde o início.
            if (target < renderedFrame) {
                resetCanvas();
            }

            while (renderedFrame < target) {
                const previous = frames[renderedFrame];

                // Aplica o descarte do quadro anterior.
                if (previous?.disposalType === 2) {
                    const d = previous.dims;
                    clearArea(d.left, d.top, d.width, d.height);
                } else if (
                    previous?.disposalType === 3 &&
                    restoreImage
                ) {
                    ctx.putImageData(restoreImage, 0, 0);
                }

                const frame = frames[renderedFrame + 1];
                const d = frame.dims;

                restoreImage = frame.disposalType === 3
                    ? ctx.getImageData(
                        0, 0, canvas.width, canvas.height
                    )
                    : null;

                patchCanvas.width = d.width;
                patchCanvas.height = d.height;

                patchCtx.putImageData(
                    new ImageData(frame.patch, d.width, d.height),
                    0,
                    0
                );

                ctx.drawImage(patchCanvas, d.left, d.top);
                renderedFrame++;
            }
        }

        function frameAt(time) {
            let index = 0;

            while (
                index + 1 < frames.length &&
                starts[index + 1] <= time
            ) {
                index++;
            }

            return index;
        }

        let position = 0;
        let playing = false;
        let requestId = null;
        let lastTick = 0;

        slider.max = String(duration - 1);
        slider.disabled = false;
        button.disabled = false;

        function updateDisplay() {
            renderFrame(frameAt(position));

            slider.value = String(Math.floor(position));

            label.textContent =
                `${(position / 1000).toFixed(1)} / ` +
                `${(duration / 1000).toFixed(1)} s`;

            slider.setAttribute(
                'aria-valuetext',
                `${(position / 1000).toFixed(1)} seconds`
            );
        }

        function tick(now) {
            if (!playing) return;

            position = (position + now - lastTick) % duration;
            lastTick = now;

            updateDisplay();
            requestId = requestAnimationFrame(tick);
        }

        function pause() {
            playing = false;
            cancelAnimationFrame(requestId);
button.textContent = '▶';
button.setAttribute('aria-label', 'Play animation');
button.title = 'Play';
        }

        function play() {
            if (playing) return;

            playing = true;
button.textContent = '⏸';
button.setAttribute('aria-label', 'Pause animation');
button.title = 'Pause';
            lastTick = performance.now();
            requestId = requestAnimationFrame(tick);
        }

        button.addEventListener('click', () => {
            if (playing) {
                pause();
            } else {
                play();
            }
        });

        // Pausa assim que o usuário começa a arrastar.
        slider.addEventListener('pointerdown', pause);

        // Também funciona com as setas do teclado.
        slider.addEventListener('input', () => {
            pause();
            position = Number(slider.value);
            updateDisplay();
        });

        // Evita saltos de tempo ao voltar para a aba.
        document.addEventListener('visibilitychange', () => {
            lastTick = performance.now();
        });

        resetCanvas();
        updateDisplay();
        play();

    } catch (error) {
        console.error('Erro ao carregar o GIF:', error);

        button.textContent = 'Unavailable';
        button.disabled = true;
        slider.disabled = true;
        label.textContent = 'Could not load animation.';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBioGifPlayer);
} else {
    initBioGifPlayer();
}

function initLuminaPdfViewer() {
    const viewer = document.getElementById('luminaPdfViewer');

    if (!viewer || viewer.dataset.initialized) return;
    viewer.dataset.initialized = 'true';

    const frame = viewer.querySelector('#luminaPdfFrame');
    const link = viewer.querySelector('#luminaPdfLink');
    const label = viewer.querySelector('#luminaPdfLabel');
    const buttons = viewer.querySelectorAll('[data-module]');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Evita recarregar o módulo que já está aberto.
            if (button.getAttribute('aria-pressed') === 'true') {
                return;
            }

            const moduleNumber = button.dataset.module;
            const path = `./assets/pdf/module_${moduleNumber}.pdf`;

            buttons.forEach(item => {
                item.setAttribute(
                    'aria-pressed',
                    String(item === button)
                );
            });

            frame.title = `Lumina — Module ${moduleNumber}`;
            frame.src = path;
            link.href = path;
            label.textContent = `Module ${moduleNumber}`;
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuminaPdfViewer);
} else {
    initLuminaPdfViewer();
}

async function initScienceCards() {
    const deck = document.getElementById('scienceDeck');

    if (!deck || deck.dataset.initialized) return;
    deck.dataset.initialized = 'true';

    const board = document.getElementById('scienceCardsBoard');
    const status = document.getElementById('scienceCardsStatus');
    const reset = document.getElementById('resetScienceCards');
    const dialog = document.getElementById('scienceCardDialog');
    const largeImage = document.getElementById('scienceCardLarge');
    const close = document.getElementById('closeScienceCard');

    const cards = [];
    let topLayer = 1;

    close.addEventListener('click', () => dialog.close());

    // Fecha também ao clicar fora da janela.
    dialog.addEventListener('click', event => {
        const rect = dialog.getBoundingClientRect();

        const outside =
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom;

        if (event.target === dialog && outside) {
            dialog.close();
        }
    });

    function arrangeCards() {
        if (!cards.length || !board.clientWidth) return;

        const available = board.clientWidth;
        const padding = 24;
        const gap = 26;

        const columns = Math.max(
            1,
            Math.floor((available - padding * 2) / 190)
        );

        const width = Math.min(
            190,
            (available - padding * 2 - gap * (columns - 1))
                / columns
        );

        let tallest = 0;

        cards.forEach(card => {
            card.element.style.width = `${width}px`;

            const height = (width - 10) * card.ratio + 10;
            tallest = Math.max(tallest, height);
        });

        const rowHeight = tallest + 44;
        const rows = Math.ceil(cards.length / columns);
        const groupWidth = columns * width + (columns - 1) * gap;
        const startX = (available - groupWidth) / 2;

        board.style.height =
            `${padding * 2 + rows * rowHeight}px`;

        cards.forEach((card, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);

            card.element.style.left =
                `${startX + column * (width + gap)}px`;

            card.element.style.top =
                `${padding + row * rowHeight + (index % 3) * 6}px`;

            // Inclinações diferentes dão o efeito de cartas espalhadas.
            card.element.style.setProperty(
                '--rotation',
                `${[-6, 4, -3, 6, -4][index % 5]}deg`
            );

            card.element.style.zIndex = String(index + 1);
        });

        topLayer = cards.length + 1;
    }

    function enableCardInteraction(button, image) {
        let drag = null;
        let suppressClick = false;

        button.addEventListener('pointerdown', event => {
            if (!event.isPrimary || event.button !== 0) return;

            suppressClick = false;

            drag = {
                pointerId: event.pointerId,
                x: event.clientX,
                y: event.clientY,
                left: parseFloat(button.style.left) || 0,
                top: parseFloat(button.style.top) || 0
            };

            button.style.zIndex = String(++topLayer);
            button.setPointerCapture(event.pointerId);
        });

        button.addEventListener('pointermove', event => {
            if (!drag || event.pointerId !== drag.pointerId) return;

            const dx = event.clientX - drag.x;
            const dy = event.clientY - drag.y;

            if (Math.hypot(dx, dy) > 6) {
                suppressClick = true;
            }

            if (!suppressClick) return;

            button.classList.add('is-dragging');

            const maxX = Math.max(
                0,
                board.clientWidth - button.offsetWidth
            );

            const maxY = Math.max(
                0,
                board.clientHeight - button.offsetHeight
            );

            button.style.left =
                `${Math.max(0, Math.min(maxX, drag.left + dx))}px`;

            button.style.top =
                `${Math.max(0, Math.min(maxY, drag.top + dy))}px`;
        });

        function endDrag(event) {
            if (!drag || event.pointerId !== drag.pointerId) return;

            drag = null;
            button.classList.remove('is-dragging');

            if (button.hasPointerCapture(event.pointerId)) {
                button.releasePointerCapture(event.pointerId);
            }
        }

        button.addEventListener('pointerup', endDrag);
        button.addEventListener('pointercancel', endDrag);
        button.addEventListener('lostpointercapture', endDrag);

        button.addEventListener('click', event => {
            // Não amplia a carta depois de arrastá-la.
            if (suppressClick && event.detail !== 0) {
                suppressClick = false;
                return;
            }

            largeImage.src = image.src;
            largeImage.alt = image.alt;
            dialog.showModal();
        });
    }

    reset.addEventListener('click', arrangeCards);

    // Reorganiza ao mudar de largura ou abrir uma seção oculta.
    let previousWidth = board.clientWidth;

    const resizeObserver = new ResizeObserver(() => {
        const width = board.clientWidth;

        if (width !== previousWidth) {
            previousWidth = width;
            arrangeCards();
        }
    });

    resizeObserver.observe(board);

    try {
        // Biblioteca para ler e desenhar as páginas do PDF.
        const pdfjs = await import(
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs'
        );

        pdfjs.GlobalWorkerOptions.workerSrc =
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

        // Altere aqui se o PDF tiver outro nome.
        const pdf = await pdfjs.getDocument(
            './assets/pdf/cartas.pdf'
        ).promise;

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {
            status.textContent =
                `Loading card ${pageNumber} of ${pdf.numPages}…`;

            const page = await pdf.getPage(pageNumber);
            const original = page.getViewport({ scale: 1 });

            // Mantém a proporção original de cada página.
            const viewport = page.getViewport({
                scale: 1200 / Math.max(
                    original.width,
                    original.height
                )
            });

            const canvas = document.createElement('canvas');

            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);

            await page.render({
                canvasContext: canvas.getContext('2d'),
                viewport
            }).promise;

            const image = new Image();

            image.alt =
                `Science communication card ${pageNumber}`;

            image.draggable = false;
            image.src = canvas.toDataURL('image/jpeg', 0.9);

            await image.decode();

            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'science-card';

            button.setAttribute(
                'aria-label',
                `Enlarge card ${pageNumber}`
            );

            button.appendChild(image);
            board.appendChild(button);

            cards.push({
                element: button,
                ratio: viewport.height / viewport.width
            });

            enableCardInteraction(button, image);
            arrangeCards();

            canvas.width = 0;
            canvas.height = 0;
            page.cleanup();
        }

        reset.disabled = false;

        status.textContent =
            `${cards.length} cards — choose one to explore.`;

    } catch (error) {
        console.error('Could not load the science cards:', error);

        reset.disabled = cards.length === 0;

        status.textContent =
            'Could not load all cards. Open the complete PDF below.';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScienceCards);
} else {
    initScienceCards();
}