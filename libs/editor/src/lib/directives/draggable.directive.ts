import { Directive, HostBinding } from '@angular/core';

@Directive({
    selector: '[tiptapDraggable]',
    standalone: false
})
export class DraggableDirective {
  @HostBinding('attr.draggable') draggable = true;
  @HostBinding('attr.data-drag-handle') handle = '';
}
