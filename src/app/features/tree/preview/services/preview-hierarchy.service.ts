import { Injectable } from '@angular/core';
import { PreviewNode } from '../../../../core/srevices/tree-data.service';

@Injectable({ providedIn: 'root' })
export class PreviewHierarchyService {

  getRootA(nodes: PreviewNode[]): PreviewNode | undefined {
    return nodes.find(n => n.level === 'A' && !n.parentId);
  }

  buildHierarchyForSection1(nodes: PreviewNode[]): any {
    const byId = new Map(nodes.map(n => [n.id, n] as const));
    const root = this.getRootA(nodes);
    if (!root) return { name: 'Empty' };
    const toTree = (id: string, maxLevel: string): any => {
      const n = byId.get(id)!;
      const node: any = { name: n.name, __id: id };
      if (n.level !== maxLevel) {
        const kids = (n.childrenIds || []).map(cid => toTree(cid, maxLevel)).filter(Boolean);
        if (kids.length) node.children = kids;
      }
      return node;
    };
    return toTree(root.id, 'C');
  }

  buildHierarchyForSection2(nodes: PreviewNode[], selectedLevelCId: string | null): any {
    if (!selectedLevelCId) return { name: 'Select a C node' };
    const byId = new Map(nodes.map(n => [n.id, n] as const));
    const toTree = (id: string): any => {
      const n = byId.get(id); if (!n) return null;
      const node: any = { name: n.name, __id: id };
      const kids = (n.childrenIds || []).map(cid => toTree(cid)).filter(Boolean);
      if (kids.length) node.children = kids;
      return node;
    };
    const cNode = byId.get(selectedLevelCId);
    if (!cNode) return { name: 'Select a C node' };

    // Get the children of the selected C node
    const children = (cNode.childrenIds || []).map(id => toTree(id)).filter(Boolean);
    if (children.length === 0) {
      return { name: 'No children', children: [] };
    }

    // Create a minimal virtual root that contains all children
    // This allows D3 to render the forest while keeping the C node hidden
    return {
      name: '',  // Empty name so it's not visible
      __id: `virtual-root-${cNode.id}`,
      children: children
    };
  }

  // New method: Build unified tree that spans both sections
  buildUnifiedTree(nodes: PreviewNode[], selectedLevelCId: string | null): any {
    if (!selectedLevelCId) {
      // If no C node is selected, show the normal tree structure
      return this.buildHierarchyForSection1(nodes);
    }

    const byId = new Map(nodes.map(n => [n.id, n] as const));
    const root = this.getRootA(nodes);
    if (!root) return { name: 'Empty' };

    const toTree = (id: string, maxLevel: string): any => {
      const n = byId.get(id)!;
      const node: any = {
        name: n.name,
        __id: id,
        level: n.level,
        isSelectedC: n.id === selectedLevelCId
      };

      if (n.level !== maxLevel) {
        const kids = (n.childrenIds || []).map(cid => toTree(cid, maxLevel)).filter(Boolean);
        if (kids.length) node.children = kids;
      }

      return node;
    };

    // Build the tree up to level C
    const treeUpToC = toTree(root.id, 'C');

    // Now add the children of the selected C node to create the unified view
    const selectedCNode = byId.get(selectedLevelCId);
    if (selectedCNode && selectedCNode.childrenIds.length > 0) {
      // Find the C node in the tree and add its children
      const addChildrenToC = (node: any): any => {
        if (node.__id === selectedLevelCId) {
          // This is the selected C node, add its children
          const children = selectedCNode.childrenIds.map(cid => {
            const childNode = byId.get(cid);
            if (!childNode) return null;

            const buildSubtree = (id: string): any => {
              const n = byId.get(id);
              if (!n) return null;

              const node: any = {
                name: n.name,
                __id: n.id,
                level: n.level,
                isInSection2: true // Mark nodes that should be in section 2
              };

              const kids = (n.childrenIds || []).map(kid => buildSubtree(kid)).filter(Boolean);
              if (kids.length) node.children = kids;

              return node;
            };

            return buildSubtree(cid);
          }).filter(Boolean);

          if (children.length > 0) {
            node.children = children;
          }
        } else if (node.children) {
          // Recursively search for the C node
          node.children = node.children.map((child: any) => addChildrenToC(child));
        }

        return node;
      };

      return addChildrenToC(treeUpToC);
    }

    return treeUpToC;
  }

  collectSection2Nodes(nodes: PreviewNode[], selectedLevelCId: string | null): PreviewNode[] {
    if (!selectedLevelCId) return [];
    const byId = new Map(nodes.map(n => [n.id, n] as const));
    const root = byId.get(selectedLevelCId);
    if (!root) return [];
    const acc: PreviewNode[] = [];
    const walk = (id: string) => {
      const n = byId.get(id); if (!n) return;
      if (n.level === 'D' || n.level === 'E' || n.level === 'F') acc.push(n);
      (n.childrenIds || []).forEach(walk);
    };
    (root.childrenIds || []).forEach(walk);
    return acc;
  }
}

