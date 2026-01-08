import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITreeNode } from '../../model/interface/view-Tree-interfaces';
import { treeData } from '../../model/data/treeData';
import { TreeDataService } from './tree-data.service';

@Injectable({
      providedIn: 'root'
})
export class MockTreeDataService extends TreeDataService {
      getTreeNodes(treeId: number): Observable<ITreeNode[]> {
            console.log('Fetching mock tree data for ID:', treeId);
            return of(treeData);
      }
}
