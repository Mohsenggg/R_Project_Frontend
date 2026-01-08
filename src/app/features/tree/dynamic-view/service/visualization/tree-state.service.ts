import { Injectable, signal } from "@angular/core";
import { ITreeNode, ITreeNodesGroup } from "../../model/interface/view-Tree-interfaces";

@Injectable()
export class TreeStateService {

      readonly selectedNodeIds = signal<Map<number, number>>(new Map());
      readonly animatedNodeIds = signal<Set<number>>(new Set());

      // ============================================
      // ============ Selection Logic ===============
      // ============================================

      onNodeClick(node: ITreeNode): void {
            const canSelect = this.canSelectNode(node);
            if (canSelect) {
                  this.selectNode(node.level, node.id);
            } else {
                  console.warn('Node selection restricted for level:', node.level);
            }
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

      clearAllSelections(): void {
            this.selectedNodeIds.set(new Map());
      }

      canSelectNode(node: ITreeNode): boolean {
            const level = node.level;
            // Only levels 1 through 5 are selectable to reveal deeper levels.
            return level !== undefined && level > 0 && level < 6;
      }

      // ============================================
      // ============ Animation Logic ===============
      // ============================================

      isNodeNew(nodeId: number): boolean {
            return !this.animatedNodeIds().has(nodeId);
      }

      onAnimationEnd(nodeId: number): void {
            const currentSet = new Set(this.animatedNodeIds());
            if (!currentSet.has(nodeId)) {
                  currentSet.add(nodeId);
                  this.animatedNodeIds.set(currentSet);
            }
      }

      /**
       * Synchronizes animatedNodeIds with current visibility.
       * Use this inside an effect in the component.
       */
      syncAnimatedNodes(groups: ITreeNodesGroup[]): void {
            const visibleIds = new Set<number>();
            groups.forEach(g => g.nodeList.forEach(n => visibleIds.add(n.id)));

            const currentAnimated = this.animatedNodeIds();
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
      }
}
