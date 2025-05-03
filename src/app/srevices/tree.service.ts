import { Injectable } from '@angular/core';
import { FamilyMember } from '../model/interface/FamilyMember';

@Injectable({
     providedIn: 'root'
})
export class TreeService {


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
