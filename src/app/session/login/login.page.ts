import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';
import { Storage } from '@ionic/storage';
import { GlobalFunctionsService } from '../../services/global-functions.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  user: string = "";
  password: string = "";

  constructor(private router: Router,
    private loginService: SessionService,
    private storage: Storage,
    private globFuncService: GlobalFunctionsService) { }

  ngOnInit() {
    this.storage.get('userData').then((val) => {
      if (val != null)
        this.router.navigate(['listado-obras']);
    });
  }

  submit() {
    this.loginService.login(this.user, this.password).subscribe((Response: any) => {
      let data = JSON.parse(Response)[0];
      if (data.Proceso == "OK") {
        if (data.Mensaje = "USUARIO VALIDO") {
          this.globFuncService.showSingleToast('Autenticación exitosa', 'dark', 1000);
          this.storage.set('userData', JSON.stringify(data)).then((val) => {
            this.router.navigate(['listado-obras']);
          });
        }
      }
      else if (data.Proceso == "RESTRICCIÓN") {
        this.globFuncService.showSingleAlert('Error', '', data.Mensaje.toLowerCase(), 'Ok');
      }
      else {
        this.globFuncService.showSingleAlert('Error', '', 'Problema ténico avise a soporte', 'Ok');
      }
    }, error => {
      this.globFuncService.showSingleAlert('Error', '', 'Problema ténico avise a soporte', 'Ok');
    });
  }

}
