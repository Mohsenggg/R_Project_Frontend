import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import * as d3 from 'd3';
import { TreeDataService, TreeNode } from '../../../../../core/srevices/tree-data.service';
import { HttpClient } from '@angular/common/http';

@Component({
      selector: 'app-tree-d3-test',
      standalone: true,
      imports: [],
      templateUrl: './tree-d3-test.component.html',
      styleUrl: './tree-d3-test.component.css'
})

export class TreeD3TestComponent implements OnInit, AfterViewInit {
      @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;

      private svg: any;
      private g: any;
      private root: any;
      private treeLayout: any;
      private duration = 400;
      private data!: TreeNode;
      private dataLoaded = false;

      private width = 800;
      private height = 600;
      private margin = { top: 16, right: 16, bottom: 24, left: 16 };
      private nodeRadius = 8;
      private levelGap = 120;
      private zoomBehavior: any;
      private depthColors: string[] = ['#1e88e5', '#43a047', '#e53935', '#8e24aa', '#fb8c00', '#00897b', '#6d4c41'];
      private currentThirdGenExpandedId: number | null = null;

      constructor(private treeDataService: TreeDataService, private http: HttpClient) {}

      ngOnInit(): void {
            this.treeDataService.getTreeDataFromJson().subscribe((data) => {
                  this.data = data;
                  this.dataLoaded = true;
                  if (this.treeContainer) {
                        this.initSvg();
                        this.update(this.root);
                  }
            });
      }

      ngAfterViewInit(): void {
            if (this.dataLoaded) {
                  this.initSvg();
                  this.update(this.root);
            }
      }

      @HostListener('window:resize')
      onResize(): void {
            if (!this.svg) return;
            this.computeSize();
            this.svg
                  .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                  .attr('preserveAspectRatio', 'xMidYMid meet');
            if (this.treeLayout) {
                  this.treeLayout.size([this.width - this.margin.left - this.margin.right, this.height - this.margin.top - this.margin.bottom]);
            }
            this.update(this.root);
      }

      private computeSize(): void {
            const element = this.treeContainer.nativeElement as HTMLElement;
            const rect = element.getBoundingClientRect();
            const containerWidth = Math.max(320, rect.width || element.clientWidth || this.width);
            const containerHeight = Math.max(300, rect.height || element.clientHeight || this.height);
            this.width = containerWidth;
            this.height = containerHeight;
            const isSmall = this.width < 600;
            this.levelGap = isSmall ? 90 : 120;
            this.nodeRadius = isSmall ? 6 : 8;
      }

      private initSvg(): void {
            const element = this.treeContainer.nativeElement;
            this.computeSize();
            this.svg = d3.select(element).append('svg')
                  .attr('width', '100%')
                  .attr('height', '100%')
                  .attr('viewBox', `0 0 ${this.width} ${this.height}`)
                  .attr('preserveAspectRatio', 'xMidYMid meet') as d3.Selection<SVGSVGElement, unknown, null, undefined>;
            this.g = this.svg.append('g')
                  .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
            const zoom = d3.zoom<SVGSVGElement, unknown>()
                  .scaleExtent([0.3, 2.5])
                  .on('zoom', (event) => {
                        if (this.g) {
                            this.g.attr('transform', event.transform);
                        }
                  });
            this.zoomBehavior = zoom;
            this.svg.call(zoom as any);
            this.treeLayout = d3.tree<TreeNode>().size([
                  this.width - this.margin.left - this.margin.right,
                  this.height - this.margin.top - this.margin.bottom
            ]);
            this.root = d3.hierarchy(this.data as any);
            (this.root as any).x0 = this.height / 2;
            (this.root as any).y0 = 0;
            if (this.root.children) {
                 this.root.children.forEach((child: any) => this.collapse(child));
            }
            // By default, expand up to 2nd generation
            this.expandToDepth(2);
      }

      private collapse(d: any) {
            if (d.children) {
                  d._children = d.children;
                  d._children.forEach((child: any) => this.collapse(child));
                  d.children = null;
            }
      }

      private update(source: any): void {
            if (!this.g || !this.root) {
                return;
            }
            const treeData = this.treeLayout(this.root);
            const nodes = treeData.descendants();
            const links = treeData.links();

            nodes.forEach((d: any) => { d.x = d.x; d.y = d.depth * this.levelGap; });

            const node = this.g.selectAll('g.node')
                  .data(nodes, (d: any) => d.id || (d.id = ++i));

            const nodeEnter = node.enter().append('g')
                  .attr('class', 'node')
                  .attr('transform', () => `translate(${source.y0},${source.x0})`)
                  .on('click', (event: any, d: any) => this.click(d));

            nodeEnter.append('circle')
                  .attr('r', 1e-6)
                  .style('fill', (d: any) => this.getDepthColor(d.depth, Boolean(d._children)))
                  .style('stroke', (d: any) => this.getDepthStroke(d.depth));

            nodeEnter.append('text')
                  .attr('dy', '.35em')
                  .attr('x', (d: any) => d.children || d._children ? -13 : 13)
                  .attr('text-anchor', (d: any) => d.children || d._children ? 'end' : 'start')
                  .style('font-size', this.width < 600 ? '12px' : '14px')
                  .text((d: any) => d.data.name);

            const nodeUpdate = nodeEnter.merge(node as any);

            nodeUpdate.transition()
                  .duration(this.duration)
                  .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

            nodeUpdate.select('circle')
                  .attr('r', this.nodeRadius)
                  .style('fill', (d: any) => this.getDepthColor(d.depth, Boolean(d._children)))
                  .style('stroke', (d: any) => this.getDepthStroke(d.depth));

            const nodeExit = node.exit().transition()
                  .duration(this.duration)
                  .attr('transform', () => `translate(${source.y},${source.x})`)
                  .remove();

            nodeExit.select('circle').attr('r', 1e-6);
            nodeExit.select('text').style('fill-opacity', 1e-6);

            const link = this.g.selectAll('path.link')
                  .data(links, (d: any) => d.target.id);

            const linkEnter = link.enter().insert('path', 'g')
                  .attr('class', 'link')
                  .style('stroke', (d: any) => this.getDepthStroke(d.target.depth))
                  .attr('d', () => {
                        const o = { x: source.x0, y: source.y0 };
                        return this.diagonal({ source: o, target: o });
                  });

            linkEnter.merge(link as any).transition()
                  .duration(this.duration)
                  .style('stroke', (d: any) => this.getDepthStroke(d.target.depth))
                  .attr('d', this.diagonal.bind(this));

            link.exit().transition()
                  .duration(this.duration)
                  .attr('d', () => {
                        const o = { x: source.x, y: source.y };
                        return this.diagonal({ source: o, target: o });
                  })
                  .remove();

            nodes.forEach((d: any) => {
                  d.x0 = d.x;
                  d.y0 = d.y;
            });
      }

      private diagonal(d: any) {
            return `M ${d.source.x} ${d.source.y}
            C ${(d.source.x + d.target.x) / 2} ${d.source.y},
              ${(d.source.x + d.target.x) / 2} ${d.target.y},
              ${d.target.x} ${d.target.y}`;
      }

      private click(d: any): void {
            // Special handling: third generation nodes (depth === 3)
            if (d.depth === 3) {
                  if (this.currentThirdGenExpandedId === d.id) {
                        // Collapse everything deeper than depth 3 under this node
                        this.collapseSubtreeBeyondDepth(d, 3);
                        this.currentThirdGenExpandedId = null;
                  } else {
                        // Collapse all deep branches > depth 3 in the whole tree
                        this.collapseBeyondDepth(this.root, 3);
                        // Fully expand the selected third-gen subtree
                        this.expandFully(d);
                        this.currentThirdGenExpandedId = d.id;
                  }
                  this.update(d);
                  return;
            }

            // Default toggle for other nodes
            if (d.children) {
                  d._children = d.children;
                  d.children = null;
            } else {
                  d.children = d._children;
                  d._children = null;
            }
            this.update(d);
      }

      expandAll(): void {
            if (!this.root) return;
            // Expand only up to depth 2 by default
            this.expandToDepth(2);
            // Reset any exclusive third-gen expansion
            this.currentThirdGenExpandedId = null;
            this.update(this.root);
      }

      private expandToDepth(maxDepth: number): void {
            const walk = (d: any) => {
                  if (d.depth < maxDepth) {
                        // Expand this level
                        if (d._children) {
                              d.children = d._children;
                              d._children = null;
                        }
                        if (d.children) d.children.forEach((c: any) => walk(c));
                  } else if (d.depth >= maxDepth) {
                        // Collapse deeper levels
                        if (d.children) {
                              d._children = d.children;
                              d.children = null;
                        }
                  }
            };
            walk(this.root);
      }

      private collapseBeyondDepth(d: any, maxDepth: number): void {
            const walk = (n: any) => {
                  if (n.depth > maxDepth && n.children) {
                        n._children = n.children;
                        n.children = null;
                  }
                  const kids = n.children || n._children || [];
                  kids.forEach((c: any) => walk(c));
            };
            walk(d);
      }

      private collapseSubtreeBeyondDepth(d: any, maxDepth: number): void {
            const walk = (n: any) => {
                  if (n.depth > maxDepth && n.children) {
                        n._children = n.children;
                        n.children = null;
                  }
                  const kids = n.children || n._children || [];
                  kids.forEach((c: any) => walk(c));
            };
            walk(d);
      }

      private expandFully(d: any): void {
            const walk = (n: any) => {
                  if (n._children) {
                        n.children = n._children;
                        n._children = null;
                  }
                  if (n.children) n.children.forEach((c: any) => walk(c));
            };
            walk(d);
      }

      zoomIn(): void {
            if (!this.svg || !this.zoomBehavior) return;
            const svgEl = this.svg.node() as SVGSVGElement;
            const t = d3.zoomTransform(svgEl);
            const k = Math.min(2.5, t.k * 1.2);
            this.svg.transition().duration(200).call(this.zoomBehavior.scaleTo as any, k);
      }

      zoomOut(): void {
            if (!this.svg || !this.zoomBehavior) return;
            const svgEl = this.svg.node() as SVGSVGElement;
            const t = d3.zoomTransform(svgEl);
            const k = Math.max(0.3, t.k / 1.2);
            this.svg.transition().duration(200).call(this.zoomBehavior.scaleTo as any, k);
      }

      private getDepthColor(depth: number, isCollapsed: boolean): string {
            const base = this.depthColors[depth % this.depthColors.length];
            const c = d3.color(base);
            if (!c) return base;
            return isCollapsed ? c.darker(0.6).toString() : c.brighter(0.3).toString();
      }

      private getDepthStroke(depth: number): string {
            const base = this.depthColors[depth % this.depthColors.length];
            const c = d3.color(base);
            return c ? c.darker(0.8).toString() : base;
      }
}

let i = 0;


