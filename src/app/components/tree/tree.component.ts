

import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FamilyMember } from '../../model/interface/FamilyMember';

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


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.familyTree = [
      { id: 1, name: 'Grandparent', children: [], x: 300, y: 50 }
    ];
  }

  // Move the member -------------------------
  startDrag(event: MouseEvent, member: FamilyMember) {
    this.draggingMember = member;
    // clientX || x-position of the mouse in the viewport when the drag started.
    // offsetX || This makes the dragging feel natural and smooth.
    this.offsetX = event.clientX - member.x;
    this.offsetY = event.clientY - member.y;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingMember) {
      this.draggingMember.x = event.clientX - this.offsetX;
      this.draggingMember.y = event.clientY - this.offsetY;
      this.cdr.detectChanges(); // Force UI update
    }
  }

  @HostListener('document:mouseup')
  stopDrag() {
    this.draggingMember = null;
  }


  // updateTheSelectedMember ----------------------

  assignSelectedMember(member: FamilyMember) {
    this.selectedMember = member;
    this.newName = member.name;
  }

  updateName() {
    if (this.selectedMember) {
      this.selectedMember.name = this.newName
    }
  }

  addNewChild() {
    if (this.selectedMember && this.childName.trim()) {
      const newChild: FamilyMember = {
        id: Date.now(),
        name: this.childName,
        children: [],
        x: this.selectedMember.x + (this.selectedMember.children.length * 150) - 75, // Dynamic positioning
        y: this.selectedMember.y + 100 // Move down vertically
      }
      this.selectedMember.children.push(newChild)
      this.childName = '';
    }
  }
  //----------------------------------------------------



  removeSelectedChild() {
    if (!this.selectedMember) return;

    const parent = this.findParent(this.familyTree, this.selectedMember.id);
    if (parent) {
      parent.children = parent.children.filter(child => child.id !== this.selectedMember!.id);
      this.selectedMember = null;
      this.cdr.detectChanges(); // Ensure UI updates
    }
  }

  private findParent(members: FamilyMember[], childId: number): FamilyMember | null {
    for (let member of members) {
      if (member.children.some(child => child.id === childId)) {
        return member;
      } else {
        const found = this.findParent(member.children, childId);
        if (found) return found;
      }
    }
    return null;
  }

  //-------------------------------------------


  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const memberCard = target.closest('.member-card');

    if (memberCard) {
      const memberId = Number(memberCard.getAttribute('data-id'));
      const member = this.findMemberById(this.familyTree, memberId);
      if (member) {
        this.assignSelectedMember(member);
      }
    }
    // Do nothing else — no deselection here
  }


  @HostListener('document:click', ['$event'])
  onSingleClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const editPanel = target.closest('.edit-panel');
    const memberCard = target.closest('.member-card');

    if (!editPanel && !memberCard) {
      this.selectedMember = null;
    }
  }


  findMemberById(members: FamilyMember[], id: number): FamilyMember | null {
    for (let m of members) {
      if (m.id === id) return m;
      const found = this.findMemberById(m.children, id);
      if (found) return found;
    }
    return null;
  }

}




// @HostListener('document:dblclick', ['$event'])
// onClick(event: MouseEvent) {
//        const target = event.target as HTMLElement;
//        // Only trigger select if clicked on a member card
//        const memberCard = target.closest('.member-card');
//        const editPanel = target.closest('.edit-panel');

//        if (memberCard) {
//               const memberId = Number(memberCard.getAttribute('data-id'));
//               const member = this.findMemberById(this.familyTree, memberId);
//               if (member) {
//                      this.assignSelectedMember(member);
//               }

//        } else if (editPanel) {
//               // Do nothing — user clicked inside the panel
//               return;

//        } else {
//               // Clicked outside both — clear selection
//               this.selectedMember = null;
//        }
// }




// addChild(parent: FamilyMember) {

// 	const newChild: FamilyMember = {
// 		id: Date.now(),
// 		name: `Child of ${parent.name}`,
// 		children: [],
// 		// his line makes sure the new child is placed at a horizontal position relative to the number of siblings
// 		x: parent.x + (parent.children.length * 150) - 75, // Dynamic positioning
// 		y: parent.y + 100 // Move down vertically
// 	};

// 	parent.children.push(newChild);
// 	this.cdr.detectChanges(); // Force update

// }


// updateTheSelectedMember() { }

// updateMember(member: FamilyMember) {
//   alert("Welcome to your first time with event binding" + member.name)
// }

