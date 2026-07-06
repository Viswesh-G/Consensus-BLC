'use client';

/**
 * D3 force-directed network — the "many nodes converge on consensus" metaphor.
 * Uses only d3-force, d3-selection, d3-scale submodules (not the umbrella d3).
 * Respects prefers-reduced-motion: simulation halts after one tick (static layout).
 * Added mouse interaction to repel nodes.
 */

import { useEffect, useRef } from 'react';
import { forceSimulation, forceManyBody, forceCenter, forceLink, forceCollide } from 'd3-force';
import { select } from 'd3-selection';

interface NetworkNode {
  id: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
  isCenter?: boolean;
}

interface NetworkLink {
  source: NetworkNode | number;
  target: NetworkNode | number;
}

const NODE_COUNT = 24;
const LINK_COUNT = 28; // slightly sparse — visibility over density

function buildGraph(): { nodes: NetworkNode[]; links: NetworkLink[] } {
  const nodes: NetworkNode[] = Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    isCenter: i < 3,
  }));

  const links: NetworkLink[] = [];
  // Create a connected spanning set + some extra edges
  for (let i = 1; i < nodes.length; i++) {
    links.push({ source: Math.floor(Math.random() * i), target: i });
  }
  // Extra cross-edges
  let attempts = 0;
  while (links.length < LINK_COUNT && attempts < 200) {
    attempts++;
    const a = Math.floor(Math.random() * nodes.length);
    const b = Math.floor(Math.random() * nodes.length);
    if (a !== b && !links.some(
      (l) =>
        (l.source === a && l.target === b) ||
        (l.source === b && l.target === a)
    )) {
      links.push({ source: a, target: b });
    }
  }
  return { nodes, links };
}

interface Props {
  className?: string;
}

export function NetworkCanvas({ className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const { width, height } = svg.getBoundingClientRect();
    const cx = width / 2;
    const cy = height / 2;

    let mouseX = cx;
    let mouseY = cy;

    const { nodes, links } = buildGraph();

    const sel = select(svg);
    sel.selectAll('*').remove(); // clear on re-mount / hot reload

    // ── Defs: subtle glow filter for accent nodes ────────────────────────
    const defs = sel.append('defs');
    const filter = defs.append('filter').attr('id', 'node-glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // ── Link lines ───────────────────────────────────────────────────────
    const linkGroup = sel.append('g').attr('aria-hidden', 'true');
    const linkEls = linkGroup
      .selectAll<SVGLineElement, NetworkLink>('line')
      .data(links)
      .join('line')
      .style('stroke', 'var(--node-edge)')
      .style('stroke-width', '0.75')
      .style('stroke-opacity', '0.5');

    // ── Node circles ─────────────────────────────────────────────────────
    const nodeGroup = sel.append('g').attr('aria-hidden', 'true');
    const nodeEls = nodeGroup
      .selectAll<SVGCircleElement, NetworkNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => (d.isCenter ? 6 : 4))
      .style('fill', (d) =>
        d.isCenter ? 'var(--node-color)' : 'color-mix(in oklch, var(--node-color) 60%, transparent)'
      )
      .style('stroke', 'var(--node-color)')
      .style('stroke-width', (d) => (d.isCenter ? '2' : '1'))
      .style('stroke-opacity', '0.4')
      .attr('filter', (d) => (d.isCenter ? 'url(#node-glow)' : null));

    // ── D3 force simulation ───────────────────────────────────────────────
    const simulation = forceSimulation<NetworkNode>(nodes)
      .force('charge', forceManyBody().strength(-55))
      .force('center', forceCenter(cx, cy).strength(0.08))
      .force('link', forceLink<NetworkNode, NetworkLink>(links).distance(60).strength(0.4))
      .force('collide', forceCollide(10))
      // Custom force for mouse interaction
      .force('mouse', () => {
        if (reducedMotion) return;
        const repelRadius = 150;
        const repelStrength = 1.2;
        nodes.forEach(node => {
          if (node.x === undefined || node.y === undefined) return;
          const dx = node.x - mouseX;
          const dy = node.y - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < repelRadius && distance > 0) {
            const force = ((repelRadius - distance) / repelRadius) * repelStrength;
            node.vx = (node.vx || 0) + (dx / distance) * force;
            node.vy = (node.vy || 0) + (dy / distance) * force;
          }
        });
      })
      .alphaDecay(0.025); // slow decay = more convergence animation time

    simulation.on('tick', () => {
      linkEls
        .attr('x1', (d) => (d.source as NetworkNode).x ?? 0)
        .attr('y1', (d) => (d.source as NetworkNode).y ?? 0)
        .attr('x2', (d) => (d.target as NetworkNode).x ?? 0)
        .attr('y2', (d) => (d.target as NetworkNode).y ?? 0);

      nodeEls
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0);
    });

    const handleMouseMove = (e: MouseEvent) => {
      const rect = svg.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      if (!reducedMotion) {
        simulation.alpha(0.3).restart();
      }
    };
    
    // Listen on window to catch movements outside the SVG as well,
    // making the network react fluidly as the user moves around the hero.
    window.addEventListener('mousemove', handleMouseMove);

    // prefers-reduced-motion: stop simulation after first layout tick
    if (reducedMotion) {
      simulation.tick(100); // settle positions
      simulation.stop();
      // Manually trigger one render pass
      linkEls
        .attr('x1', (d) => (d.source as NetworkNode).x ?? 0)
        .attr('y1', (d) => (d.source as NetworkNode).y ?? 0)
        .attr('x2', (d) => (d.target as NetworkNode).x ?? 0)
        .attr('y2', (d) => (d.target as NetworkNode).y ?? 0);
      nodeEls
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      simulation.stop();
      sel.selectAll('*').remove();
    };
  }, []); // intentionally no deps — canvas re-initialises on mount only

  return (
    <svg
      ref={svgRef}
      className={`w-full h-full ${className}`}
      aria-label="Animated network of nodes representing consensus validators"
      role="img"
    />
  );
}
