import { NgModule } from '@angular/core';
import { CommudleButtonModule } from './components/commudle-button/commudle-button.module';
import { CommudleCardModule } from './components/commudle-card/commudle-card.module';
import { CommudleInputModule } from './components/commudle-input/commudle-input.module';

@NgModule({
  imports: [CommudleCardModule, CommudleButtonModule, CommudleInputModule],
  exports: [CommudleCardModule, CommudleButtonModule, CommudleInputModule],
})
export class CommudleThemeModule {}
