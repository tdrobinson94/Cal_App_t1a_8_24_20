import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserDataService } from '../services/userdata.service';
import { Router, NavigationEnd } from '@angular/router';
import $ from 'jquery';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  firstName = '';
  lastName = '';
  firstInitial = '';
  lastInitial = '';
  showAfterLogin: any;
  deferredPrompt;


  // Gesture Vibration
  gestureVibration = 2;


  constructor(public dataService: UserDataService, private router: Router) {

    this.router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/calendar') {
          this.changeOfRoutes();
        } else if (event.url === '/profile') {
          this.changeOfRoutes();
        } else if (event.url === '/settings') {
          this.changeOfRoutes();
        } else if (event.url === '/test-cal') {
          this.changeOfRoutes();
        }
      }
    });
   }

  ngOnInit(): void {
    // this.bounceUp();
  }

  clickNavButton() {
    // window.navigator.vibrate(this.gestureVibration);
    $('.hamburger').toggleClass('is-active');
    $('.wrapper ul').slideToggle();
  }

  clickLink() {
    // window.navigator.vibrate(this.gestureVibration);
    $('html, body').animate({ scrollTop: 0 }, 500);
    // this.bounceUp();
    if ($(window).width() < 800) {
      $('.hamburger').toggleClass('is-active');
      $('.wrapper ul').slideToggle();
    }
  }

  bounceUp() {
    $('.container').addClass('bounce-up');
    setTimeout(() => {
      $('.container').removeClass('bounce-up');
    }, 1000);
  }

  clickFooterLink() {
    // window.navigator.vibrate(this.gestureVibration);
    // this.bounceUp();
  }

  clickLogo() {
    // window.navigator.vibrate(this.gestureVibration);
    if ($(window).width() < 800) {
      $('.hamburger').removeClass('is-active');
      $('.wrapper ul').slideToggle().hide();
      $('html, body').animate({ scrollTop: 0 }, 500);
    } else {
      $('html, body').animate({ scrollTop: 0 }, 500);
    }
  }

  clickLogout(){
    // window.navigator.vibrate(this.gestureVibration);
    console.log('User has logged out');
    this.clickLink();
    this.dataService.logout();
    this.router.navigate(['/login']);
  }

  changeOfRoutes() {
    this.dataService.getUser()
      .subscribe((response) => {
        const res = Object.values(response);
        this.firstName = (res[1]);
        this.lastName = (res[2]);
        this.firstInitial = this.firstName.substring(0, 1);
        this.lastInitial = this.lastName.substring(0, 1);
      });
  }

  ngOnDestroy(){

  }

}
