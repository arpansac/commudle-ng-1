import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ComCardBodyComponent } from './components/commudle-card/card-body/card-body.component';
import { ComCardFooterComponent } from './components/commudle-card/card-footer/card-footer.component';
import { ComCardHeaderComponent } from './components/commudle-card/card-header/card-header.component';
import { ComCardComponent } from './components/commudle-card/card/card.component';

const COMPONENTS = [ComCardComponent, ComCardHeaderComponent, ComCardBodyComponent, ComCardFooterComponent];

@NgModule({
  imports: [CommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS,
})
export class CommudleThemeModule {}
