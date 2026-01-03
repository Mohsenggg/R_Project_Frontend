import { Component, computed, inject, signal, OnDestroy, effect, untracked, OnInit, ViewChild, ElementRef } from '@angular/core';

import { INodeLayout, ITreeNode, ITreeNodesGroup } from '../../model/interface/view-Tree-interfaces';
import { CommonModule } from '@angular/common';
import { ViewTreeService } from '../../service/ViewTreeService';
import { TreeDataService } from '../../service/tree-data.service';
import { MockTreeDataService } from '../../service/mock-tree-data.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiTreeDataService } from '../../service/api-tree-data.service';

@Component({
      selector: 'app-view-tree',
      standalone: true,
      imports: [CommonModule],
      templateUrl: './view-tree.component.html',
      styleUrl: './view-tree.component.css',
      providers: [
            { provide: TreeDataService, useClass: MockTreeDataService }
      ]
})
export class ViewTreeComponent implements OnInit, OnDestroy {

      //===============================
      // ===== Constants =====

      private readonly DisplayMode = {
            FIRST: 1,
            SECOND: 2,
            THIRD: 3
      } as const;

      //===============================
      // ===== Services =====

      private treeService = inject(ViewTreeService);
      private treeDataService = inject(TreeDataService);

      //===============================
      // ===== State Signals =====

      private readonly treeNodes = signal<ITreeNode[]>([]);
      private readonly windowWidth = signal(window.innerWidth);
      private readonly windowHeight = signal(window.innerHeight);
      private readonly selectedNodeIds = signal<Map<number, number>>(new Map());
      private readonly animatedNodeIds = signal<Set<number>>(new Set());

      @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

      // Panning state
      private isDragging = false;
      private panStartX = 0;
      private panStartY = 0;
      private panScrollLeft = 0;
      private panScrollTop = 0;


      //===============================
      // ===== Derived State (Computed) 

      readonly filteredTreeData = computed(() => this.filterTreeData());

      readonly currentDisplay = computed(() => {
            return this.getDeepestSelectedNodeLevel();
      });

      readonly selectedNodes = computed(() => this.selectedNodeIds());

      // Connections calculation
      readonly treeLinks = computed(() => {
            const groups = this.filteredTreeData();
            const visibleNodes = new Map<number, ITreeNode>();
            const nodeIndices = new Map<number, number>();

            // 1. Index all visible nodes and their positions in their groups
            groups.forEach(g => {
                  g.nodeList.forEach((node, index) => {
                        visibleNodes.set(node.id, node);
                        nodeIndices.set(node.id, index);
                  });
            });

            const links: { d: string, childId: number, childIndex: number }[] = [];

            // 2. Generate links
            visibleNodes.forEach(node => {
                  if (node.parentId !== 0 && visibleNodes.has(node.parentId)) {
                        const parent = visibleNodes.get(node.parentId)!;

                        // Ensure layout exists
                        if (!node.layout || !parent.layout) return;

                        // Calculate visual centers/connection points
                        // Parent: Bottom Center
                        const startX = parent.layout.leftSpaceX + (parent.layout.nodeWidth / 2);
                        const startY = parent.layout.topSpaceY + parent.layout.nodeHeight;

                        // Child: Top Center
                        const endX = node.layout.leftSpaceX + (node.layout.nodeWidth / 2);
                        const endY = node.layout.topSpaceY;

                        // Bezier Curve
                        const path = this.generateBezierPath(startX, startY, endX, endY);
                        links.push({
                              d: path,
                              childId: node.id,
                              childIndex: nodeIndices.get(node.id) ?? 0
                        });
                  }
            });

            return links;
      });

      // Bounds calculation for scrolling
      readonly treeBounds = computed(() => {
            const groups = this.filteredTreeData();
            let maxWidth = this.windowWidth();
            let maxHeight = this.windowHeight();

            groups.forEach(group => {
                  group.nodeList.forEach(node => {
                        if (node.layout) {
                              const right = node.layout.leftSpaceX + node.layout.nodeWidth;
                              const bottom = node.layout.topSpaceY + node.layout.nodeHeight;
                              maxWidth = Math.max(maxWidth, right);
                              maxHeight = Math.max(maxHeight, bottom);
                        }
                  });
            });

            // Add some padding to the bounds
            return {
                  width: maxWidth + 100,
                  height: maxHeight + 100
            };
      });

      private generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
            // Cubic Bezier with control points vertical
            const cy = (y1 + y2) / 2;
            return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
      }


      //===============================
      // ===== Lifecycle =====

      constructor() {
            window.addEventListener('resize', this.handleResize);

            // Synchronize animatedNodeIds with current visibility
            // This ensures that if a node leaves the view, it's forgotten and can animate again if it re-appears.
            effect(() => {
                  const groups = this.filteredTreeData(); // Trigger on data change
                  const visibleIds = new Set<number>();
                  groups.forEach(g => g.nodeList.forEach(n => visibleIds.add(n.id)));

                  const currentAnimated = untracked(this.animatedNodeIds);
                  const pruned = new Set<number>();
                  let changed = false;

                  currentAnimated.forEach(id => {
                        if (visibleIds.has(id)) {
                              pruned.add(id);
                        } else {
                              changed = true;
                        }
                  });

                  if (changed) {
                        this.animatedNodeIds.set(pruned);
                  }
            }, { allowSignalWrites: true });
      }

      ngOnInit(): void {
            // Fetch data on initialization. 
            // In a real app, you might get the treeId from route params.
            this.treeDataService.getTreeNodes(1).subscribe(nodes => {
                  this.treeNodes.set(nodes);
            });
      }

      ngOnDestroy(): void {
            window.removeEventListener('resize', this.handleResize);
            window.removeEventListener('mouseup', this.onMouseUp);
            window.removeEventListener('mousemove', this.onMouseMove);
      }

      private handleResize = (): void => {
            this.windowWidth.set(window.innerWidth);
            this.windowHeight.set(window.innerHeight);
      };

      // ===============================
      // ======= Panning Logic ========
      // ===============================

      onMouseDown(event: MouseEvent): void {
            // Only left click
            if (event.button !== 0) return;

            // Check if clicking on a card - if so, don't pan (let it be a selection)
            const target = event.target as HTMLElement;
            if (target.closest('.member-card')) return;

            this.isDragging = true;
            const container = this.scrollContainer.nativeElement;

            this.panStartX = event.pageX - container.offsetLeft;
            this.panStartY = event.pageY - container.offsetTop;
            this.panScrollLeft = container.scrollLeft;
            this.panScrollTop = container.scrollTop;

            container.classList.add('panning');
            container.style.cursor = 'grabbing';
            container.style.userSelect = 'none';

            // Add global listeners to handle dragging outside the container
            window.addEventListener('mousemove', this.onMouseMove);
            window.addEventListener('mouseup', this.onMouseUp);
      }

      onMouseMove = (event: MouseEvent): void => {
            if (!this.isDragging) return;

            event.preventDefault();
            const container = this.scrollContainer.nativeElement;

            const x = event.pageX - container.offsetLeft;
            const y = event.pageY - container.offsetTop;

            const walkX = (x - this.panStartX) * 1.5; // Drag speed multiplier
            const walkY = (y - this.panStartY) * 1.5;

            container.scrollLeft = this.panScrollLeft - walkX;
            container.scrollTop = this.panScrollTop - walkY;
      };

      onMouseUp = (): void => {
            if (!this.isDragging) return;

            this.isDragging = false;
            const container = this.scrollContainer.nativeElement;
            container.classList.remove('panning');
            container.style.cursor = 'grab';
            container.style.removeProperty('user-select');

            window.removeEventListener('mousemove', this.onMouseMove);
            window.removeEventListener('mouseup', this.onMouseUp);
      };



      //===============================
      // ===== User Interactions =====
      //===============================

      onNodeClick(node: ITreeNode): void {
            // Allow selection of nodes between level 1 and 5.
            // Level 0 (root) and Level 6 (deepest) are not selectable.
            if (node.level !== undefined && node.level > 0 && node.level < 6) {
                  this.selectNode(node.level, node.id);
            } else {
                  console.warn('Node selection restricted for level:', node.level);
                  return;
            }
      }


      private hasChildren(nodeId: number): boolean {
            return this.treeNodes().some(n => n.parentId === nodeId);
      }

      selectNode(level: number, nodeId: number): void {
            if (level < 0 || level > 6) {
                  console.warn(`Invalid level ${level}. Must be between 0 and 6.`);
                  return;
            }

            const currentMap = new Map(this.selectedNodeIds());
            currentMap.set(level, nodeId);

            // Clear deeper selections
            for (let i = level + 1; i <= 6; i++) {
                  currentMap.delete(i);
            }

            this.selectedNodeIds.set(currentMap);
      }


      //===============================
      //====== Data Filtering =========
      //===============================


      private filterTreeData(): ITreeNodesGroup[] {
            let nodesGroupList: ITreeNodesGroup[] = [];
            const selectedMap = this.selectedNodeIds();
            let display = this.getDeepestSelectedNodeLevel();
            if (display === -1) display = this.DisplayMode.FIRST;

            const currentTreeData = this.treeNodes();
            if (currentTreeData.length === 0) return [];

            // L0 - Root (always shown)
            const l0NodeGroup = this.treeService.getRoot(currentTreeData);
            if (!l0NodeGroup) return nodesGroupList;

            nodesGroupList.push(l0NodeGroup);

            // L1 - Root children (always shown)
            const l1NodeGroup = this.treeService.getChildren(
                  currentTreeData,
                  l0NodeGroup.nodeList[0]?.id || 0
            );

            if (l1NodeGroup) {
                  nodesGroupList.push(l1NodeGroup);
            }

            // L2 - Children of selected L1
            const selectedL1Id = selectedMap.get(1);
            if (selectedL1Id) {
                  const l2NodeGroup = this.treeService.getChildren(currentTreeData, selectedL1Id);
                  if (l2NodeGroup) nodesGroupList.push(l2NodeGroup);
            }

            // L3 - Children of selected L2
            const selectedL2Id = selectedMap.get(2);
            if (selectedL2Id) {
                  const l3NodeGroup = this.treeService.getChildren(currentTreeData, selectedL2Id);
                  if (l3NodeGroup) nodesGroupList.push(l3NodeGroup);
            }

            // L4 - Children of selected L3
            const selectedL3Id = selectedMap.get(3);
            if (selectedL3Id) {
                  const l4NodeGroup = this.treeService.getChildren(currentTreeData, selectedL3Id);
                  if (l4NodeGroup) nodesGroupList.push(l4NodeGroup);
            }

            // L5 - Children of selected L4
            const selectedL4Id = selectedMap.get(4);
            if (selectedL4Id) {
                  const l5NodeGroup = this.treeService.getChildren(currentTreeData, selectedL4Id);
                  if (l5NodeGroup) nodesGroupList.push(l5NodeGroup);
            }

            // L6 - Children of selected L5
            const selectedL5Id = selectedMap.get(5);
            if (selectedL5Id) {
                  const l6NodeGroup = this.treeService.getChildren(currentTreeData, selectedL5Id);
                  if (l6NodeGroup) nodesGroupList.push(l6NodeGroup);
            }

            // add layout to List of group of node
            nodesGroupList = this.addLayoutToCurrentGroups(nodesGroupList, display);

            return nodesGroupList;
      }

      // ========================================

      addLayoutToCurrentGroups(nodeGroupsList: ITreeNodesGroup[], display: number): ITreeNodesGroup[] {

            let completedNodeGroupList: ITreeNodesGroup[] = [];
            const windowDims = { width: this.windowWidth(), height: this.windowHeight() };

            for (let groupIndex = 0; groupIndex < nodeGroupsList.length; groupIndex++) {

                  const nodeGroup = nodeGroupsList[groupIndex];
                  let currentGroupLevel = nodeGroup.level;
                  let completedNodeGroup: ITreeNodesGroup | null = null;

                  if (currentGroupLevel === 0) {
                        completedNodeGroup = this.treeService.addL0NodeLayout(nodeGroup, display, windowDims);
                  }

                  if (currentGroupLevel === 1 || currentGroupLevel === 2) {
                        completedNodeGroup = this.treeService.addL1L2NodeLayout(nodeGroup, display, windowDims);
                  }

                  if (currentGroupLevel === 3 || currentGroupLevel === 4) {
                        completedNodeGroup = this.treeService.addL3L4NodeLayout(nodeGroup, display, windowDims);
                  }

                  if (currentGroupLevel === 5 || currentGroupLevel === 6) {
                        completedNodeGroup = this.treeService.addL5L6NodeLayout(nodeGroup, display, windowDims);
                  }

                  if (completedNodeGroup) {
                        completedNodeGroupList.push(completedNodeGroup);
                  }
            }

            return completedNodeGroupList;
      }


      //===============================
      //========== Styling ============
      //===============================


      getNodeStyle(node: ITreeNode): Record<string, any> {

            let nodeLayout: INodeLayout = { leftSpaceX: 0, topSpaceY: 0, nodeWidth: 0, nodeHeight: 0 }
            if (node.layout) {
                  nodeLayout = node.layout;
            }

            return {
                  'width.px': nodeLayout.nodeWidth,
                  'height.px': nodeLayout.nodeHeight,
                  'left.px': nodeLayout.leftSpaceX,
                  'top.px': nodeLayout.topSpaceY,
            };
      }

      canSelectNode(node: ITreeNode): boolean {
            const level = node.level;
            // Only levels 1 through 5 are selectable to reveal deeper levels.
            return level !== undefined && level > 0 && level < 6;
      }

      //===============================
      // ======= Helper Methods =======
      //===============================

      clearAllSelections(): void {
            this.selectedNodeIds.set(new Map());
      }


      //===============================
      // ===== Animation Helpers ======
      //===============================

      /**
       * Checks if a node is new and should trigger the entrance animation.
       * Side-effect free to be safe for template usage.
       */
      isNodeNew(nodeId: number): boolean {
            return !this.animatedNodeIds().has(nodeId);
      }

      /**
       * Cleans up the .enter class after the CSS animation finishes.
       * Adds the nodeId to the set of already animated nodes.
       */
      onAnimationEnd(nodeId: number): void {
            const currentSet = new Set(this.animatedNodeIds());
            if (!currentSet.has(nodeId)) {
                  currentSet.add(nodeId);
                  this.animatedNodeIds.set(currentSet);
            }
      }

      private getDeepestSelectedNodeLevel(): number {
            const map = this.selectedNodeIds();

            if (map.size === 0) return this.DisplayMode.FIRST;

            const highestLevel = Math.max(...map.keys());

            if (highestLevel === 0 || highestLevel === 1) return this.DisplayMode.FIRST;
            if (highestLevel === 2 || highestLevel === 3) return this.DisplayMode.SECOND;
            if (highestLevel === 4 || highestLevel === 5) return this.DisplayMode.THIRD;

            return this.DisplayMode.FIRST; // Fallback
      }

}
