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
    $('.video').get(0).pause();
    $('html, body').animate({ scrollTop: 0 }, 600);
    $('.home-buttons').removeClass('hide');
  }

  scrolltoVideo() {
    $('.home-buttons').addClass('hide');
    $('html, body').animate({ scrollTop: $(window).height() }, 500);
    setTimeout(() => {
      $('.video').get(0).play();
    }, 600);
  }

  onSwipeDown(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        console.log('Swipe Down');
        $('.video').get(0).pause();
        $('html, body').animate({ scrollTop: 0 }, 600);
        $('.home-buttons').removeClass('hide');
      }
  }

  onSwipeUp(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        console.log('Swipe Up');
        this.scrolltoVideo();
      }
  }

}
