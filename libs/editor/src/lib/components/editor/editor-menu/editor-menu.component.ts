import { Component, Input, OnInit } from '@angular/core';
import { Editor } from '@tiptap/core';

@Component({
    selector: 'commudle-editor-menu',
    templateUrl: './editor-menu.component.html',
    styleUrls: ['./editor-menu.component.scss'],
    standalone: false
})
export class EditorMenuComponent implements OnInit {
  @Input() editor: Editor;

  constructor() {}

  ngOnInit(): void {}
}
