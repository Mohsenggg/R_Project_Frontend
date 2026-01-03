import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';
import { D3TreeService } from '../../services/d3-tree.service';
import { ActivatedRoute } from '@angular/router';
import { MOCK_TREE_DATA } from '../../data/mock-data';
import { TreeNode } from '../../models/tree.types';

@Component({
      selector: 'app-d3-tree',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './d3-tree.component.html',
      styleUrls: ['./d3-tree.component.css']
})
export class D3TreeComponent implements OnInit, OnChanges {

      @Input() data: TreeNode | null = null;

      @ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<SVGElement>;
      @ViewChild('gZoom', { static: true }) gZoom!: ElementRef<SVGGElement>;

      private treeService = inject(D3TreeService);
      private route = inject(ActivatedRoute);

      // signals
      readonly width = signal(window.innerWidth);
      readonly height = signal(window.innerHeight);

      private readonly root = signal<d3.HierarchyPointNode<TreeNode> | null>(null);

      // Track selected node for highlighting
      private readonly selectedNodeId = signal<string | number | null>(null);

      readonly nodes = computed(() => this.root()?.descendants() || []);
      readonly links = computed(() => this.root()?.links() || []);

      private zoom!: d3.ZoomBehavior<SVGElement, unknown>;

      constructor() {
            // Basic resize listener
            window.addEventListener('resize', () => {
                  this.width.set(window.innerWidth);
                  this.height.set(window.innerHeight);
                  // On resize, we might want to re-center? optional.
            });
      }

      ngOnInit(): void {
            const isDemo = this.route.snapshot.data['demo'];
            if (isDemo && !this.data) {
                  this.data = MOCK_TREE_DATA;
            }

            this.setupZoom();
            this.updateLayout();
      }

      ngOnChanges(changes: SimpleChanges): void {
            if (changes['data']) {
                  this.updateLayout();
            }
      }

      updateLayout(): void {
            if (!this.data) return;

            const { root } = this.treeService.computeLayout(this.data, this.width(), this.height());
            this.root.set(root as d3.HierarchyPointNode<TreeNode>);

            // Auto fit whenever layout massively changes (e.g. first load)
            // We can debounce this or check if it's the first load
            this.fitToScreen();
      }

      setupZoom(): void {
            const svg = d3.select(this.svgContainer.nativeElement);
            const g = d3.select(this.gZoom.nativeElement);

            this.zoom = d3.zoom<SVGElement, unknown>()
                  .scaleExtent([0.1, 2.5])
                  .on('zoom', (event) => {
                        g.attr('transform', event.transform);
                  });

            svg.call(this.zoom);
      }

      fitToScreen(): void {
            // Wait for render
            setTimeout(() => {
                  const svg = d3.select(this.svgContainer.nativeElement);
                  const g = d3.select(this.gZoom.nativeElement);
                  const bounds = (g.node() as SVGGElement).getBBox();
                  const fullWidth = this.width();
                  const fullHeight = this.height();

                  if (bounds.width === 0 || bounds.height === 0) return;

                  const margin = 40;
                  const scale = 0.9 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);

                  // On mobile, prioritize width fit (so nodes aren't tiny, might need scrolling vertically)
                  // Actually, "fit width" is usually better than "fit all" for deep trees
                  let finalScale = scale;

                  // If scale is too small (deep tree), clamp it so nodes are readable
                  if (finalScale < 0.4) finalScale = 0.4;

                  // Center X
                  const x = (fullWidth - finalScale * bounds.width) / 2 - finalScale * bounds.x;
                  const y = 80; // Start slightly from top, don't center Y perfectly as tree grows down

                  const transform = d3.zoomIdentity
                        .translate(x, y)
                        .scale(finalScale);

                  svg.transition().duration(750).call(this.zoom.transform, transform);
            });
      }

      getLinkPath(link: d3.HierarchyLink<TreeNode>): string {
            const s = link.source as d3.HierarchyPointNode<TreeNode>;
            const t = link.target as d3.HierarchyPointNode<TreeNode>;
            return this.treeService.generateLinkPath({ x: s.x, y: s.y }, { x: t.x, y: t.y });
      }

      isSelected(node: d3.HierarchyPointNode<TreeNode>): boolean {
            return this.selectedNodeId() === node.data.id;
      }

      onNodeClick(node: d3.HierarchyPointNode<TreeNode>): void {
            this.selectedNodeId.set(node.data.id);

            // Toggle children logic (Service handles single-path Accordion)
            this.treeService.toggleChildren(node);

            // Update layout
            this.updateLayout();
      }
}
