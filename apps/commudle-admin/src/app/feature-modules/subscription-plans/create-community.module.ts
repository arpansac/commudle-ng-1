import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  NbButtonModule,
  NbCheckboxModule,
  NbIconModule,
  NbInputModule,
  NbSelectModule,
  NbSpinnerModule,
} from '@commudle/theme';
import { CreateCommunityComponent } from './components/create-community/create-community.component';

const routes: Routes = [{ path: '', component: CreateCommunityComponent }];

@NgModule({
  declarations: [CreateCommunityComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbSelectModule,
    NbCheckboxModule,
    NbSpinnerModule,
  ],
})
export class CreateCommunityModule {}
