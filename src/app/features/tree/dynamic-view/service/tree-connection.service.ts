import { Injectable } from "@angular/core";
import { ITreeNode, ITreeNodesGroup } from "../model/interface/view-Tree-interfaces";

@Injectable({ providedIn: 'root' })
export class TreeConnectionService {

      generateConnections(groups: ITreeNodesGroup[]): { d: string, childId: number, childIndex: number }[] {
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
      }

      private generateBezierPath(x1: number, y1: number, x2: number, y2: number): string {
            // Cubic Bezier with control points vertical
            const cy = (y1 + y2) / 2;
            return `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;
      }
}
