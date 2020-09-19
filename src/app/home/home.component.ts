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
    $('html, body').animate({ scrollTop: 0 }, 400);
    $('.home-buttons').removeClass('hide');
    $('.video').get(0).muted = true;
  }

  scrolltoVideo() {
    $('.home-buttons').addClass('hide');
    $('html, body').animate({ scrollTop: $(window).height() }, 400);
    setTimeout(() => {
      $('.video').get(0).play();
    }, 1400);
  }

  onSwipeDown(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        $('.video').get(0).pause();
        $('html, body').animate({ scrollTop: 0 }, 400);
        $('.home-buttons').removeClass('hide');
      }
  }

  onSwipeUp(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
        this.scrolltoVideo();
      }
  }

  onMouseWheel(e) {
    if (e.deltaY < 0 && $(window).scrollTop() > ($(window).height() - 54)) {
      $('html, body').animate({ scrollTop: 0 }, 400);
      $('.video').get(0).pause();
    } else if (e.deltaY > 0 && $(window).scrollTop() < 0) {
      $('html, body').animate({ scrollTop: $(window).height() }, 400);
      setTimeout(() => {
        $('.video').get(0).play();
      }, 1400);
    }

    if ($(window).scrollTop() <= 10) {
      $('.home-buttons').removeClass('hide');
    } else {
      $('.home-buttons').addClass('hide');
    }
  }

}
