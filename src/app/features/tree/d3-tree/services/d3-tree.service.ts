import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { TreeNode } from '../models/tree.types';

@Injectable({
      providedIn: 'root'
})
export class D3TreeService {

      constructor() { }

      /**
       * Converts raw data into a D3 hierarchy and calculates layout.
       */
      computeLayout(data: TreeNode, width: number, height: number) {
            const root = d3.hierarchy<TreeNode>(data);

            // Increase node size for Pill shapes
            // Width: 260 covers the card (240) + gap (20)
            // Height: 180 covers card (90) + vertical gap (90)
            const nodeWidth = 260;
            const nodeHeight = 180;

            const treeLayout = d3.tree<TreeNode>()
                  .nodeSize([nodeWidth, nodeHeight]);

            const treeData = treeLayout(root);

            return { root, nodes: root.descendants(), links: root.links() };
      }

      /**
       * Toggles children visibility using ACCORDION logic.
       * Collapses siblings of the clicked node.
       */
      toggleChildren(node: d3.HierarchyPointNode<TreeNode>): void {
            if (node.children) {
                  // Collapse clicked node
                  node.data._children = node.children.map(c => c.data);
                  node.children = undefined;
            } else {
                  // Expand clicked node
                  if (node.data._children) {
                        node.data.children = node.data._children;
                        node.data._children = undefined;
                  }

                  // Collapse all siblings
                  if (node.parent && node.parent.children) {
                        node.parent.children.forEach(sibling => {
                              if (sibling !== node && sibling.children) {
                                    // Collapse sibling
                                    // NOTE: This modifies the D3 Node object directly which might get wiped on re-layout.
                                    // We must modify the underlying DATA because computeLayout rebuilds the hierarchy from data.

                                    // So we strictly modify the DATA structures.
                                    if (sibling.data.children) {
                                          sibling.data._children = sibling.data.children;
                                          sibling.data.children = undefined;
                                    }
                              }
                        });
                  }
            }
      }

      /**
       * Generates a smooth bezier curve path for links (Vertical: Top to Bottom)
       */
      generateLinkPath(source: { x: number, y: number }, target: { x: number, y: number }): string {
            const linkGen = d3.linkVertical()
                  .x((d: any) => d[0])
                  .y((d: any) => d[1]);

            return linkGen({ source: [source.x, source.y], target: [target.x, target.y] }) || '';
      }
}
