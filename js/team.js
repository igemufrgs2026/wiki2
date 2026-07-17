// Dados Fictícios!! Adicionar os reais depois!
const teamMembers = [
  {
    id: 1,
    name: "MARIANA",
    role: "Modelagem",
    icon: "👩‍💻",
    bioText:
      "Mariana é a mente por trás das simulações computacionais e da arquitetura do projeto web.",
    bio: 85,
    mod: 95,
    des: 60,
    health: 100,
  },
  {
    id: 2,
    name: "JOÃO",
    role: "Wet Lab",
    icon: "<img src='../../assets/images/team/joao.jpg' style='width: 100%; height: 100%; object-fit: contain; image-rendering: pixelated;'>",
    bioText:
      "Especialista em bancada, João cuida da extração de DNA e dos testes in-vitro da molécula.",
    bio: 98,
    mod: 40,
    des: 50,
    health: 100,
  },
  {
    id: 3,
    name: "ANA",
    role: "Design",
    icon: "👩‍🎨",
    bioText:
      "Criativa e detalhista, Ana transforma ciência complexa em visuais acessíveis e lindos.",
    bio: 60,
    mod: 50,
    des: 99,
    health: 100,
  },
  {
    id: 4,
    name: "CARLOS",
    role: "Eng. Genética",
    icon: "👨‍🔧",
    bioText:
      "Carlos projeta as sequências e garante que a montagem dos plasmídeos seja perfeita.",
    bio: 90,
    mod: 70,
    des: 40,
    health: 100,
  },
  {
    id: 5,
    name: "LUCAS",
    role: "Human Practices",
    icon: "🗣️",
    bioText:
      "A voz da equipe com a comunidade! Lucas conecta o projeto com a realidade local do RS.",
    bio: 70,
    mod: 60,
    des: 80,
    health: 100,
  },
  {
    id: 6,
    name: "SOFIA",
    role: "Hardware",
    icon: "⚙️",
    bioText:
      "Sofia desenvolve os equipamentos que tornam nossa detecção no campo possível e barata.",
    bio: 50,
    mod: 80,
    des: 70,
    health: 100,
  },
];

// Elementos da DOM
const rosterGrid = document.getElementById("roster-grid");
const p1Name = document.getElementById("p1-name");
const p1Sprite = document.getElementById("p1-sprite");
const statBio = document.getElementById("stat-bio");
const statMod = document.getElementById("stat-mod");
const statDes = document.getElementById("stat-des");

// Inicialização da Roster
function initRoster() {
  teamMembers.forEach((member) => {
    const slot = document.createElement("div");
    slot.className = "roster-slot";
    slot.innerHTML = member.icon;
    slot.dataset.id = member.id;

    slot.addEventListener("mouseenter", () => previewFighter(member));

    slot.addEventListener("click", () => selectFighter(member, slot));

    rosterGrid.appendChild(slot);
  });
}

function renderSegments(container, percentage) {
  container.innerHTML = "";
  const totalSegments = 10;
  const filledSegments = Math.round((percentage / 100) * totalSegments);

  for (let i = 0; i < totalSegments; i++) {
    const seg = document.createElement("div");
    seg.className = "segment";
    if (i < filledSegments) {
      seg.classList.add("filled");
    }
    container.appendChild(seg);
  }
}

function previewFighter(member) {
  p1Name.textContent = member.name;
  p1Sprite.innerHTML = member.icon;

  const bioElement = document.getElementById("p1-bio");
  if (bioElement) {
    bioElement.textContent = member.bioText;
  }

  renderSegments(statBio, member.bio);
  renderSegments(statMod, member.mod);
  renderSegments(statDes, member.des);
}

function initP2Stats() {
  document.querySelectorAll(".p2-stat").forEach((container) => {
    const value = parseInt(container.getAttribute("data-value"));
    renderSegments(container, value);
  });
}

function selectFighter(member, slotElement) {
  document
    .querySelectorAll(".roster-slot")
    .forEach((s) => s.classList.remove("active"));

  slotElement.classList.add("active");

  p1Sprite.style.transform = "scale(1.2)";
  setTimeout(() => {
    p1Sprite.style.transform = "scale(1)";
  }, 200);

  previewFighter(member);
}

let currentIndex = 0;

window.onload = () => {
  initRoster();
  initP2Stats();
  if (teamMembers.length > 0) {
    selectFighter(teamMembers[0], rosterGrid.children[0]);
  }

  window.addEventListener("keydown", (e) => {
    if (teamMembers.length === 0) return;

    if (e.key === "ArrowRight") {
      currentIndex = (currentIndex + 1) % teamMembers.length;
      selectFighter(
        teamMembers[currentIndex],
        rosterGrid.children[currentIndex],
      );
    } else if (e.key === "ArrowLeft") {
      currentIndex =
        (currentIndex - 1 + teamMembers.length) % teamMembers.length;
      selectFighter(
        teamMembers[currentIndex],
        rosterGrid.children[currentIndex],
      );
    }
  });
};
