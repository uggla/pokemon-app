type Pokemon = any;

function createSvg(width: number, height: number) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  return svg;
}

function clearElement(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function setupPokemonChart() {
  const container = document.querySelector<HTMLDivElement>('#pokemon-chart')!;
  const select = document.querySelector<HTMLSelectElement>('#chart-stat')!;

  let currentVisible: Pokemon[] = [];

  function render() {
    clearElement(container);
    if (!currentVisible || currentVisible.length === 0) return;

    const statKey = select.value;
    // try to match table width; fallback to window-based width
    const tableEl = document.querySelector<HTMLTableElement>('#pokemons-table');
    const tableWidth = tableEl ? tableEl.clientWidth : 0;
    const width = tableWidth > 100 ? tableWidth : Math.max(700, Math.min(1100, window.innerWidth - 200));
    // double the previous height for better readability
    const height = 720;
    const margin = { top: 24, right: 20, bottom: 80, left: 80 };
    const svgW = width;
    const svgH = height;
    const svg = createSvg(svgW, svgH);

    // compute values
    const values = currentVisible.map(p => Number(p.stats?.[statKey] ?? 0));
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const range = maxV - minV || 1;

    const innerW = svgW - margin.left - margin.right;
    const innerH = svgH - margin.top - margin.bottom;

    // axes and grid
    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

    // horizontal grid + y axis labels
    const yTicks = 5;
    for (let ti = 0; ti <= yTicks; ti++) {
      const v = minV + (ti / yTicks) * (maxV - minV);
      const y = innerH - ((v - minV) / range) * innerH;
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('x2', String(innerW));
      line.setAttribute('y1', String(y));
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'rgba(255,255,255,0.04)');
      line.setAttribute('stroke-width', '1');
      g.appendChild(line);

      const label = document.createElementNS(ns, 'text');
      label.setAttribute('x', String(-8));
      label.setAttribute('y', String(y + 4));
      label.setAttribute('font-size', '11');
      label.setAttribute('fill', '#aaa');
      label.setAttribute('text-anchor', 'end');
      label.textContent = String(Math.round(v));
      g.appendChild(label);
    }

    // y axis
    const yAxis = document.createElementNS(ns, 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', String(innerH));
    yAxis.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    yAxis.setAttribute('stroke-width', '1.5');
    g.appendChild(yAxis);

    // x axis
    const xAxis = document.createElementNS(ns, 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', String(innerH));
    xAxis.setAttribute('x2', String(innerW));
    xAxis.setAttribute('y2', String(innerH));
    xAxis.setAttribute('stroke', 'rgba(255,255,255,0.08)');
    xAxis.setAttribute('stroke-width', '1.5');
    g.appendChild(xAxis);

    // polyline points
    const points: string[] = [];
    currentVisible.forEach((p, i) => {
      const x = (i / Math.max(1, currentVisible.length - 1)) * innerW;
      const v = Number(p.stats?.[statKey] ?? 0);
      const y = innerH - ((v - minV) / range) * innerH;
      points.push(`${x},${y}`);
    });

    const poly = document.createElementNS(ns, 'polyline');
    poly.setAttribute('points', points.join(' '));
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', '#646cff');
    poly.setAttribute('stroke-width', '3');
    poly.setAttribute('stroke-linejoin', 'round');
    poly.setAttribute('stroke-linecap', 'round');
    g.appendChild(poly);

    // add points with images and labels
    currentVisible.forEach((p, i) => {
      const x = (i / Math.max(1, currentVisible.length - 1)) * innerW;
      const v = Number(p.stats?.[statKey] ?? 0);
      const y = innerH - ((v - minV) / range) * innerH;

      // image
      const imgSize = 28;
      const image = document.createElementNS(ns, 'image');
      image.setAttribute('href', p.sprites?.regular || '');
      image.setAttribute('width', String(imgSize));
      image.setAttribute('height', String(imgSize));
      image.setAttribute('x', String(x - imgSize / 2));
      image.setAttribute('y', String(y - imgSize / 2));
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      image.setAttribute('class', 'chart-point-image');
      image.setAttribute('aria-hidden', 'true');
      // make image clickable to show modal
      // add pointer cursor
      image.setAttribute('style', 'cursor: pointer');
      image.addEventListener('click', () => {
        try {
          const ev = new CustomEvent('pokemon:show', { detail: p });
          window.dispatchEvent(ev);
        } catch (e) {
          // ignore
        }
      });
      const title = document.createElementNS(ns, 'title');
      title.textContent = `${p.name?.fr || p.name?.en || ''} — ${statKey}: ${v}`;
      image.appendChild(title);
      g.appendChild(image);

      // label
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', String(x + imgSize / 2 + 6));
      text.setAttribute('y', String(y + 6));
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', '#ddd');
      text.textContent = p.name?.fr || p.name?.en || '';
      g.appendChild(text);

      // x tick
      const tick = document.createElementNS(ns, 'line');
      tick.setAttribute('x1', String(x));
      tick.setAttribute('y1', String(innerH));
      tick.setAttribute('x2', String(x));
      tick.setAttribute('y2', String(innerH + 6));
      tick.setAttribute('stroke', 'rgba(255,255,255,0.06)');
      g.appendChild(tick);
    });

    svg.appendChild(g);
    container.appendChild(svg);
  }

  // event listeners
  window.addEventListener('pokemons:visible', (ev: Event) => {
    const custom = ev as CustomEvent;
    currentVisible = Array.isArray(custom.detail) ? custom.detail : [];
    render();
  });

  select.addEventListener('change', () => render());
}
