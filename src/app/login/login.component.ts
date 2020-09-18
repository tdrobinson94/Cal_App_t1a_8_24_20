import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { UserDataService } from '../services/userdata.service';
import { Router } from '@angular/router';
import $ from 'jquery';
import * as moment from 'moment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('')
  });
  userName: string = '';
  loading: boolean = false;
  constructor(private cookieService: CookieService, private dataService: UserDataService, private router: Router) { }

  ngOnInit(): void {
    $('html, body').animate({ scrollTop: 0 }, 500);
  }

  onSubmit() {
    const fiveDaysFromNow = (5);
    this.loading = true;
    this.dataService.loginuser(this.loginForm.value)
      .subscribe((response) => {
        if (response.status === 204) {
          console.log('user is not logged in');
          $('.fail-message-2').addClass('show-fail');
          this.loading = false;
        } else if (response.status === 201) {
          this.loading = false;
          console.log('User has logged in');
          this.cookieService.set('userId', response.body.id, fiveDaysFromNow);
          this.cookieService.set('token', response.body.token, fiveDaysFromNow);
          this.userName = (response.body.username);
          $('.success-message').addClass('show-success');
          this.loginForm.reset();
          setTimeout(() => {
            this.router.navigate(['/calendar']);
          }, 3000);
        } else {
          console.log('user is not logged in');
          $('.fail-message').addClass('show-fail');
          this.loading = false;

          setTimeout(() => {
            $('.fail-message').removeClass('show-fail');
          }, 700);
        }
      });
  }

  closePopup() {
    $('.success-message').removeClass('show-success');
    $('.fail-message').removeClass('show-fail');
    $('.fail-message-2').removeClass('show-fail');
  }

  clickLink() {
    $('html, body').animate({ scrollTop: 0 }, 500);
  }

}
