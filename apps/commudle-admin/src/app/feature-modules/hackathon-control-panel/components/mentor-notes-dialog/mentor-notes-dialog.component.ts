import { Component, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { IHackathonJudge, EDbModels } from '@commudle/shared-models';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NoteService, ToastrService } from '@commudle/shared-services';
import moment from 'moment';

@Component({
  selector: 'commudle-mentor-notes-dialog',
  templateUrl: './mentor-notes-dialog.component.html',
  styleUrls: ['./mentor-notes-dialog.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MentorNotesDialogComponent {
  mentor: IHackathonJudge;
  hackathonId: number | string;
  newNote = '';
  moment = moment;
  icons = { faPlus, faTrash };
  isLoading = false;

  @ViewChild('deleteConfirmDialog') deleteConfirmDialog: TemplateRef<any>;

  constructor(
    protected dialogRef: NbDialogRef<MentorNotesDialogComponent>,
    private cdr: ChangeDetectorRef,
    private noteService: NoteService,
    private toastrService: ToastrService,
    private nbDialogService: NbDialogService,
  ) {}

  addNote(): void {
    if (!this.newNote.trim()) return;
    const formData = new FormData();
    formData.append('note[text]', this.newNote.trim());
    this.noteService
      .createNote(formData, EDbModels.HACKATHON, this.hackathonId, EDbModels.HACKATHON_JUDGE, this.mentor.id)
      .subscribe({
        next: (note) => {
          this.mentor.notes.unshift(note);
          this.newNote = '';
          this.toastrService.successDialog('Note added');
          this.cdr.markForCheck();
        },
      });
  }

  deleteNote(noteId: number): void {
    this.nbDialogService.open(this.deleteConfirmDialog).onClose.subscribe((confirmed) => {
      if (confirmed) {
        this.noteService.destroyNote(noteId).subscribe({
          next: () => {
            this.mentor.notes = this.mentor.notes.filter((n) => n.id !== noteId);
            this.toastrService.successDialog('Note deleted');
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
