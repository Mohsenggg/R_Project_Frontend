

import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FamilyMember } from '../../model/interface/FamilyMember';
import { TreeService } from '../../srevices/tree.service';

@Component({
     selector: 'app-tree',
     standalone: true,
     imports: [CommonModule, FormsModule],
     templateUrl: './tree.component.html',
     styleUrl: './tree.component.css',
     animations: [
          trigger('fadeInOut', [
               state('in', style({ opacity: 1, transform: 'scale(1)' })),
               transition(':enter', [
                    style({ opacity: 0, transform: 'scale(0.95)' }),
                    animate('300ms ease-out'),
               ]),
               transition(':leave', [
                    animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' })),
               ]),
          ]),
     ],

})

export class TreeComponent implements OnInit {

     familyTree: FamilyMember[] = [];
     draggingMember: FamilyMember | null = null;
     selectedMember: FamilyMember | null = null;

     offsetX = 0;
     offsetY = 0;

     newName: string = '';
     childName: string = '';


     //============================||  Initialize ||============================

     constructor(
          private cdr: ChangeDetectorRef,
          private treeService: TreeService
     ) { }


     ngOnInit() {
          this.familyTree = [
               { id: 1, name: 'Grandparent', children: [], x: 300, y: 50 }
          ];
     }


     //=======================================================================
     //============================||  Dynamics ||============================
     //=======================================================================

     // ----------------- Drag & Drop ----------------------

     startDrag(event: MouseEvent, member: FamilyMember): void {
          this.draggingMember = member;
          this.offsetX = event.clientX - member.x;
          this.offsetY = event.clientY - member.y;
     }

     @HostListener('document:mousemove', ['$event'])
     onMouseMove(event: MouseEvent): void {
          if (this.draggingMember) {
               this.treeService.moveMember(this.draggingMember, event, this.offsetX, this.offsetY);
               this.cdr.detectChanges();
          }
     }

     @HostListener('document:mouseup')
     stopDrag(): void {
          this.draggingMember = null;
     }

     // ----------------- selection ----------------------

     @HostListener('document:dblclick', ['$event'])
     onDoubleClick(event: MouseEvent): void {
          const target = event.target as HTMLElement;
          const memberCard = target.closest('.member-card');
          if (memberCard) {
               const memberId = Number(memberCard.getAttribute('data-id'));
               const member = this.treeService.findMemberById(this.familyTree, memberId);
               if (member) {
                    this.assignSelectedMember(member);
               }
          }
     }

     @HostListener('document:click', ['$event'])
     onSingleClick(event: MouseEvent): void {
          const target = event.target as HTMLElement;
          const isClickOutside = !target.closest('.edit-panel') && !target.closest('.member-card');
          if (isClickOutside) {
               this.selectedMember = null;
          }
     }

     assignSelectedMember(member: FamilyMember): void {
          this.selectedMember = member;
          this.newName = member.name;
     }



     //=======================================================================
     //============================||  Features ||============================
     //=======================================================================

     // -------------------------- Update & Manage ---------------------------

     updateName(): void {
          if (this.selectedMember) {
               this.treeService.updateMemberName(this.selectedMember, this.newName.trim());
          }
     }

     addNewChild(): void {
          if (this.selectedMember && this.childName.trim()) {
               this.treeService.addChild(this.selectedMember, this.childName.trim());
               this.childName = '';
          }
     }

     removeSelectedChild(): void {
          if (this.selectedMember) {
               const success = this.treeService.removeMemberFromTree(this.familyTree, this.selectedMember.id);
               if (success) {
                    this.selectedMember = null;
                    this.cdr.detectChanges();
               }
          }
     }

}


