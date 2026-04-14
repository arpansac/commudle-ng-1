import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComCardBodyComponent } from './card-body/card-body.component';
import { ComCardFooterComponent } from './card-footer/card-footer.component';
import { ComCardHeaderComponent } from './card-header/card-header.component';
import { ComCardComponent } from './card/card.component';

const COMPONENTS = [ComCardComponent, ComCardHeaderComponent, ComCardBodyComponent, ComCardFooterComponent];

@NgModule({
  imports: [CommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class CommudleCardModule {}
