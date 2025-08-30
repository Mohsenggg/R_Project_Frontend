import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeDataService, PreviewNode } from '../../../../../core/srevices/tree-data.service';
import * as d3 from 'd3';
import { PreviewHierarchyService } from '../../services/preview-hierarchy.service';
import { PreviewD3RendererService, D3SectionState } from '../../services/preview-d3-renderer.service';
@Component({
      selector: 'app-tree-preview',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './tree-preview.component.html',
      styleUrl: './tree-preview.component.css'
})
export class TreePreviewComponent implements OnInit, AfterViewInit {

      nodes: PreviewNode[] = [];
      isSection1Main = true; // Section 1 (A-C) main by default
      selectedLevelCId: string | null = null;
      section2Nodes: PreviewNode[] = []; // D-F for selected C subtree

      @ViewChild('section1Container', { static: true }) section1Container!: ElementRef;
      @ViewChild('section2Container', { static: true }) section2Container!: ElementRef;

      private s1: D3SectionState;
      private s2: D3SectionState;

      // reuse depth palette similar to tree-d3-test
      private depthColors: string[] = ['#1e88e5', '#43a047', '#e53935', '#8e24aa', '#fb8c00', '#00897b', '#6d4c41'];

      constructor(
            private dataService: TreeDataService,
            private hierarchy: PreviewHierarchyService,
            private renderer: PreviewD3RendererService,
      ) {
            this.s1 = this.renderer.createState();
            this.s2 = this.renderer.createState();
      }

      ngOnInit(): void {
            this.dataService.getPreviewNodesFromJson().subscribe(nodes => {
                  this.nodes = nodes;
                  this.renderSection1();
                  this.updateSection2();
                  this.renderSection2();
            });
      }

      ngAfterViewInit(): void {
            this.renderSection1();
            this.renderSection2();
      }

      @HostListener('window:resize') onResize() {
            this.renderSection1();
            this.renderSection2();
      }

      private getRootA(): PreviewNode | undefined {
            return this.hierarchy.getRootA(this.nodes);
      }

      switchToSection1(): void {
            this.isSection1Main = true;
            this.s1.scaleFactor = 1;
            this.scheduleRerender();
      }

      switchToSection2(): void {
            if (this.selectedLevelCId) {
                  this.isSection1Main = false;
                  this.s1.scaleFactor = 0.6; this.scheduleRerender();
            }
      }

      onSelectLevelC(node: PreviewNode): void {

            if (this.selectedLevelCId === node.id) {
                  this.selectedLevelCId = null;
                  this.section2Nodes = [];
                  this.isSection1Main = true;
                  this.s1.scaleFactor = 1;
            } else {
                  this.selectedLevelCId = node.id;
                  this.updateSection2();
                  this.isSection1Main = false;
                  this.s1.scaleFactor = 0.6;
            }

            this.scheduleRerender();
      }

      private updateSection2(): void {
            this.section2Nodes = this.hierarchy.collectSection2Nodes(this.nodes, this.selectedLevelCId);
      }

      private renderSection1(): void {
            if (!this.section1Container) return;
            const data = this.hierarchy.buildHierarchyForSection1(this.nodes);

            const dbl = (d: any) => {
                  if (d.depth === 2) {
                        const id = d.data.__id as string | undefined;
                        if (id) { this.selectedLevelCId = id; this.updateSection2(); }
                        this.isSection1Main = false; this.s1.scaleFactor = 0.6; this.scheduleRerender();
                  }
            };

            this.renderer.drawInto(this.section1Container.nativeElement, this.s1, data, { onNodeDblClick: dbl, getFill: (d: any) => this.getDepthColor(d.depth, !d.data.children && d.data._children), getStroke: (d: any) => this.getDepthStroke(d.depth) });

      }

      private renderSection2(): void {
            if (!this.section2Container) return;
            const data = this.hierarchy.buildHierarchyForSection2(this.nodes, this.selectedLevelCId);
            this.renderer.drawInto(
                  this.section2Container.nativeElement,
                  this.s2,
                  data,
                  {
                        getFill: (d: any) => this.getDepthColor(d.depth, !d.data.children && d.data._children),
                        getStroke: (d: any) => this.getDepthStroke(d.depth)
                  });
      }

      zoomIn(section: 1 | 2) { const s = section === 1 ? this.s1 : this.s2; /* if (!s.svg || !s.zoom) return; const el = (s.svg as any).node() as SVGSVGElement; const t = d3.zoomTransform(el); const k = Math.min(2.5, t.k*1.2); s.svg.transition().duration(200).call(s.zoom.scaleTo as any, k); */ }
      zoomOut(section: 1 | 2) { const s = section === 1 ? this.s1 : this.s2; /* if (!s.svg || !s.zoom) return; const el = (s.svg as any).node() as SVGSVGElement; const t = d3.zoomTransform(el); const k = Math.max(0.3, t.k/1.2); s.svg.transition().duration(200).call(s.zoom.scaleTo as any, k); */ }

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

      private scheduleRerender(): void {
            requestAnimationFrame(() => {
                  requestAnimationFrame(() => {
                        this.renderSection1();
                        this.renderSection2();
                  });
            });
      }
}
