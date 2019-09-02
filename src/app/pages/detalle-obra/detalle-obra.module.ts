import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DetalleObraPage } from './detalle-obra.page';

const routes: Routes = [
  {
    path: '',
    component: DetalleObraPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DetalleObraPage
  ]
})
export class DetalleObraPageModule { }
