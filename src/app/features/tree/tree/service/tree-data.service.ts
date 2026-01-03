import { Observable } from 'rxjs';
import { ITreeNode } from '../model/interface/view-Tree-interfaces';

export abstract class TreeDataService {
      abstract getTreeNodes(treeId: number): Observable<ITreeNode[]>;
}
