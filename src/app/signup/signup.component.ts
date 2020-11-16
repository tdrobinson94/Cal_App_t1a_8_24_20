import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { UserDataService } from '../services/userdata.service';
import { Router } from '@angular/router';
import $ from 'jquery';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  signupForm = new FormGroup({
    firstname: new FormControl(''),
    lastname: new FormControl(''),
    username: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('')
  });
  loading = false;
  constructor(private dataService: UserDataService, private router: Router) { }

  ngOnInit(): void {
    $('html, body').animate({ scrollTop: 0 }, 500);
  }

  onSubmit() {
    this.loading = true;
    this.dataService.signupuser(this.signupForm.value)
      .subscribe((response) => {
        if (response.status === 204) {
          console.log('user is not logged in');
          $('.fail-message').addClass('show-fail');
          this.loading = false;
        } else if (response.status === 201) {
          $('.signup-form').animate({ scrollTop: 0 }, 500);
          $('.success-message').addClass('show-success');
          this.loading = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          console.log('user is not logged in');
          $('.fail-message').addClass('show-fail');
          this.loading = false;
        }
        this.loading = false;
      });
  }

  closePopup() {
    $('.success-message').removeClass('show-success');
    $('.fail-message').removeClass('show-fail');
  }

  hide() {
    this.loading = false;
  }

}
