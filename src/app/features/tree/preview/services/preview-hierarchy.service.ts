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
    const node: any = {
      name: cNode.name,
      __id: cNode.id,
      children: (cNode.childrenIds || []).map(id => toTree(id)).filter(Boolean)
    };
    return node;
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

