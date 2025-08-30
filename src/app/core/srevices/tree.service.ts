import { Injectable } from '@angular/core';
import { FamilyMember } from '../model/interface/FamilyMember';
// import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';

import { createClient, SupabaseClient } from '@supabase/supabase-js';




@Injectable({
     providedIn: 'root'
})

export class TreeService {
  private supabase: SupabaseClient;
  private readonly treeId = 'familyTree';

  constructor() {
    const supabaseUrl = 'https://fiyovbegdydjkebrnyxw.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeW92YmVnZHlkamtlYnJueXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5NjU2MTMsImV4cCI6MjA2NDU0MTYxM30.C3Nc83NgfX7R1nFiMKTddGiJNbjA_KQZDZinVLt-Xe4';

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /** Save the family tree to Supabase */
  async saveTree(tree: FamilyMember[]): Promise<void> {
    const plainTree = JSON.parse(JSON.stringify(tree));

    const { error } = await this.supabase
      .from('trees')
      .upsert({ id: this.treeId, tree: plainTree });

    if (error) {
      console.error('❌ Failed to save family tree:', error);
      throw error;
    }

    console.log('✅ Family tree saved successfully');
  }

  /** Load the family tree from Supabase */
  async loadTreeFromSupabase(): Promise<FamilyMember[]> {
    const { data, error } = await this.supabase
      .from('trees')
      .select('tree')
      .eq('id', this.treeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('⚠️ No family tree found in Supabase');
        return [];
      }

      console.error('❌ Failed to load family tree:', error);
      return [];
    }

    const loadedTree = data.tree || [];
    console.log('✅ Family tree loaded:', loadedTree);
    return loadedTree as FamilyMember[];
  }












//  /** Save the family tree to Firestore (as plain JSON) */
//  async saveTree(tree: FamilyMember[]): Promise<void> {
//   const treeRef = doc(this.firestore, this.treePath);

//   // Convert to plain object (avoid functions, undefined, circular refs)
//   const plainTree = JSON.parse(JSON.stringify(tree));

//   try {
//     await setDoc(treeRef, { tree: plainTree });
//     console.log('✅ Family tree saved successfully');
//   } catch (error) {
//     console.error('❌ Failed to save family tree:', error);
//     throw error;
//   }
// }

// /** Load the family tree from Firestore */
// async loadTree(): Promise<FamilyMember[]> {
//   const treeRef = doc(this.firestore, this.treePath);

//   try {
//     const snapshot = await getDoc(treeRef);

//     if (snapshot.exists()) {
//       const data = snapshot.data();
//       const loadedTree = data?.['tree'] || [];
//       console.log('✅ Family tree loaded:', loadedTree);
//       return loadedTree as FamilyMember[];
//     } else {
//       console.warn('⚠️ No family tree found in Firestore');
//       return [];
//     }

//   } catch (error) {
//     console.error('❌ Failed to load family tree:', error);
//     return [];
//   }
// }



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

     moveMember(member: FamilyMember, event: MouseEvent | TouchEvent, offsetX: number, offsetY: number): void {
      const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
      const clientY = event instanceof TouchEvent ? event.touches[0].clientY : event.clientY;

      member.x = clientX - offsetX;
      member.y = clientY - offsetY;
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
