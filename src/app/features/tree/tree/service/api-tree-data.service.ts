import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { TreeDataService } from './tree-data.service';
import { ITreeNode } from '../model/interface/view-Tree-interfaces';

/**
 * Interface representing the backend Node entity/DTO
 */
interface BackendNode {
      nodeId: number;
      parentId: number;
      nodeName: string;
      level: number;
}

/**
 * Interface representing the full backend response for a tree
 */
interface TreeResponse {
      treeId: number;
      treeName: string;
      nodeDTOS: BackendNode[];
}

@Injectable({
      providedIn: 'root'
})
export class ApiTreeDataService extends TreeDataService {
      private http = inject(HttpClient);
      private readonly baseUrl = 'http://localhost:8080/api/trees';

      getTreeNodes(treeId: number): Observable<ITreeNode[]> {
            return this.http.get<TreeResponse>(`${this.baseUrl}/${treeId}`).pipe(
                  map(response => this.mapBackendNodesToFrontend(response.nodeDTOS))
            );
      }

      /**
       * Maps backend Node DTOs to frontend ITreeNode interfaces.
       */
      private mapBackendNodesToFrontend(nodes: BackendNode[]): ITreeNode[] {
            return nodes.map(node => ({
                  id: node.nodeId,
                  parentId: node.parentId,
                  name: node.nodeName,
                  level: node.level
            }));
      }
}
