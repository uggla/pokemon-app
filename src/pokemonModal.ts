import { getPokemonById } from './pokemonStore.ts';

export function setupPokemonModal() {
  // create overlay
  const overlay = document.createElement('div');
  overlay.id = 'pokemon-modal-overlay';
  overlay.className = 'modal-overlay hidden';

  const card = document.createElement('div');
  card.className = 'modal-card';
  card.setAttribute('role', 'dialog');
  card.setAttribute('aria-hidden', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.type = 'button';
  closeBtn.title = 'Close';
  closeBtn.textContent = '✕';

  const content = document.createElement('div');
  content.className = 'modal-content';

  card.appendChild(closeBtn);
  card.appendChild(content);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  function renderPokemon(p: any) {
    content.innerHTML = '';
    if (!p) return;

    const header = document.createElement('div');
    header.className = 'modal-header';

    const img = document.createElement('img');
    img.src = p.sprites?.regular || '';
    img.alt = p.name?.fr || p.name?.en || '';
    img.className = 'modal-sprite';
    // wrap the sprite so we can add a shimmering overlay
    const spriteWrap = document.createElement('div');
    spriteWrap.className = 'modal-sprite-wrap';
    spriteWrap.appendChild(img);

    const titles = document.createElement('div');
    titles.className = 'modal-titles';
    const nameFr = document.createElement('h2');
    nameFr.textContent = p.name?.fr || '';
    const nameEn = document.createElement('div');
    nameEn.className = 'muted';
    nameEn.textContent = p.name?.en ? `(${p.name.en})` : '';

    titles.appendChild(nameFr);
    titles.appendChild(nameEn);

    header.appendChild(spriteWrap);
    header.appendChild(titles);

    const meta = document.createElement('div');
    meta.className = 'modal-meta';
    meta.innerHTML = `
      <div><strong>Generation:</strong> ${p.generation ?? ''}</div>
      <div><strong>Category:</strong> ${p.category ?? ''}</div>
    `;

    // types
    const typesWrap = document.createElement('div');
    typesWrap.className = 'modal-types';
    if (Array.isArray(p.types)) {
      p.types.forEach((t: any) => {
        const tEl = document.createElement('div');
        tEl.className = 'type-badge';
        const imgT = document.createElement('img');
        imgT.src = t.image || '';
        imgT.alt = t.name || ''; 
        imgT.width = 20;
        imgT.height = 20;
        const span = document.createElement('span');
        span.textContent = t.name || '';
        tEl.appendChild(imgT);
        tEl.appendChild(span);
        typesWrap.appendChild(tEl);
      });
    }

    // stats -> render as radar SVG
    function buildRadar(stats: any) {
      const labels = ['HP','ATK','DEF','SPA','SPD','VIT'];
      const keys = ['hp','atk','def','spe_atk','spe_def','vit'];
      const vals = keys.map(k => Number(stats?.[k] ?? 0));
      const maxVal = Math.max(255, ...vals);
      const vw = 400;
      const vh = 300;
      const cx = -50 + vw / 2; // center x based on viewBox -50
      const cy = -10 + vh / 2; // center y based on viewBox -10
      const radius = Math.min(vw, vh) / 2 - 36;
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('viewBox', '-50 -10 400 300');
      svg.setAttribute('width', '350');
      svg.setAttribute('height', '350');
      svg.classList.add('radar-svg');

      const levels = 4;
      for (let L = levels; L >= 1; L--) {
        const r = radius * (L / levels);
        const points: string[] = [];
        for (let i = 0; i < labels.length; i++) {
          const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          points.push(`${x},${y}`);
        }
        const poly = document.createElementNS(ns, 'polygon');
        poly.setAttribute('points', points.join(' '));
        poly.setAttribute('fill', L % 2 ? 'rgba(255,0,0,0.03)' : 'transparent');
        poly.setAttribute('stroke', '#f5eaea');
        poly.setAttribute('stroke-width', '1');
        svg.appendChild(poly);
      }

      // axes and labels (labels include values, in white)
      for (let i = 0; i < labels.length; i++) {
        const angle = (Math.PI * 2 / labels.length) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy));
        line.setAttribute('x2', String(x)); line.setAttribute('y2', String(y));
        line.setAttribute('stroke', '#f7eaea'); line.setAttribute('stroke-width', '1');
        svg.appendChild(line);

        // label with value
        const v = vals[i];
        const tx = cx + Math.cos(angle) * (radius + 20);
        const ty = cy + Math.sin(angle) * (radius + 20);
        const text = document.createElementNS(ns, 'text');
        text.setAttribute('x', String(tx)); text.setAttribute('y', String(ty));
        text.setAttribute('fill', '#ffffff'); text.setAttribute('font-size', '13');
        text.setAttribute('font-weight', '700');
        const cos = Math.cos(angle);
        const anchor = cos > 0.3 ? 'start' : (cos < -0.3 ? 'end' : 'middle');
        text.setAttribute('text-anchor', anchor);
        text.textContent = `${labels[i]} (${v})`;
        svg.appendChild(text);
      }

      // stats polyline (highlighted) — no point markers
      const pts: string[] = [];
      for (let i = 0; i < vals.length; i++) {
        const v = vals[i];
        const r = radius * (v / maxVal);
        const angle = (Math.PI * 2 / vals.length) * i - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        pts.push(`${x},${y}`);
      }
      const polygon = document.createElementNS(ns, 'polygon');
      polygon.setAttribute('points', pts.join(' '));
      polygon.setAttribute('fill', 'rgba(255,0,0,0.45)');
      polygon.setAttribute('stroke', '#b30000');
      polygon.setAttribute('stroke-width', '2.5');
      polygon.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(polygon);

      const wrap = document.createElement('div');
      wrap.className = 'modal-stats';
      wrap.setAttribute('style', 'margin-right: 6.5rem;');
      wrap.appendChild(svg);
      return wrap;
    }

const statsWrap = buildRadar(p.stats || {});

    // (talents removed per request)

    // names in other languages
    const namesWrap = document.createElement('div');
    namesWrap.className = 'modal-names';
    if (p.name && typeof p.name === 'object') {
      const ulNames = document.createElement('ul');
      // show only English and Japanese
      for (const [lang, val] of Object.entries(p.name)) {
        if (lang !== 'en' && lang !== 'jp') continue;
        const li = document.createElement('li');
        li.textContent = `${String(val)} (${String(lang)})`;
        ulNames.appendChild(li);
      }
      namesWrap.appendChild(ulNames);
    }

    // group meta + names into an info block so it can be moved upward
    const infoWrap = document.createElement('div');
    infoWrap.className = 'modal-info';
    infoWrap.setAttribute('style', 'margin-top: -9.5rem;');
    infoWrap.appendChild(meta);
    infoWrap.appendChild(namesWrap);

    // evolution chain / images
    const evoWrap = document.createElement('div');
    evoWrap.className = 'modal-evolution';

    // (no standalone helper) fetching is done inline so we can update caption as well

    const evo = p.evolution || p.evolutions || p.evo || null;
    // layout: [pre...] <- current -> [next...]
    const preList = (evo && Array.isArray(evo.pre)) ? evo.pre : [];
    const nextList = (evo && (Array.isArray(evo.next) ? evo.next : (evo.next ? [evo.next] : []))) ? (Array.isArray(evo.next) ? evo.next : (evo.next ? [evo.next] : [])) : [];

    // containers
    const preContainer = document.createElement('div');
    preContainer.className = 'evo-side evo-pre';
    const currentContainer = document.createElement('div');
    currentContainer.className = 'evo-center';
    const nextContainer = document.createElement('div');
    nextContainer.className = 'evo-side evo-next';

    // helper to create evolution item (image + caption)
    function createEvoItem(imgSrc: string, caption: string, evoData?: any) {
      const wrap = document.createElement('div');
      wrap.className = 'evo-item';
      const im = document.createElement('img');
      im.className = 'evo-target';
      im.src = imgSrc || '';
      im.alt = caption || '';
      im.style.cursor = 'pointer';
      const cap = document.createElement('div');
      cap.className = 'evo-caption';
      cap.textContent = caption || '';
      wrap.appendChild(im);
      wrap.appendChild(cap);

      // click -> open this pokemon in the same modal (lookup from global list)
      im.addEventListener('click', () => {
        try {
          if (evoData) {
            // if we already have full data, render it
            if (evoData.stats || evoData.sprites) {
              renderPokemon(evoData);
              return;
            }
            // otherwise try to lookup by pokedex_id from global list
            if (typeof evoData.pokedex_id === 'number') {
              try {
                const found = getPokemonById(evoData.pokedex_id);
                if (found) renderPokemon(found);
              } catch (_) { /* ignore */ }
              return;
            }
          }
        } catch (err) {
          // ignore errors
        }
      });

      return wrap;
    }


    // render current image with caption
    const currentCaption = (p.name && (p.name.fr || p.name.en)) ? (p.name.fr || p.name.en) : '';
    currentContainer.appendChild(createEvoItem(p.sprites?.regular || '', currentCaption, p));

    // load pre evolutions (with caption)
    if (Array.isArray(preList) && preList.length > 0) {
      // keep the original order: oldest -> ... -> immediate pre-evo
      const revPre = Array.from(preList);
      for (let i=0;i<revPre.length;i++) {
        const e = revPre[i];
        const caption = (typeof e.name === 'string') ? e.name : (e && e.name && (e.name.fr || e.name.en) ? (e.name.fr || e.name.en) : '');
        if (e && e.sprites && e.sprites.regular) {
          preContainer.appendChild(createEvoItem(e.sprites.regular, caption, e));
        } else if (e && typeof e.pokedex_id === 'number') {
          const placeholder = createEvoItem('', caption, e);
          preContainer.appendChild(placeholder);
                      // try to lookup in the global list instead of calling API
            try {
              const found = getPokemonById(Number(e.pokedex_id));
              if (found) {
                const img = found.sprites?.regular || '';
                const nm = (found.name?.fr) ? found.name.fr : (found.name?.en ? found.name.en : caption);
                const imgEl = placeholder.querySelector('img') as HTMLImageElement | null;
                const capEl = placeholder.querySelector('.evo-caption');
                if (imgEl && img) imgEl.src = img;
                if (capEl && nm) capEl.textContent = nm;
              }
            } catch (err) {
              // ignore
            }
        } else {
          preContainer.appendChild(createEvoItem('', caption));
        }
        // add small arrow between pre items if not last
        if (i < revPre.length - 1) {
          const small = document.createElement('div'); small.className='evo-arrow-small'; small.textContent='→'; preContainer.appendChild(small);
        }
      }
    }

    // load next evolutions
    if (Array.isArray(nextList) && nextList.length > 0) {
      for (let i=0;i<nextList.length;i++) {
        const e = nextList[i];
        const caption = (typeof e.name === 'string') ? e.name : (e && e.name && (e.name.fr || e.name.en) ? (e.name.fr || e.name.en) : '');
        if (e && e.sprites && e.sprites.regular) {
          nextContainer.appendChild(createEvoItem(e.sprites.regular, caption, e));
        } else if (e && typeof e.pokedex_id === 'number') {
          const placeholder = createEvoItem('', caption, e);
          nextContainer.appendChild(placeholder);
                      // try to lookup in the global list instead of calling API
            try {
              const found = getPokemonById(Number(e.pokedex_id));
              if (found) {
                const img = found.sprites?.regular || '';
                const nm = (found.name?.fr) ? found.name.fr : (found.name?.en ? found.name.en : caption);
                const imgEl = placeholder.querySelector('img') as HTMLImageElement | null;
                const capEl = placeholder.querySelector('.evo-caption');
                if (imgEl && img) imgEl.src = img;
                if (capEl && nm) capEl.textContent = nm;
              }
            } catch (err) {
              // ignore
            }
        } else {
          nextContainer.appendChild(createEvoItem('', caption));
        }
        // add small arrow between next items if not last
        if (i < nextList.length - 1) {
          const small = document.createElement('div'); small.className='evo-arrow-small'; small.textContent='→'; nextContainer.appendChild(small);
        }
      }
    }

    // arrows and assembly
    const leftArrow = document.createElement('div'); leftArrow.className='evo-arrow evo-arrow-left'; leftArrow.textContent = preList.length > 0 ? '→' : '';
    const rightArrow = document.createElement('div'); rightArrow.className='evo-arrow evo-arrow-right'; rightArrow.textContent = nextList.length > 0 ? '→' : '';

    evoWrap.appendChild(preContainer);
    evoWrap.appendChild(leftArrow);
    evoWrap.appendChild(currentContainer);
    evoWrap.appendChild(rightArrow);
    evoWrap.appendChild(nextContainer);
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Raw data';
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(p, null, 2);
    details.appendChild(summary);
    details.appendChild(pre);

    // place stats at top-right: create header row
    const headerRow = document.createElement('div');
    headerRow.className = 'modal-header-row';
    headerRow.appendChild(header);
    headerRow.appendChild(statsWrap);

    content.appendChild(headerRow);
    // append grouped info (generation/category + localized names)
    content.appendChild(infoWrap);
    content.appendChild(evoWrap);
    content.appendChild(typesWrap);
    content.appendChild(details);

    // trigger shimmer once on the main sprite whenever we render the card
    try {
      const spriteWrap = content.querySelector('.modal-sprite-wrap');
      if (spriteWrap) {
        spriteWrap.classList.add('shimmer-once');
        const handler = () => {
          spriteWrap.classList.remove('shimmer-once');
          spriteWrap.removeEventListener('animationend', handler as any);
        };
        spriteWrap.addEventListener('animationend', handler as any);
      }
    } catch (e) {
      // ignore
    }
  }

  function open(p: any) {
    renderPokemon(p);
    overlay.classList.remove('hidden');
    card.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus close for accessibility
    closeBtn.focus();

    // shimmer is triggered in renderPokemon so it also plays on card updates
  }

  function close() {
    overlay.classList.add('hidden');
    card.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) close();
  });
  closeBtn.addEventListener('click', () => close());
  window.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') close();
  });

  window.addEventListener('pokemon:show', (ev: Event) => {
    const custom = ev as CustomEvent;
    const p = custom.detail;
    if (p) open(p);
  });
}