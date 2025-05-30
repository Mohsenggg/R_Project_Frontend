

import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
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


  @ViewChild('treeContainer', { static: false }) treeContainerRef!: ElementRef;

  familyTree: FamilyMember[] = [];
  draggingMember: FamilyMember | null = null;
  selectedMember: FamilyMember | null = null;

  offsetX = 0;
  offsetY = 0;

  newName: string = '';
  childName: string = '';
  saveMessage = '';


  //============================||  Initialize ||============================

  constructor(
    private cdr: ChangeDetectorRef,
    private treeService: TreeService
  ) { }


  ngOnInit() {

    this.treeService.loadTree().then((tree) => {
      this.familyTree = tree;
      this.updateAllConnections(); // update lines after loading

    });
  }

  onSave() {
    this.treeService.saveTree(this.familyTree)
      .then(() => {
        this.saveMessage = '✅ Tree saved successfully!';
        alert("✅ Tree saved successfully!")
        setTimeout(() => this.saveMessage = '', 3000); // Hide after 3 sec
      })
      .catch(error => {
        console.error('Error saving tree:', error);
        this.saveMessage = '❌ Failed to save tree.';
      });
  }


  //=======================================================================
  //============================||  Dynamics ||============================
  //=======================================================================

  // ----------------- Drag & Drop ----------------------

  startDrag(event: MouseEvent | TouchEvent, member: FamilyMember): void {

    const isTouch = event instanceof TouchEvent;
    const clientX = isTouch ? event.touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = isTouch ? event.touches[0].clientY : (event as MouseEvent).clientY;

    this.offsetX = clientX - member.x;
    this.offsetY = clientY - member.y;
    this.draggingMember = member;

    if (isTouch) {
      event.preventDefault(); // Prevent scrolling during touch drag
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMouseMove(event: MouseEvent | TouchEvent): void {
    if (this.draggingMember) {
      this.treeService.moveMember(this.draggingMember, event, this.offsetX, this.offsetY);
      this.updateAllConnections(); // recalculate positions
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  stopDrag(): void {
    this.draggingMember = null;
  }

  // ----------------- selection ----------------------

  @HostListener('document:dblclick', ['$event'])
  onDoubleClick(event: MouseEvent | TouchEvent): void {
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
  onSingleClick(event: MouseEvent | TouchEvent): void {
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

  private lastTapTime = 0;
  private doubleTapThreshold = 300; // milliseconds

  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTapTime;

    if (tapLength < this.doubleTapThreshold && tapLength > 0) {
      // Detected double tap
      const target = event.target as HTMLElement;
      const memberCard = target.closest('.member-card');
      if (memberCard) {
        const memberId = Number(memberCard.getAttribute('data-id'));
        const member = this.treeService.findMemberById(this.familyTree, memberId);
        if (member) {
          this.assignSelectedMember(member);
        }
      }
      event.preventDefault(); // Prevent default zoom on double tap
    }

    this.lastTapTime = currentTime;
  }


  // longPressTimeout: any = null;

  // @HostListener('touchstart', ['$event'])
  // onTouchStart(event: TouchEvent): void {
  //   const target = event.target as HTMLElement;
  //   const memberCard = target.closest('.member-card');

  //   if (memberCard) {
  //     this.longPressTimeout = setTimeout(() => {
  //       const memberId = Number(memberCard.getAttribute('data-id'));
  //       const member = this.treeService.findMemberById(this.familyTree, memberId);
  //       if (member) {
  //         this.assignSelectedMember(member);
  //         this.cdr.detectChanges(); // Ensure UI updates
  //       }
  //     }, 1500); // 500ms = long press
  //   }
  // }

  // @HostListener('touchend')
  // @HostListener('touchcancel')
  // onTouchEnd(): void {
  //   clearTimeout(this.longPressTimeout);
  // }



  // ----------------- ZOOM & Scroll ----------------------


  private getDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
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

  zoomLevel: number = 1;

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel += 0.1;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.3) {
      this.zoomLevel -= 0.1;
    }
  }




  connectionLines: { x1: number; y1: number; x2: number; y2: number }[] = [];

  private collectLines(member: FamilyMember): void {
    if (!member.children) return;

    for (const child of member.children) {
      this.connectionLines.push({
        x1: member.x + 50,
        y1: member.y + 105,
        x2: child.x + 50,
        y2: child.y,
      });
      this.collectLines(child); // recursively get child lines
    }
  }

  private updateAllConnections(): void {
    this.connectionLines = [];
    for (const root of this.familyTree) {
      this.collectLines(root);
    }
  }

}


