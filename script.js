/* =========================
   script.js — Week 7 Project
   Comentários abordam: propósito da função, parâmetros, retornos e escopo.
   ========================= */

/* ------------- Global scope variables -------------
   Variáveis definidas no escopo global (podem ser acessadas por qualquer função deste arquivo).
   Evite abusar — usado aqui para ligar UI rapidamente.
*/
const animBox = document.getElementById('animBox');
const btnAnimateBox = document.getElementById('btnAnimateBox');
const flipCard = document.getElementById('flipCard');
const openModalBtn = document.getElementById('openModal');
const closeModalBtn = document.getElementById('closeModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const startLoaderBtn = document.getElementById('startLoader');
const stopLoaderBtn = document.getElementById('stopLoader');
const loaderArea = document.getElementById('loaderArea');
const demoForm = document.getElementById('demoForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const formSuccess = document.getElementById('formSuccess');

/* =======================
   Part A — Funções utilitárias
   ======================= */

/**
 * toggleClass
 * Propósito: adicionar/remover uma classe em um elemento (reutilizável).
 * Params:
 *   el (Element) — elemento DOM alvo
 *   className (string) — classe CSS a alternar
 * Return:
 *   boolean — true se a classe foi adicionada (agora presente), false se removida
 */
function toggleClass(el, className) {
  if (!el || !className) return false;
  const added = el.classList.toggle(className);
  return added;
}

/**
 * setVisible
 * Propósito: controlar visibilidade via ARIA + classes (melhora acessibilidade).
 * Params:
 *   el (Element) — elemento
 *   show (boolean) — true para mostrar, false para esconder
 * Return: void
 */
function setVisible(el, show) {
  if (!el) return;
  if (show) {
    el.classList.add('show');
    el.setAttribute('aria-hidden', 'false');
  } else {
    el.classList.remove('show');
    el.setAttribute('aria-hidden', 'true');
  }
}

/* =======================
   Part B — Animar caixa (exemplo de função com parâmetros/retorno)
   ======================= */

/**
 * animateBox
 * Propósito: aplicar uma animação (classe .animate) a um elemento por X segundos (param).
 * Params:
 *   el (Element) — elemento DOM
 *   duration (number) — tempo em segundos que a classe ficará aplicada (default 1.2)
 * Return:
 *   Promise<boolean> — resolve true se animou, false caso não encontrado
 *
 * Observações:
 * - Mostra uso de parâmetro e retorno (Promise).
 * - Função cria escopo local (variáveis internas) e não polui o global.
 */
function animateBox(el, duration = 1.2) {
  return new Promise((resolve) => {
    if (!el) return resolve(false);

    // Função local que limpa a animação (exemplo de escopo local)
    function cleanup() {
      el.classList.remove('animate');
      resolve(true);
    }

    // Adiciona classe que contém transitions/transform no CSS
    el.classList.add('animate');

    // Se duration > 0, remove após timeout (controla o ciclo)
    if (duration > 0) {
      // convertendo segundos para ms
      setTimeout(() => {
        cleanup();
      }, Math.max(100, duration * 1000));
    } else {
      // se duration = 0 => mantem até que outra ação remova
      resolve(true);
    }
  });
}

/* Event handler do botão - demonstra uso da Promise retornada */
btnAnimateBox.addEventListener('click', async () => {
  // chamando a função com parâmetro (duration = 1.4s) e esperando retorno
  const ok = await animateBox(animBox, 1.4);
  if (ok) {
    // exemplo de ação pós-animação
    animBox.animate(
      [{ transform: 'translateY(0)' }, { transform: 'translateY(-4px)' }, { transform: 'translateY(0)' }],
      { duration: 240, easing: 'ease-out' }
    );
  }
});

/* =======================
   Part C — Card flip (evento + função reutilizável)
   ======================= */

/**
 * flipToggle
 * Propósito: virar (flip) um card alternando classe "flipped"
 * Params:
 *   cardEl (Element)
 * Return:
 *   boolean — novo estado (flipped = true/false)
 */
function flipToggle(cardEl) {
  return toggleClass(cardEl, 'flipped');
}

/* Permitir flip por hover (CSS) e também por clique/teclado */
flipCard.addEventListener('click', () => {
  const state = flipToggle(flipCard);
  flipCard.setAttribute('aria-pressed', String(state));
});
flipCard.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' || ev.key === ' ') {
    ev.preventDefault();
    flipToggle(flipCard);
  }
});

/* =======================
   Part D — Modal control (JS + CSS slide+fade)
   ======================= */

/**
 * openModal
 * Propósito: abrir modal, definir foco e permitir fechar com ESC
 * Params:
 *   none
 * Return: void
 */
function openModal() {
  setVisible(modalBackdrop, true);
  // foco no botão fechar para acessibilidade
  closeModalBtn.focus();

  // listener para ESC (tem escopo local dentro da função)
  function onKey(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  document.addEventListener('keydown', onKey);

  // Guarde a referência para remover depois (fechar irá limpar)
  modalBackdrop._escHandler = onKey;
}

/**
 * closeModal
 * Propósito: fechar modal e limpar listener
 * Params: none
 * Return: void
 */
function closeModal() {
  setVisible(modalBackdrop, false);
  // remover listener se existir
  if (modalBackdrop._escHandler) {
    document.removeEventListener('keydown', modalBackdrop._escHandler);
    delete modalBackdrop._escHandler;
  }
  // retornar foco ao botão que abriu (melhora UX)
  openModalBtn.focus();
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

/* fechar clicando na área externa (backdrop) */
modalBackdrop.addEventListener('click', (e) => {
  if (e.target === modalBackdrop) closeModal();
});

/* =======================
   Part E — Loader (start/stop) com funções reutilizáveis
   ======================= */

/**
 * createLoader
 * Propósito: cria um elemento loader (spinner) e o adiciona a um container
 * Params:
 *   container (Element)
 * Return:
 *   Element — referência ao spinner criado
 */
function createLoader(container) {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  container.appendChild(spinner);
  return spinner;
}

/**
 * removeLoader
 * Propósito: remove o elemento loader do container
 * Params:
 *   spinnerEl (Element) — elemento retornado por createLoader
 * Return:
 *   boolean — true se removido, false caso contrário
 */
function removeLoader(spinnerEl) {
  if (!spinnerEl || !spinnerEl.parentNode) return false;
  spinnerEl.parentNode.removeChild(spinnerEl);
  return true;
}

/* Lógica UI para start/stop loader (mostrando escopo local do handler) */
let currentSpinner = null;
startLoaderBtn.addEventListener('click', () => {
  if (currentSpinner) return; // já existe
  currentSpinner = createLoader(loaderArea);
});
stopLoaderBtn.addEventListener('click', () => {
  if (!currentSpinner) return;
  const ok = removeLoader(currentSpinner);
  if (ok) currentSpinner = null;
});

/* =======================
   Part F — Form validation (simples) + success animation
   ======================= */

/**
 * validateName
 * Propósito: validar nome (ex.: obrigatório, mínimo 2 caracteres)
 * Params:
 *   value (string)
 * Return:
 *   string|null — mensagem de erro ou null se válido
 */
function validateName(value) {
  const v = String(value || '').trim();
  if (v.length === 0) return 'Nome é obrigatório.';
  if (v.length < 2) return 'Nome muito curto.';
  return null;
}

/**
 * validateEmail
 * Propósito: validar formato de email (regex simples)
 * Params:
 *   value (string)
 * Return:
 *   string|null — mensagem de erro ou null se válido
 */
function validateEmail(value) {
  const v = String(value || '').trim();
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (v.length === 0) return 'Email é obrigatório.';
  if (!pattern.test(v)) return 'Formato de email inválido.';
  return null;
}

/* Handler de submit (usa as funções acima — demonstra modularidade e retorno) */
demoForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const n = nameInput.value;
  const em = emailInput.value;

  const nameErr = validateName(n);
  const emailErrMsg = validateEmail(em);

  nameError.textContent = nameErr || '';
  emailError.textContent = emailErrMsg || '';

  if (!nameErr && !emailErrMsg) {
    // sucesso: mostrar feedback animado (CSS)
    formSuccess.classList.add('show');
    // limpar campos depois de 1.2s (simula envio)
    setTimeout(() => {
      formSuccess.classList.remove('show');
      demoForm.reset();
    }, 1400);
  }
});

/* =======================
   Accessibility small improvements
   ======================= */
/* permitir fechar modal com ESC caso usuário já o tenha aberto via focus */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // fechar modal se estiver aberto
    if (modalBackdrop.classList.contains('show') || modalBackdrop.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  }
});

/* Inicia estado: modal escondido */
setVisible(modalBackdrop, false);
