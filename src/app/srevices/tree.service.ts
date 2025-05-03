import { Injectable } from '@angular/core';
import { FamilyMember } from '../model/interface/FamilyMember';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';



@Injectable({
     providedIn: 'root'
})
export class TreeService {


  private readonly treePath = 'trees/familyTree';

  constructor(private firestore: Firestore) {}

 /** Save the family tree to Firestore (as plain JSON) */
 async saveTree(tree: FamilyMember[]): Promise<void> {
  const treeRef = doc(this.firestore, this.treePath);

  // Convert to plain object (avoid functions, undefined, circular refs)
  const plainTree = JSON.parse(JSON.stringify(tree));

  try {
    await setDoc(treeRef, { tree: plainTree });
    console.log('✅ Family tree saved successfully');
  } catch (error) {
    console.error('❌ Failed to save family tree:', error);
    throw error;
  }
}

/** Load the family tree from Firestore */
async loadTree(): Promise<FamilyMember[]> {
  const treeRef = doc(this.firestore, this.treePath);

  try {
    const snapshot = await getDoc(treeRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const loadedTree = data?.['tree'] || [];
      console.log('✅ Family tree loaded:', loadedTree);
      return loadedTree as FamilyMember[];
    } else {
      console.warn('⚠️ No family tree found in Firestore');
      return [];
    }

  } catch (error) {
    console.error('❌ Failed to load family tree:', error);
    return [];
  }
}



    // constructor(private firestore: Firestore) {}

    // async saveTree(tree: FamilyMember[]): Promise<void> {
    //   const treeRef = doc(this.firestore, 'trees/familyTree');
    //   await setDoc(treeRef, { tree });
    // }

    //   async loadTree(): Promise<FamilyMember[]> {
    //     const treeRef = doc(this.firestore, 'trees/familyTree');
    //     const snapshot = await getDoc(treeRef);
    //     const data = snapshot.data();
    //     return data?.['tree'] || [];
    //   }



     //===================================================================
     // ===== Dragging Logic =====

     //----------------------------------------------------------------

     moveMember(member: FamilyMember, event: MouseEvent, offsetX: number, offsetY: number): void {
          member.x = event.clientX - offsetX;
          member.y = event.clientY - offsetY;
     }


     //===================================================================
     // ===== Hierarchy Management =====

     //----------------------------------------------------------------

     addChild(parent: FamilyMember, name: string): FamilyMember {
          const newChild: FamilyMember = {
               id: Date.now(),
               name,
               children: [],
               x: parent.x + (parent.children.length * 150) - 75,
               y: parent.y + 100
          };
          parent.children.push(newChild);
          return newChild;
     }

     //----------------------------------------------------------------

     removeMemberFromTree(tree: FamilyMember[], memberId: number): boolean {
          const parent = this.findParent(tree, memberId);
          if (parent) {
               parent.children = parent.children.filter(child => child.id !== memberId);
               return true;
          }
          return false;
     }

     //===================================================================
     // ===== Selection Logic =====

     //----------------------------------------------------------------

     findParent(members: FamilyMember[], childId: number): FamilyMember | null {

          for (let m of members) {
               if (m.children.some(child => child.id === childId)) {
                    return m;
               } else {
                    const found = this.findParent(m.children, childId);
                    if (found) return found;
               }
          }
          return null;
     }

     //----------------------------------------------------------------

     findMemberById(members: FamilyMember[], id: number): FamilyMember | null {

          for (let m of members) {
               if (m.id === id) return m;

               const found = this.findMemberById(m.children, id);
               if (found) return found;
          }
          return null;
     }

     //----------------------------------------------------------------

     updateMemberName(member: FamilyMember, newName: string): void {
          member.name = newName;
     }

}
