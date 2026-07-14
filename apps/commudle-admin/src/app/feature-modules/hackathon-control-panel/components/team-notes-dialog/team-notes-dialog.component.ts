import { Component, ChangeDetectionStrategy, ChangeDetectorRef, TemplateRef, ViewChild } from '@angular/core';
import { IHackathonTeam, EDbModels, INote } from '@commudle/shared-models';
import { NbDialogRef, NbDialogService } from '@commudle/theme';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { NoteService, ToastrService } from '@commudle/shared-services';
import moment from 'moment';

@Component({
  selector: 'commudle-team-notes-dialog',
  templateUrl: './team-notes-dialog.component.html',
  styleUrls: ['./team-notes-dialog.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamNotesDialogComponent {
  team: IHackathonTeam;
  newNote = '';
  moment = moment;
  icons = { faPlus, faTrash };
  isLoading = false;
  isSaving = false;

  @ViewChild('deleteConfirmDialog') deleteConfirmDialog: TemplateRef<any>;

  constructor(
    protected dialogRef: NbDialogRef<TeamNotesDialogComponent>,
    private cdr: ChangeDetectorRef,
    private noteService: NoteService,
    private toastrService: ToastrService,
    private nbDialogService: NbDialogService,
  ) {}

  addNote(): void {
    if (!this.newNote.trim() || this.isSaving) return;
    this.isSaving = true;
    const formData = new FormData();
    formData.append('note[text]', this.newNote.trim());
    this.noteService.createNote(formData, EDbModels.HACKATHON_TEAM, this.team.id).subscribe({
      next: (note) => {
        this.team.notes.unshift(note);
        this.newNote = '';
        this.isSaving = false;
        this.toastrService.successDialog('Note added');
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.addNote();
    }
  }

  deleteNote(noteId: number): void {
    this.nbDialogService.open(this.deleteConfirmDialog).onClose.subscribe((confirmed) => {
      if (confirmed) {
        this.noteService.destroyNote(noteId).subscribe({
          next: () => {
            this.team.notes = this.team.notes.filter((n) => n.id !== noteId);
            this.toastrService.successDialog('Note deleted');
            this.cdr.markForCheck();
          },
        });
      }
    });
  }

  trackByNoteId(_index: number, note: INote): number {
    return note.id;
  }

  close(): void {
    this.dialogRef.close();
  }
}
