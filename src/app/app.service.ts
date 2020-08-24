import { Injectable, Injector } from '@angular/core';
import { UserDataService } from './services/userdata.service';

@Injectable()
export class AppService {
    constructor(private injector: Injector) { }
    initializeApp(): Promise<any> {
        return new Promise(((resolve, reject) => {
            this.injector.get(UserDataService).isLoggedIn()
                .toPromise()
                .then(res => {
                    resolve();
                });
        }));
    }
}