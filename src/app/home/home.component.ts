import { Component, OnInit } from '@angular/core';
import $ from 'jquery';
import 'hammerjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    $('html, body').animate({ scrollTop: 0 }, 500);
  }

  scrolltoVideo() {
    $('.home-buttons').addClass('hide');
    $('html, body').animate({ scrollTop: $(window).height() }, 500);
    setTimeout(() => {
      $('.video').get(0).play();
    }, 550);
  }

  onSwipeDown(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        console.log('Swipe Down');
        $('.video').get(0).pause();
        $('html, body').animate({ scrollTop: 0 }, 500);
        $('.home-buttons').removeClass('hide');
      }
  }

  onSwipeUp(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        console.log('Swipe Up');
      }
  }

}
