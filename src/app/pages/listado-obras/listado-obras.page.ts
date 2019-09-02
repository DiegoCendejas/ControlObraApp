import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ObraService } from '../../services/obra.service';

@Component({
  selector: 'app-listado-obras',
  templateUrl: './listado-obras.page.html',
  styleUrls: ['./listado-obras.page.scss'],
})
export class ListadoObrasPage implements OnInit {

  userData: any;
  listObras: any[];

  constructor(private router: Router, private storage: Storage, private obraService: ObraService) { }

  ngOnInit() {
    this.storage.get('userData').then((val) => {
      this.userData = JSON.parse(val);
      this.getListaObras();
    });
  }

  getListaObras() {
    this.obraService.getListaObras(this.userData.Usuario_ID, this.userData.Puesto_ID).subscribe((Response: any) => {
      this.listObras = JSON.parse(Response);
    });
  }

  detalleObra(item) {
    let navigationExtras: NavigationExtras = {
      state: {
        obra: JSON.stringify(item)
      }
    };
    this.router.navigate(['detalle-obra'], navigationExtras);
  }

}
