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
      selectedLevelCId: string | null = null;

      @ViewChild('unifiedContainer', { static: true }) unifiedContainer!: ElementRef;

      private unifiedState: D3SectionState;

      // reuse depth palette similar to tree-d3-test
      private depthColors: string[] = ['#1e88e5', '#43a047', '#e53935', '#8e24aa', '#fb8c00', '#00897b', '#6d4c41'];

      constructor(
            private dataService: TreeDataService,
            private hierarchy: PreviewHierarchyService,
            private renderer: PreviewD3RendererService,
      ) {
            this.unifiedState = this.renderer.createState();
      }

      ngOnInit(): void {
            this.dataService.getPreviewNodesFromJson().subscribe(nodes => {
                  this.nodes = nodes;
                  this.renderUnifiedTree();
            });
      }

      ngAfterViewInit(): void {
            this.renderUnifiedTree();
      }

      @HostListener('window:resize') onResize() {
            this.renderUnifiedTree();
      }

      private getRootA(): PreviewNode | undefined {
            return this.hierarchy.getRootA(this.nodes);
      }

      onSelectLevelC(node: PreviewNode): void {
            if (this.selectedLevelCId === node.id) {
                  this.selectedLevelCId = null;
            } else {
                  this.selectedLevelCId = node.id;
            }
            this.renderUnifiedTree();
      }

      resetView(): void {
            this.selectedLevelCId = null;
            this.renderUnifiedTree();
      }

      private renderUnifiedTree(): void {
            if (!this.unifiedContainer) return;

            const data = this.hierarchy.buildUnifiedTree(this.nodes, this.selectedLevelCId);

            const dbl = (d: any) => {
                  if (d.depth === 2) { // Level C nodes
                        const id = d.data.__id as string | undefined;
                        if (id) {
                              this.onSelectLevelC({ id } as PreviewNode);
                        }
                  }
            };

            this.renderer.drawInto(
                  this.unifiedContainer.nativeElement,
                  this.unifiedState,
                  data,
                  {
                        onNodeDblClick: dbl,
                        getFill: (d: any) => this.getDepthColor(d.depth, !d.data.children && d.data._children),
                        getStroke: (d: any) => this.getDepthStroke(d.depth)
                  }
            );
      }

      zoomIn() { /* Zoom in logic for unified view */ }
      zoomOut() { /* Zoom out logic for unified view */ }

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
