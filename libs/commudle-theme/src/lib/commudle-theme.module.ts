import { NgModule } from '@angular/core';
import { CommudleCardModule } from './components/commudle-card/commudle-card.module';

@NgModule({
  imports: [CommudleCardModule],
  exports: [CommudleCardModule],
})
export class CommudleThemeModule {}
