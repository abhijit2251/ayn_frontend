import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})


export class AuthenticationService {
  baseUrl = 'http://localhost:3000/api/'

  constructor(public httpClient: HttpClient) { }

  login(username: string, password: string) {
    return this.httpClient.post(this.baseUrl + 'user/login', { username, password })
  }

  uploadImage(formData: any) {
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    return this.httpClient.post(this.baseUrl + 'image/img', formData)
    // this.httpClient.post(this.baseUrl + 'image/img', formData).pipe(map(res => {
    //   return res;
    // }))

  }

}