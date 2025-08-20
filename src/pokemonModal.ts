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

    // stats
    const statsWrap = document.createElement('table');
    statsWrap.className = 'modal-stats';
    statsWrap.innerHTML = `
      <thead><tr><th>Stat</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>HP</td><td>${p.stats?.hp ?? ''}</td></tr>
        <tr><td>ATK</td><td>${p.stats?.atk ?? ''}</td></tr>
        <tr><td>DEF</td><td>${p.stats?.def ?? ''}</td></tr>
        <tr><td>SPA</td><td>${p.stats?.spe_atk ?? ''}</td></tr>
        <tr><td>SPD</td><td>${p.stats?.spe_def ?? ''}</td></tr>
        <tr><td>VIT</td><td>${p.stats?.vit ?? ''}</td></tr>
      </tbody>
    `;

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

      // click -> open this pokemon in the same modal
      im.addEventListener('click', async () => {
        try {
          if (evoData) {
            // if we already have full data, render it
            if (evoData.stats || evoData.sprites) {
              renderPokemon(evoData);
              return;
            }
            // otherwise try to fetch by pokedex_id
            if (typeof evoData.pokedex_id === 'number') {
              const res = await fetch(`https://tyradex.vercel.app/api/v1/pokemon/${evoData.pokedex_id}`);
              if (!res.ok) return;
              const json = await res.json();
              renderPokemon(json);
              return;
            }
          }
          // as a fallback, if image src looks like an API resource containing an id, try nothing
        } catch (err) {
          // ignore errors
        }
      });

      return wrap;
    }


    // helper to create an inline SVG arrow element
    function createArrowElement(direction: 'right' | 'left', cls?: string) {
      const wrap = document.createElement('div');
      wrap.className = cls ? cls : 'evo-arrow-small';
      const svgNs = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNs, 'svg');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('aria-hidden', 'true');
      const path = document.createElementNS(svgNs, 'path');
      if (direction === 'right') {
        path.setAttribute('d', 'M8 5l8 7-8 7');
      } else {
        path.setAttribute('d', 'M16 5l-8 7 8 7');
      }
      path.setAttribute('stroke', 'currentColor');
      path.setAttribute('stroke-width', '2');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
      wrap.appendChild(svg);
      return wrap;
    }
    // render current image with caption
    const currentCaption = (p.name && (p.name.fr || p.name.en)) ? (p.name.fr || p.name.en) : '';
    currentContainer.appendChild(createEvoItem(p.sprites?.regular || '', currentCaption, p));

    // load pre evolutions (with caption)
    if (Array.isArray(preList) && preList.length > 0) {
      const revPre = Array.from(preList).reverse();
      for (let i=0;i<revPre.length;i++) {
        const e = revPre[i];
        const caption = (typeof e.name === 'string') ? e.name : (e && e.name && (e.name.fr || e.name.en) ? (e.name.fr || e.name.en) : '');
        if (e && e.sprites && e.sprites.regular) {
          preContainer.appendChild(createEvoItem(e.sprites.regular, caption, e));
        } else if (e && typeof e.pokedex_id === 'number') {
          const placeholder = createEvoItem('', caption, e);
          preContainer.appendChild(placeholder);
          (async () => {
            try {
              const res = await fetch(`https://tyradex.vercel.app/api/v1/pokemon/${e.pokedex_id}`);
              if (!res.ok) return;
              const json = await res.json();
              const img = json?.sprites?.regular || '';
              const nm = (json?.name?.fr) ? json.name.fr : (json?.name?.en ? json.name.en : caption);
              const imgEl = placeholder.querySelector('img');
              const capEl = placeholder.querySelector('.evo-caption');
              if (imgEl && img) imgEl.src = img;
              if (capEl && nm) capEl.textContent = nm;
            } catch (err) {
              // ignore
            }
          })();
        } else {
          preContainer.appendChild(createEvoItem('', caption));
        }
        // add small arrow between pre items if not last
        if (i < revPre.length - 1) {
          preContainer.appendChild(createArrowElement('left', 'evo-arrow-small evo-arrow-small-left'));
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
          (async () => {
            try {
              const res = await fetch(`https://tyradex.vercel.app/api/v1/pokemon/${e.pokedex_id}`);
              if (!res.ok) return;
              const json = await res.json();
              const img = json?.sprites?.regular || '';
              const nm = (json?.name?.fr) ? json.name.fr : (json?.name?.en ? json.name.en : caption);
              const imgEl = placeholder.querySelector('img');
              const capEl = placeholder.querySelector('.evo-caption');
              if (imgEl && img) imgEl.src = img;
              if (capEl && nm) capEl.textContent = nm;
            } catch (err) {
              // ignore
            }
          })();
        } else {
          nextContainer.appendChild(createEvoItem('', caption));
        }
        // add small arrow between next items if not last
        if (i < nextList.length - 1) {
          nextContainer.appendChild(createArrowElement('right', 'evo-arrow-small'));
        }
      }
    }

    // arrows and assembly
    const leftArrow = preList.length > 0 ? createArrowElement('left', 'evo-arrow evo-arrow-left') : document.createElement('div');
    const rightArrow = nextList.length > 0 ? createArrowElement('right', 'evo-arrow evo-arrow-right') : document.createElement('div');

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