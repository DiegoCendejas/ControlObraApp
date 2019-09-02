import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, ɵHttpInterceptingHandler, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  URL: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  login(user: string, password: string) {
    let params = JSON.stringify({ Usuario: user, Contrasena: password });
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this.http.post(this.URL + '/login', params, { headers: headers });
  }

}
