import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NbButtonModule, NbIconModule, NbInputModule, NbSpinnerModule } from '@commudle/theme';
import { CreateOrganizationComponent } from './components/create-organization/create-organization.component';

const routes: Routes = [{ path: '', component: CreateOrganizationComponent }];

@NgModule({
  declarations: [CreateOrganizationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    NbButtonModule,
    NbIconModule,
    NbInputModule,
    NbSpinnerModule,
  ],
})
export class CreateOrganizationModule {}
