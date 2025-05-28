import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoliciesRoutingModule } from './policies-routing.module';
import { NbCardModule } from '@commudle/theme';
import { PoliciesComponent } from './component/policies/policies.component';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';

@NgModule({
  declarations: [PoliciesComponent],
  imports: [
    CommonModule,
    PoliciesRoutingModule,
    // nebular
    NbCardModule,
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [],
})
export class PoliciesModule {}
