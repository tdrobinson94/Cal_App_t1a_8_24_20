import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-test-calendar',
  templateUrl: './test-calendar.component.html',
  styleUrls: ['./test-calendar.component.scss']
})
export class TestCalendarComponent implements OnInit, AfterViewInit {

  constructor() {
  }

  animating = false;
  slideUp = false;

  ngOnInit(): void {
    setTimeout(() => {
      this.animating = true;
    }, 1000);

    setTimeout(() => {
      this.slideUp = true;
    }, 2000);
  }

  ngAfterViewInit(): void {

  }

  containerClick(): void {
    this.animating = false;
    this.slideUp = false;

    this.ngOnInit();
  }

}
