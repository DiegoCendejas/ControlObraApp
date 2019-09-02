import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FotosService {

  URL: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  setPictureInfo(objFoto: any) {
    let params = JSON.stringify(objFoto);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.URL + '/fotos/set-foto-info', params, { headers: headers });
  }

  setCloserPictureInfo(objFoto: any) {
    let params = JSON.stringify(objFoto);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.URL + '/fotos/set-foto-cierre-info', params, { headers: headers });
  }

  obtenerTipoFotosCierre(noProyecto: string, idVisita: string) {
    let params = new HttpParams().set('No_Proyecto_Solicitud', noProyecto).set('Visita_Supervision_ID', idVisita);
    return this.http.get(this.URL + '/fotos/get-tipos-fotos-cierre', { params: params });
  }

  uploadPicture(picture: any, noProyecto: string) {
    return this.http.post(this.URL + '/uploadPicture?No_Proyecto_Solicitud=' + noProyecto, picture);
  }

}
