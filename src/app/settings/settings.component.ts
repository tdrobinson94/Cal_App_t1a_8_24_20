import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { UserDataService } from '../services/userdata.service';
import { Router } from '@angular/router';
import $ from 'jquery';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
    updateForm = new FormGroup({
        firstname: new FormControl(''),
        lastname: new FormControl(''),
        username: new FormControl(''),
        password: new FormControl('')
    });
    firstName = '';
    lastName = '';
    userName = '';
    Email = '';
    loading = false;

    constructor(private dataService: UserDataService, private router: Router) { }

    ngOnInit(): void {
        this.loading = true;
        $('html, body').animate({ scrollTop: 0 }, 500);
        this.dataService.getUser()
            .subscribe((response) => {
                let res = Object.values(response);
                this.userName = (res[3]);
                this.firstName = (res[1]);
                this.lastName = (res[2]);
                this.Email = (res[4]);
                this.updateForm = new FormGroup({
                    firstname: new FormControl(res[1]),
                    lastname: new FormControl(res[2]),
                    username: new FormControl(res[3]),
                    password: new FormControl('')
                });
                setTimeout(() => {
                    this.loading = false;
                }, 2000);
            });
    }

    updatedMyUser() {
        this.loading = true;
        this.dataService.updatedUser(this.updateForm.value)
            .subscribe((response) => {
                let res = Object.values(response);
                let data = Object.values(res[1]);
                console.log(data);
                this.updateForm = new FormGroup({
                    firstname: new FormControl(data[1]),
                    lastname: new FormControl(data[2]),
                    username: new FormControl(data[3]),
                    password: new FormControl('')
                });
                this.loading = false;
            });
    }

    showUpdateForm() {
        $('.update-form').slideToggle();
    }

    deleteMyUser() {
        this.loading = true;
        this.dataService.deleteUser()
            .subscribe((response) => {
                console.log(response);
                this.loading = false;
            });
        this.dataService.logout();
        setTimeout(() => {
            this.router.navigate(['/signup']);
        }, 3000);
    }

}