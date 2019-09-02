import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ObraService {

  URL: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getListaObras(userID: string, puestoID: string) {
    let params = new HttpParams().set('Id_Usuario', userID).set('Id_Puesto', puestoID);
    return this.http.get(this.URL + '/obras/listado-obras', { params: params });
  }

  setVisita(noProyecto: string, idUsuario: string, esInicio: boolean) {
    let params = JSON.stringify({ No_Proyecto_Solicitud: noProyecto, Usuario_ID: idUsuario });
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.URL + '/obras/' + ((esInicio) ? 'iniciar-visita' : 'terminar-visita'), params, { headers: headers });
  }

}
