import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './session/login/login.module#LoginPageModule' },
  { path: 'listado-obras', loadChildren: './pages/listado-obras/listado-obras.module#ListadoObrasPageModule' },
  { path: 'detalle-obra', loadChildren: './pages/detalle-obra/detalle-obra.module#DetalleObraPageModule' },
  { path: 'visita', loadChildren: './pages/visita/visita.module#VisitaPageModule' },
  { path: 'cerrando-visita', loadChildren: './pages/cerrando-visita/cerrando-visita.module#CerrandoVisitaPageModule' },
  { path: '**', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
