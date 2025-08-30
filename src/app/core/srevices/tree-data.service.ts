import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  _children?: TreeNode[];
}

export interface PreviewNode {
  id: string;
  name: string;
  level: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  parentId: string | null;
  childrenIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TreeDataService {
  constructor(private http: HttpClient) { }

  getTreeData(): TreeNode {
    // fallback static data (optional, can be removed)
    return {
      name: "Gen 1",
      children: [
        { name: "Gen 2 - A" },
        { name: "Gen 2 - B" }
      ]
    };
  }

  getTreeDataFromJson(): Observable<TreeNode> {
    return this.http.get<TreeNode>('assets/resources/treeDummyData.json');
  }

  getPreviewNodesFromJson(): Observable<PreviewNode[]> {
    return this.getTreeDataFromJson().pipe(
      map((root) => this.flattenToPreviewNodes(root))
    );
  }

  private flattenToPreviewNodes(root: TreeNode): PreviewNode[] {
    const result: PreviewNode[] = [];
    const levelMap = ['A','B','C','D','E','F'] as const;
    let counterByDepth: Record<number, number> = {};

    const walk = (node: TreeNode, depth: number, parentId: string | null) => {
      const level = levelMap[Math.min(depth, levelMap.length - 1)];
      counterByDepth[depth] = (counterByDepth[depth] || 0) + 1;
      const id = `${counterByDepth[depth]}${level}`; // e.g., 1A, 2B, etc.
      const children = node.children ?? [];
      const childrenIds: string[] = [];
      const current: PreviewNode = {
        id,
        name: node.name,
        level,
        parentId,
        childrenIds
      };
      result.push(current);
      for (const child of children) {
        const childId = walk(child, depth + 1, id);
        childrenIds.push(childId);
      }
      return id;
    };

    walk(root, 0, null);
    return result;
  }
}
