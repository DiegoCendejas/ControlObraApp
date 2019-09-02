import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ListadoObrasPage } from './listado-obras.page';

const routes: Routes = [
  {
    path: '',
    component: ListadoObrasPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ListadoObrasPage]
})
export class ListadoObrasPageModule {}
