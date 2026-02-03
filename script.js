// ========================================
// CONFIGURACIÓN
// ========================================

//  CAMBIA ESTA CONTRASEÑA POR LA QUE QUIERAS
const SECRET_PASSWORD = "mango";

// ========================================
// ELEMENTOS DEL DOM
// ========================================
const loginScreen = document.getElementById("login-screen");
const mainContent = document.getElementById("main-content");
const passwordInput = document.getElementById("password-input");
const enterBtn = document.getElementById("enter-btn");
const errorMsg = document.getElementById("error-msg");

const bgMusic = document.getElementById("bg-music");
const finalMusic = document.getElementById("final-music");

const interactiveHeart = document.getElementById("interactive-heart");
const finalMessage = document.getElementById("final-message");
const confettiCanvas = document.getElementById("confetti-canvas");

// ========================================
// LOGIN SYSTEM
// ========================================
function checkPassword() {
  const inputValue = passwordInput.value.trim().toLowerCase();

  if (inputValue === SECRET_PASSWORD.toLowerCase()) {
    // Contraseña correcta
    errorMsg.textContent = "";
    loginScreen.classList.remove("active");

    // Esperar a que termine la animación del login antes de mostrar contenido
    setTimeout(() => {
      mainContent.classList.add("active");
      // Iniciar música de storytelling
      bgMusic
        .play()
        .catch((err) => console.log("Error al reproducir música:", err));
      // Inicializar animaciones
      initScrollAnimations();
    }, 800);
  } else {
    // Contraseña incorrecta
    errorMsg.textContent = "Palabra incorrecta. Intenta de nuevo...";
    passwordInput.value = "";
    passwordInput.classList.add("shake");
    setTimeout(() => passwordInput.classList.remove("shake"), 500);
  }
}

// Event listeners para el login
enterBtn.addEventListener("click", checkPassword);
passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    checkPassword();
  }
});

// Animación de shake para error
const style = document.createElement("style");
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    .shake {
        animation: shake 0.3s ease;
    }
`;
document.head.appendChild(style);

// ========================================
// PARALLAX EFFECT
// ========================================
const parallaxLayers = [
  { element: document.getElementById("parallax-layer-1"), speed: 0.5 },
  { element: document.getElementById("parallax-layer-2"), speed: 0.3 },
  { element: document.getElementById("parallax-layer-3"), speed: 0.7 },
];

function updateParallax() {
  const scrollY = window.pageYOffset;

  parallaxLayers.forEach((layer) => {
    const yPos = -(scrollY * layer.speed);
    layer.element.style.transform = `translateY(${yPos}px)`;
  });

  requestAnimationFrame(updateParallax);
}

// Iniciar parallax cuando el contenido principal esté visible
function startParallax() {
  updateParallax();
}

// ========================================
// SCROLL ANIMATIONS & INTERSECTION OBSERVER
// ========================================
function initScrollAnimations() {
  const moments = document.querySelectorAll(".moment-content");

  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  moments.forEach((moment) => {
    observer.observe(moment);
  });

  // Observer para la sección final
  const finalSection = document.getElementById("final-section");
  const finalObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Cambiar a música final
          bgMusic.pause();
          // No reproducir automáticamente - esperar a que toque el corazón
        }
      });
    },
    { threshold: 0.5 },
  );

  finalObserver.observe(finalSection);

  // Iniciar parallax
  startParallax();
}

// ========================================
// INTERACTIVE HEART & FINAL PROPOSAL
// ========================================
let heartClicked = false;

interactiveHeart.addEventListener("click", () => {
  if (!heartClicked) {
    heartClicked = true;

    // Reproducir música de propuesta
    finalMusic
      .play()
      .catch((err) => console.log("Error al reproducir música final:", err));

    // Ocultar el corazón
    interactiveHeart.style.opacity = "0";
    interactiveHeart.style.transform = "scale(0)";

    setTimeout(() => {
      interactiveHeart.style.display = "none";

      // Mostrar mensaje final
      finalMessage.classList.remove("hidden");
      setTimeout(() => {
        finalMessage.classList.add("show");
      }, 100);

      // Lanzar confetti
      setTimeout(() => {
        launchConfetti();
      }, 500);
    }, 500);
  }
});

// ========================================
// CONFETTI SYSTEM
// ========================================
function launchConfetti() {
  const canvas = confettiCanvas;
  const ctx = canvas.getContext("2d");

  // Ajustar tamaño del canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = [];
  const confettiCount = 150;
  const colors = [
    "#ff1744",
    "#ff4081",
    "#f50057",
    "#ff6b9d",
    "#ffc1e3",
    "#fff",
  ];

  class ConfettiPiece {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height - canvas.height;
      this.size = Math.random() * 8 + 5;
      this.speedY = Math.random() * 3 + 2;
      this.speedX = Math.random() * 2 - 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 10 - 5;
      this.opacity = 1;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // Fade out al llegar al final
      if (this.y > canvas.height * 0.8) {
        this.opacity -= 0.01;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Crear confetti
  for (let i = 0; i < confettiCount; i++) {
    confettiPieces.push(new ConfettiPiece());
  }

  // Animar confetti
  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    confettiPieces.forEach((piece, index) => {
      piece.update();
      piece.draw();

      // Eliminar piezas que ya no son visibles
      if (piece.opacity <= 0 || piece.y > canvas.height) {
        confettiPieces.splice(index, 1);
      }
    });

    if (confettiPieces.length > 0) {
      requestAnimationFrame(animateConfetti);
    }
  }

  animateConfetti();
}

// Ajustar canvas al redimensionar ventana
window.addEventListener("resize", () => {
  if (confettiCanvas) {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
});

// ========================================
// CAMBIO DE ATMÓSFERA (COLOR TRANSITION)
// ========================================
// El cambio de atmósfera ya está manejado por las clases CSS
// nostalgic -> transition-zone -> vibrant
// que se aplican directamente en el HTML

// ========================================
// SMOOTH SCROLL ENHANCEMENTS
// ========================================
// Mejorar el scroll suave en dispositivos móviles
document.addEventListener(
  "touchmove",
  function (e) {
    // Permitir scroll natural
  },
  { passive: true },
);

// ========================================
// CONTROL DE MÚSICA
// ========================================
// Asegurar que la música se pause/reproduzca correctamente
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    bgMusic.pause();
    finalMusic.pause();
  }
});

// ========================================
// INICIALIZACIÓN
// ========================================
// Cuando la página carga, mostrar la pantalla de login
window.addEventListener("load", () => {
  loginScreen.classList.add("active");
});

// ========================================
// DEBUGGING (Opcional - comentar en producción)
// ========================================
console.log("🎉 Sistema de storytelling inicializado");
console.log("💝 Cambia la contraseña en la línea 7 de script.js");
console.log("🎵 Asegúrate de colocar las canciones en /assets/audio/");
console.log(
  "📸 Coloca las 7 imágenes en /assets/img/ como momento1.jpg, momento2.jpg, etc.",
);
