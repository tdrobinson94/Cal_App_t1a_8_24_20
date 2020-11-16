import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { UserDataService } from '../services/userdata.service';
import { Router } from '@angular/router';
import $ from 'jquery';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
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
  confirmationMessage = false;

  // Gesture Vibration
  gestureVibration = 2;

  constructor(private dataService: UserDataService, private router: Router) { }

  ngOnInit(): void {
    this.loading = true;
    this.dataService.getUser()
      .subscribe((response) => {
        const res = Object.values(response);
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
        const res = Object.values(response);
        const data = Object.values(res[1]);
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

  openConfirmationMessage() {
    this.confirmationMessage = true;
  }

  closeConfirmationMessage() {
    this.confirmationMessage = false;
  }

  deleteMyUser() {
    this.loading = true;
    this.dataService.deleteUser()
      .subscribe((response) => {
        console.log(response);
        this.loading = false;
      });
    this.dataService.logout();
    this.router.navigate(['/signup']);
  }

  clickLogout() {
    window.navigator.vibrate(this.gestureVibration);
    console.log('User has logged out');
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

}
