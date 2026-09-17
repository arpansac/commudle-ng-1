import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NbCheckboxModule, NbDialogService, NbIconModule, NbInputModule, NbSelectModule } from '@commudle/theme';
import { CommudleButtonModule } from '@commudle/commudle-theme';
import { ICertificateBatch, ICertificateVariable, ICertificateVariableTextStyle } from '@commudle/shared-models';
import { CertificateVariableService } from '@commudle/shared-services';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LibToastLogService } from 'apps/shared-services/lib-toastlog.service';
import { SharedComponentsModule } from 'apps/shared-components/shared-components.module';
import { Subject, takeUntil } from 'rxjs';
import type KonvaNamespace from 'konva';
import { CertificateVariableDefaultValueDialogComponent } from '../certificate-variable-default-value-dialog/certificate-variable-default-value-dialog.component';

type VariableAction = 'default_value' | 'delete';

const DEFAULT_TEXT_STYLE: ICertificateVariableTextStyle = {
  font: 'Helvetica',
  size: 16,
  color: '000000',
  weight: 'normal',
  style: 'normal',
  align: 'left',
};

const DEFAULT_BOX_WIDTH = 0.25;
const DEFAULT_BOX_HEIGHT = 0.08;
const MAX_CANVAS_WIDTH = 800;

// Only Prawn's built-in fonts are wired on the backend so far (see spec's Open
// Design Decisions - broad-Unicode font bundling is still an open item), so
// the picker is limited to what can actually render.
export const CERTIFICATE_FONT_OPTIONS = ['Helvetica', 'Times-Roman', 'Courier'];

@Component({
  selector: 'commudle-certificate-canvas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommudleButtonModule,
    NbInputModule,
    NbSelectModule,
    NbIconModule,
    NbCheckboxModule,
    FontAwesomeModule,
    SharedComponentsModule,
  ],
  templateUrl: './certificate-canvas.component.html',
  styleUrls: ['./certificate-canvas.component.scss'],
})
export class CertificateCanvasComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() batch: ICertificateBatch;
  @Output() variablesChanged = new EventEmitter<void>();

  @ViewChild('stageContainer', { static: false }) stageContainer: ElementRef<HTMLDivElement>;

  variables: ICertificateVariable[] = [];
  selectedVariable: ICertificateVariable | null = null;
  isLoading = true;
  isSaving = false;
  isDirty = false;
  fontOptions = CERTIFICATE_FONT_OPTIONS;

  showAddForm = false;
  addForm: FormGroup;
  icons = { faPlus };

  private Konva: typeof KonvaNamespace;
  private stage: KonvaNamespace.Stage;
  private layer: KonvaNamespace.Layer;
  private transformer: KonvaNamespace.Transformer;
  private boxesById = new Map<
    number,
    { group: KonvaNamespace.Group; rect: KonvaNamespace.Rect; text: KonvaNamespace.Text }
  >();
  private scale = 1;
  private viewInitialized = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private certificateVariableService: CertificateVariableService,
    private toastLogService: LibToastLogService,
    private dialogService: NbDialogService,
  ) {
    this.addForm = this.fb.group({
      label: ['', Validators.required],
    });
  }

  get isLocked(): boolean {
    return !!this.batch?.locked_at;
  }

  ngAfterViewInit() {
    this.viewInitialized = true;
    if (this.batch?.design) {
      this.initCanvas();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.batch && this.batch) {
      this.fetchVariables();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stage?.destroy();
  }

  fetchVariables() {
    this.isLoading = true;
    this.certificateVariableService
      .indexCertificateVariables(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.variables = res.certificate_variables;
        this.isLoading = false;
        if (this.viewInitialized && this.batch?.design) {
          this.initCanvas();
        }
      });
  }

  // Refreshes the variable list only - unlike fetchVariables(), doesn't
  // re-run initCanvas() (which destroys and rebuilds the whole Konva
  // stage). Used when another section (CSV upload) adds variables we
  // don't already have rendered, so there's nothing on the canvas itself
  // to redraw.
  refreshVariablesList() {
    this.certificateVariableService
      .indexCertificateVariables(this.batch.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.variables = res.certificate_variables;
      });
  }

  private async initCanvas() {
    if (!this.Konva) {
      const mod = await import('konva');
      this.Konva = mod.default;
    }
    this.stage?.destroy();
    this.boxesById.clear();

    const { image_width, image_height, background_image_url } = this.batch.design;
    this.scale = Math.min(1, MAX_CANVAS_WIDTH / image_width);
    const displayWidth = image_width * this.scale;
    const displayHeight = image_height * this.scale;

    this.stage = new this.Konva.Stage({
      container: this.stageContainer.nativeElement,
      width: displayWidth,
      height: displayHeight,
    });
    this.layer = new this.Konva.Layer();
    this.stage.add(this.layer);

    const imageEl = new Image();
    imageEl.crossOrigin = 'anonymous';
    imageEl.onload = () => {
      const bgImage = new this.Konva.Image({
        image: imageEl,
        width: displayWidth,
        height: displayHeight,
        listening: false,
      });
      this.layer.add(bgImage);
      bgImage.moveToBottom();
      this.layer.draw();
    };
    imageEl.src = background_image_url;

    this.transformer = new this.Konva.Transformer({
      rotateEnabled: false,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    });
    this.layer.add(this.transformer);

    this.stage.on('click tap', (e) => {
      if (e.target === this.stage) {
        this.deselect();
      }
    });

    this.variables.filter((v) => v.positioned).forEach((variable) => this.renderBox(variable));

    this.layer.draw();
  }

  private renderBox(variable: ICertificateVariable) {
    const displayWidth = this.batch.design.image_width * this.scale;
    const displayHeight = this.batch.design.image_height * this.scale;
    const pos = variable.positions;
    const style = variable.text_style || DEFAULT_TEXT_STYLE;

    const group = new this.Konva.Group({
      x: pos.x * displayWidth,
      y: pos.y * displayHeight,
      draggable: !this.isLocked,
    });

    const rect = new this.Konva.Rect({
      width: pos.width * displayWidth,
      height: pos.height * displayHeight,
      stroke: '#3366ff',
      strokeWidth: 1,
      dash: [4, 4],
      fill: 'rgba(51, 102, 255, 0.08)',
    });

    const text = new this.Konva.Text({
      width: pos.width * displayWidth,
      height: pos.height * displayHeight,
      text: `{{${variable.label}}}`,
      verticalAlign: 'middle',
      padding: 2,
    });
    this.applyStyleToText(text, style);

    group.add(rect);
    group.add(text);
    this.layer.add(group);

    group.on('click tap', (e) => {
      e.cancelBubble = true;
      this.select(variable, group);
    });

    // Dragging doesn't fire a 'click' when the drag threshold is exceeded,
    // so selecting only on click leaves a dragged box unselected - select
    // as soon as the drag starts instead.
    group.on('dragstart', () => this.select(variable, group));

    group.on('dragend', () => this.onBoxTransformed(variable, group, rect));
    group.on('transformend', () => this.onBoxTransformed(variable, group, rect));

    this.boxesById.set(variable.id, { group, rect, text });
  }

  private applyStyleToText(text: KonvaNamespace.Text, style: ICertificateVariableTextStyle) {
    text.fontSize(style.size || 16);
    text.fontFamily(style.font || 'Helvetica');
    text.fontStyle(
      `${style.weight === 'bold' ? 'bold' : ''} ${style.style === 'italic' ? 'italic' : ''}`.trim() || 'normal',
    );
    text.fill(style.color ? `#${style.color}` : '#000000');
    text.align(style.align || 'left');
  }

  private onBoxTransformed(variable: ICertificateVariable, group: KonvaNamespace.Group, rect: KonvaNamespace.Rect) {
    const displayWidth = this.batch.design.image_width * this.scale;
    const displayHeight = this.batch.design.image_height * this.scale;

    const scaleX = group.scaleX();
    const scaleY = group.scaleY();
    const width = rect.width() * scaleX;
    const height = rect.height() * scaleY;
    group.scaleX(1);
    group.scaleY(1);
    rect.width(width);
    rect.height(height);
    const box = this.boxesById.get(variable.id);
    box.text.width(width);
    box.text.height(height);

    variable.positions = {
      x: group.x() / displayWidth,
      y: group.y() / displayHeight,
      width: width / displayWidth,
      height: height / displayHeight,
    };
    variable.positioned = true;
    this.isDirty = true;
    this.layer.draw();
  }

  private select(variable: ICertificateVariable, group: KonvaNamespace.Group) {
    this.selectedVariable = variable;
    this.transformer.nodes([group]);
    this.layer.draw();
  }

  deselect() {
    this.selectedVariable = null;
    this.transformer?.nodes([]);
    this.layer?.draw();
  }

  addToCanvas(variable: ICertificateVariable) {
    const displayWidth = this.batch.design.image_width * this.scale;
    const displayHeight = this.batch.design.image_height * this.scale;
    variable.positions = {
      x: (displayWidth / 2 - (DEFAULT_BOX_WIDTH * displayWidth) / 2) / displayWidth,
      y: (displayHeight / 2 - (DEFAULT_BOX_HEIGHT * displayHeight) / 2) / displayHeight,
      width: DEFAULT_BOX_WIDTH,
      height: DEFAULT_BOX_HEIGHT,
    };
    variable.text_style = variable.text_style || { ...DEFAULT_TEXT_STYLE };
    variable.positioned = true;
    this.renderBox(variable);
    this.isDirty = true;
    this.layer.draw();
  }

  removeFromCanvas(variable: ICertificateVariable) {
    this.destroyBox(variable.id);
    variable.positions = null;
    variable.positioned = false;
    if (this.selectedVariable?.id === variable.id) {
      this.deselect();
    }
    this.isDirty = true;
    this.layer.draw();
  }

  toggleCanvasPlacement(variable: ICertificateVariable, placed: boolean) {
    if (this.isLocked) {
      return;
    }
    if (placed) {
      this.addToCanvas(variable);
    } else {
      this.removeFromCanvas(variable);
    }
  }

  private destroyBox(variableId: number) {
    const box = this.boxesById.get(variableId);
    box?.group.destroy();
    this.boxesById.delete(variableId);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.addForm.reset();
    }
  }

  addVariable() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }
    this.certificateVariableService
      .createCertificateVariable(this.batch.uuid, this.addForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (variable) => {
          this.variables = [...this.variables, variable];
          this.addForm.reset();
          this.showAddForm = false;
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not add the variable');
        },
      });
  }

  onVariableAction(variable: ICertificateVariable, action: VariableAction | '') {
    if (action === 'default_value') {
      this.setDefaultValue(variable);
    } else if (action === 'delete') {
      this.deleteVariable(variable);
    }
  }

  setDefaultValue(variable: ICertificateVariable) {
    this.dialogService
      .open(CertificateVariableDefaultValueDialogComponent, {
        context: { label: variable.label, defaultValue: variable.default_value || '' },
      })
      .onClose.pipe(takeUntil(this.destroy$))
      .subscribe((value: string | undefined) => {
        if (value === undefined || value === variable.default_value) {
          return;
        }
        this.certificateVariableService
          .updateCertificateVariable(this.batch.uuid, variable.id, { default_value: value })
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (updated) => {
              variable.default_value = updated.default_value;
              variable.default_set = updated.default_set;
            },
            error: () => {
              this.toastLogService.errorDialog('Could not update the default value');
            },
          });
      });
  }

  deleteVariable(variable: ICertificateVariable) {
    if (!confirm(`Remove the "${variable.label}" variable? This cannot be undone.`)) {
      return;
    }
    this.certificateVariableService
      .deleteCertificateVariable(this.batch.uuid, variable.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (variable.positioned) {
            this.destroyBox(variable.id);
            if (this.selectedVariable?.id === variable.id) {
              this.deselect();
            }
            this.layer.draw();
          }
          this.variables = this.variables.filter((v) => v.id !== variable.id);
          this.toastLogService.successDialog('Variable removed');
          this.variablesChanged.emit();
        },
        error: () => {
          this.toastLogService.errorDialog('Could not remove the variable');
        },
      });
  }

  updateStyle(patch: Partial<ICertificateVariableTextStyle>) {
    if (!this.selectedVariable) {
      return;
    }
    this.selectedVariable.text_style = { ...(this.selectedVariable.text_style || DEFAULT_TEXT_STYLE), ...patch };
    const box = this.boxesById.get(this.selectedVariable.id);
    if (box) {
      this.applyStyleToText(box.text, this.selectedVariable.text_style);
      this.layer.draw();
    }
    this.isDirty = true;
  }

  saveLayout() {
    const placed = this.variables.filter((v) => v.positioned);
    if (placed.length === 0) {
      return;
    }
    this.isSaving = true;
    this.certificateVariableService
      .updateLayout(
        this.batch.uuid,
        placed.map((v) => ({ id: v.id, positions: v.positions, text_style: v.text_style })),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isSaving = false;
          this.isDirty = false;
          this.variables = res.certificate_variables;
          this.toastLogService.successDialog('Layout saved');
        },
        error: () => {
          this.isSaving = false;
          this.toastLogService.errorDialog('Could not save the layout');
        },
      });
  }
}
