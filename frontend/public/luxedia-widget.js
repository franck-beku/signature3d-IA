/**
 * Luxedia Widget — script d'amorçage pour intégration sur un site tiers.
 *
 * Installation cliente (un seul tag, aucune dépendance) :
 *   <script src="https://.../luxedia-widget.js" data-project="mon-slug"></script>
 *   optionnel : data-position="bottom-left" (défaut : "bottom-right")
 *
 * Ce script ne fait QUE de la mise en page côté site hôte : bulle flottante, panneau,
 * ouverture/fermeture. Il n'appelle JAMAIS l'API Chat lui-même — toute la logique
 * conversationnelle (moteur, session, couleurs, avatar, suggestions) vit dans l'iframe,
 * chargée depuis notre propre domaine (/embed/{slug}?mode=widget), qui réutilise
 * exactement le même composant AmbassadeurIA que le lien autonome et l'embed Matterport.
 * Aucun secret, aucune clé, aucune donnée métier codée en dur ici.
 */
(function () {
  'use strict';

  // Empêche la double init si le snippet est injecté deux fois (deux tags, ou un CMS qui
  // duplique le script) — le tout premier exécuté gagne, les suivants ne font rien.
  if (window.__luxediaWidgetLoaded) return;
  window.__luxediaWidgetLoaded = true;

  var CURRENT_SCRIPT = document.currentScript;
  if (!CURRENT_SCRIPT) return; // chargement dynamique inhabituel — pas de data-attributes lisibles, on abandonne proprement

  var slug = CURRENT_SCRIPT.getAttribute('data-project');
  if (!slug) {
    console.error('[Luxedia] Attribut data-project manquant sur le script luxedia-widget.js.');
    return;
  }

  var position = CURRENT_SCRIPT.getAttribute('data-position') || 'bottom-right';
  if (['bottom-right', 'bottom-left', 'top-right', 'top-left'].indexOf(position) === -1) {
    position = 'bottom-right';
  }

  var origin;
  try {
    origin = new URL(CURRENT_SCRIPT.src).origin;
  } catch (e) {
    console.error('[Luxedia] Impossible de déterminer le domaine du script.');
    return;
  }

  var embedUrl = origin + '/embed/' + encodeURIComponent(slug) + '?mode=widget&src=iframe';

  var READY_TIMEOUT_MS = 10000;
  var DEFAULT_COLOR = '#d4af37';

  var isOpen = false;
  var isReady = false; // devient true seulement après réception de luxedia:ready
  var primaryColor = null;
  var ambassadorName = null;

  // ── Isolation CSS totale : tout vit dans un Shadow DOM, imperméable aux styles du site
  //    hôte dans les deux sens (son CSS ne peut pas casser Luxedia, et l'inverse). ──
  var hostEl = document.createElement('div');
  hostEl.id = 'luxedia-widget-host';
  hostEl.style.all = 'initial'; // isole l'élément hôte lui-même avant même le Shadow DOM
  document.body.appendChild(hostEl);
  var root = hostEl.attachShadow({ mode: 'open' });

  var isCorner = function (edge) { return position.indexOf(edge) !== -1; };
  var vSide = isCorner('top') ? 'top' : 'bottom';
  var hSide = isCorner('left') ? 'left' : 'right';

  var style = document.createElement('style');
  style.textContent = [
    ':host { all: initial; }',
    '* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
    '.bubble {',
    '  position: fixed; ' + vSide + ': 24px; ' + hSide + ': 24px; z-index: 999999;',
    '  width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  background: ' + DEFAULT_COLOR + '; box-shadow: 0 8px 24px rgba(0,0,0,0.35);',
    '  opacity: 0; transform: scale(0.8); pointer-events: none;',
    '  transition: opacity 0.25s ease, transform 0.25s ease, background-color 0.2s ease;',
    '}',
    '.bubble.visible { opacity: 1; transform: scale(1); pointer-events: auto; }',
    '.bubble svg { width: 26px; height: 26px; }',
    '.panel {',
    '  position: fixed; ' + vSide + ': 96px; ' + hSide + ': 24px; z-index: 999998;',
    '  width: 400px; height: 620px; max-height: calc(100vh - 120px);',
    '  border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.45);',
    '  display: none; background: #0d0d0d;',
    '}',
    '.panel.open { display: block; }',
    '.panel iframe { width: 100%; height: 100%; border: 0; display: block; }',
    '.close-btn {',
    '  position: absolute; top: 10px; right: 10px; z-index: 1;',
    '  width: 28px; height: 28px; border-radius: 8px; border: none; cursor: pointer;',
    '  background: rgba(0,0,0,0.35); color: rgba(255,255,255,0.8); font-size: 15px;',
    '  display: flex; align-items: center; justify-content: center;',
    '}',
    '.close-btn:hover { background: rgba(0,0,0,0.55); }',
    '@media (max-width: 480px) {',
    '  .panel {',
    '    top: 0; left: 0; right: 0; bottom: 0; width: 100%; height: 100%; max-height: 100%;',
    '    border-radius: 0;',
    '    padding-top: env(safe-area-inset-top); padding-bottom: env(safe-area-inset-bottom);',
    '    padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right);',
    '  }',
    '  .bubble { ' + vSide + ': 16px; ' + hSide + ': 16px; }',
    '}',
  ].join('\n');
  root.appendChild(style);

  var bubble = document.createElement('button');
  bubble.className = 'bubble';
  bubble.setAttribute('aria-label', 'Ouvrir l\'assistant Luxedia');
  bubble.setAttribute('aria-expanded', 'false');
  bubble.innerHTML =
    '<svg viewBox="0 0 22 22" fill="none" stroke="#0a0a0a" stroke-width="1.5">' +
    '<polygon points="11,2 20,7 20,15 11,20 2,15 2,7"/>' +
    '<line x1="11" y1="2" x2="11" y2="11" stroke-width="0.8"/>' +
    '<line x1="2" y1="7" x2="11" y2="11" stroke-width="0.8"/>' +
    '<line x1="20" y1="7" x2="11" y2="11" stroke-width="0.8"/>' +
    '</svg>';
  root.appendChild(bubble);

  var panel = document.createElement('div');
  panel.className = 'panel';
  var closeBtn = document.createElement('button');
  closeBtn.className = 'close-btn';
  closeBtn.setAttribute('aria-label', 'Fermer');
  closeBtn.textContent = '✕';
  var iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.title = 'Assistant Luxedia';
  iframe.setAttribute('allow', 'clipboard-write');
  panel.appendChild(closeBtn);
  panel.appendChild(iframe);
  root.appendChild(panel);

  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    bubble.setAttribute('aria-expanded', 'true');
    try { iframe.contentWindow && iframe.contentWindow.focus(); } catch (e) { /* cross-origin, sans conséquence */ }
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    bubble.setAttribute('aria-expanded', 'false');
    bubble.focus();
  }

  bubble.addEventListener('click', function () {
    if (isOpen) closePanel(); else openPanel();
  });
  closeBtn.addEventListener('click', closePanel);

  // ── Réception du branding réel depuis l'iframe (jamais l'inverse — le script n'appelle
  //    jamais l'API lui-même). Tant qu'aucun message n'arrive (projet inexistant, non
  //    publié, Luxedia désactivée, panne backend...), la bulle ne s'affiche jamais : c'est
  //    la façon la plus sûre de rendre le widget "absent" sans jamais montrer un état cassé. */
  window.addEventListener('message', function (event) {
    if (event.origin !== origin || event.source !== iframe.contentWindow) return;
    var data = event.data;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'luxedia:ready') {
      isReady = true;
      primaryColor = data.primaryColor || DEFAULT_COLOR;
      ambassadorName = data.ambassadorName || null;
      bubble.style.background = primaryColor;
      if (ambassadorName) iframe.title = ambassadorName + ' — assistant';
      bubble.classList.add('visible');
    } else if (data.type === 'luxedia:disabled') {
      isReady = false; // reste caché — Luxedia n'est pas active sur ce projet
    }
  });

  // Filet de sécurité : si rien n'arrive (panne, slug invalide...), le widget reste
  // silencieusement absent plutôt que d'afficher une bulle qui ouvrirait un chat cassé.
  setTimeout(function () {
    if (!isReady) bubble.classList.remove('visible');
  }, READY_TIMEOUT_MS);
})();
