import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class UserDataService {
    apiUrl = 'https://react-calendar-backend-api.herokuapp.com';
    loggedInStatus = false;

    constructor(private http: HttpClient) { }

    getToken() {
        const cookieValue = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const config = {
            headers: new HttpHeaders({ 'Authorization': 'Bearer ' + token })
        };

        return config;
    }

    signupuser(userData): Observable<any> {
        return this.http.post(this.apiUrl + '/signup', userData, { observe: 'response' });
    }

    loginuser(userData): Observable<any> {
        this.loggedInStatus = true;
        return this.http.post(this.apiUrl + '/login', userData, {observe: 'response'});
    }

    loggedIn() {
        return localStorage.getItem('token') ? true : false;
    }

    logout() {
        localStorage.clear();
    }

    getUser() {
        return this.http.get(this.apiUrl + '/user', this.getToken());
    }

    updatedUser(userData) {
        return this.http.patch(this.apiUrl + '/updateuser', userData, this.getToken());
    }

    deleteUser() {
        return this.http.delete(this.apiUrl + '/deleteuser', this.getToken());
    }

}