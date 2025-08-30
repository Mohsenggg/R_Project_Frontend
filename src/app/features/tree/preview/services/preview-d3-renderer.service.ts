import { Injectable, ElementRef } from '@angular/core';
import * as d3 from 'd3';

export interface D3SectionState {
  svg: any; g: any; width: number; height: number;
  margin: {top:number; right:number; bottom:number; left:number};
  levelGap: number; nodeRadius: number; zoom: any; dataRoot: any; scaleFactor: number;
}

export interface RenderOptions {
  onNodeDblClick?: (d:any)=>void;
  getFill?: (d:any)=>string;
  getStroke?: (d:any)=>string;
}

@Injectable({ providedIn: 'root' })
export class PreviewD3RendererService {

  createState(): D3SectionState {
    return { svg: null, g: null, width: 0, height: 0,
      margin: { top: 16, right: 16, bottom: 24, left: 16 },
      levelGap: 120, nodeRadius: 6, zoom: null, dataRoot: null, scaleFactor: 1 };
  }

  drawInto(element: HTMLElement, state: D3SectionState, data: any | null, opts?: RenderOptions): void {
    d3.select(element).selectAll('*').remove();
    if (data) { state.dataRoot = data; }
    const dataRoot = state.dataRoot || data || { name: 'Empty' };

    const rect = element.getBoundingClientRect();
    state.width = Math.max(320, rect.width || (element as any).clientWidth || 800);
    state.height = Math.max(260, rect.height || (element as any).clientHeight || 300);
    state.levelGap = state.width < 600 ? 90 : 120;

    state.svg = d3.select(element).append('svg')
      .attr('width', '100%').attr('height', '100%')
      .attr('viewBox', `0 0 ${state.width} ${state.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    state.g = state.svg.append('g')
      .attr('transform', `translate(${state.margin.left},${state.margin.top})`);

    const tree = d3.tree<any>().size([
      state.width - state.margin.left - state.margin.right,
      state.height - state.margin.top - state.margin.bottom
    ]).separation((a: any, b: any) => (a.parent === b.parent ? 1.2 : 1.6));

    const root = d3.hierarchy(dataRoot);
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.links();

    nodes.forEach((d: any) => { d.y = d.depth * state.levelGap; });

    const scale = state.scaleFactor || 1;
    let clickTimeout: any = null;

    const node = state.g.selectAll('g.node').data(nodes).enter().append('g')
      .attr('class','node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .on('click', (_event: any, d: any) => {
        if (clickTimeout) clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => {
          if (d.data.children) { d.data._children = d.data.children; d.data.children = undefined; }
          else if (d.data._children) { d.data.children = d.data._children; d.data._children = undefined; }
          this.drawInto(element, state, null, opts);
        }, 220);
      })
      .on('dblclick', (_event: any, d: any) => { if (opts?.onNodeDblClick) opts.onNodeDblClick(d); });

    node.append('circle')
      .attr('r', state.nodeRadius * scale)
      .style('fill', (d: any) => opts?.getFill ? opts.getFill(d) : '#fff')
      .style('stroke', (d: any) => opts?.getStroke ? opts.getStroke(d) : 'steelblue')
      .style('stroke-width', 3);

    node.append('text')
      .attr('dy', '.35em').attr('x', 12)
      .text((d: any) => d.data.name)
      .style('font-size', (state.width < 600 ? 12 : 14) * scale + 'px');

    const diagonal = (d: any) => `M ${d.source.x} ${d.source.y}
      C ${(d.source.x + d.target.x) / 2} ${d.source.y},
        ${(d.source.x + d.target.x) / 2} ${d.target.y},
        ${d.target.x} ${d.target.y}`;

    state.g.selectAll('path.link').data(links).enter().insert('path','g')
      .attr('class','link')
      .attr('d', diagonal as any)
      .style('fill','none')
      .style('stroke', (d: any) => opts?.getStroke ? opts.getStroke(d.target) : '#90caf9')
      .style('stroke-width',3)
      .style('opacity',0.8);
  }
}


