import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EventDataService } from '../services/eventdata.service';
import { MONTHS } from '../calendar/months.constant';
import $ from 'jquery';
import _ from 'lodash';
import * as moment from 'moment';
import 'hammerjs';

@Component({
  selector: 'app-test-calendar',
  templateUrl: './test-calendar.component.html',
  styleUrls: ['./test-calendar.component.scss']
})
export class TestCalendarComponent implements OnInit, AfterViewInit {

  constructor(private dataService: EventDataService) { 
    this.getEvents();
  }

  // Date variables
  clock = new Date();
  currentMonth = this.clock.getMonth();
  currentMonthCheck = this.currentMonth + 1;
  currentYear = this.clock.getFullYear();
  currentYearCheck = this.currentYear;
  currentDay = this.clock.getDate();
  currentDayofWeek = this.clock.getDay();
  isCurrentWeekday = false;
  month: any = [];
  selectedMonth: any;
  prevMonth: any;
  nextMonth: any;
  firstDay = 1;
  lastDay: any;
  currentDayBool = false;

  singleMonthEvents = [];
  getEachMonthDays: any;
  eachDayEvents: any;

  weekDays: any = [];
  weekDayAbbrv: any = [
    { name: 'Sun', num: 0 }, { name: 'Mon', num: 1 }, { name: 'Tue', num: 2 },
    { name: 'Wed', num: 3 }, { name: 'Thu', num: 4 }, { name: 'Fri', num: 5},
    { name: 'Sat', num: 6}
  ];

  monthSelectorOptions: any = [];
  yearSelectorOptions: any = [];

  getAllEvents = [];

  ngOnInit(): void {
    this.createNavBar();
  }

  ngAfterViewInit() {
    this.createCalendarGrid();
  }

  createNavBar() {
    let i;
    // Create the options for the month selector in control bar
    for (i = 0; i < MONTHS.length; i++) {
      const months = MONTHS[i];

      this.monthSelectorOptions.push(months);
    }

    // Create the options for the year selector in control bar
    for (i = 0; i <= 10; i++) {
      const yearStart = this.currentYear - 5;

      this.yearSelectorOptions.push(yearStart + i);
    }

    // Create each weekday title in the control bar
    for (i = 0; i < this.weekDayAbbrv.length; i++) {
      if (this.weekDayAbbrv[i].num === this.currentDayofWeek) {
        // console.log('This is the weekday: ' + this.weekDayAbbrv[i].num);
      }
    }
  }

  createCalendarGrid() {
    MONTHS[1].days = Number($('#year').val()) % 4 == 0 ? 29 : 28;
    let selectedMonth = $(document).find('#month').val();
    let selectedYear = $(document).find('#year').val();
    const startOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const monthDays = MONTHS[selectedMonth].days;
    let nextMonthDayCount = 0;
    let prevMonthDayCount = 0;
    let findPrevMonthDays = Number(selectedMonth) - 1;
    this.selectedMonth = Number(selectedMonth) + 1;
    this.prevMonth = findPrevMonthDays + 1;
    this.nextMonth = this.selectedMonth + 1;

    if (findPrevMonthDays === 0) {
      findPrevMonthDays = 11;
    }

    if (startOfMonth === 0) {
      nextMonthDayCount = (42 - monthDays);
      prevMonthDayCount = 0;
    } else {
      nextMonthDayCount = (42 - monthDays - startOfMonth)
      prevMonthDayCount = (42 - (monthDays + nextMonthDayCount));
    }

    for (var i:any = 1; i <= prevMonthDayCount + monthDays + nextMonthDayCount; i++) {
      if (i < 10) {
        i = '0' + i;
        this.month.push({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i, 'YYYY/MM/DD'), 
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('Y')
        });
      } else if (i >= 10 && i <= monthDays) {
        this.month.push({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i, 'YYYY/MM/DD'), 
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('Y')
        });
      } else if (i > monthDays && i <= (monthDays + nextMonthDayCount)) {
        this.month.push({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + monthDays, 'YYYY/MM/DD').add((i - monthDays), 'days'),
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + (i - monthDays)).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 2) + '-' + (i - monthDays)).format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 2) + '-' + (i - monthDays)).format('Y')
        });
      } 

      if (i === monthDays) {
        this.lastDay = monthDays;
      }
    }

    for (var i:any = 1; i <= prevMonthDayCount; i++) {
      if (prevMonthDayCount > 0) {
        this.month.unshift({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + 1).subtract((i), 'days').format().substring(0, 10), 
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + 1).subtract((i), 'days').format().substring(8, 10),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + 1).subtract((1), 'days').format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + 1).subtract((1), 'days').format('Y')
        });
      }
    }
    // console.log(this.month);
  }

  changeCalSelectors() {
    this.month = [];
    this.createCalendarGrid();

    $('.opened-background').hide();
  }

  // Calendar Navigation
  prevClick() {
    let year = $(document).find('#year');
    let month = $(document).find('#month');
    if (year.val() < (this.currentYear - 5)) {
      year.val(this.currentYear - 5).change();
      month.val(0).change();
    } else {
      if (month.val() == null || month.val() == 0) {
        month.val(11).change();
        year.val(Number(year.val()) - 1).change();
      } else {
        month.val(Number(month.val()) - 1).change();
      }
    }
    this.changeCalSelectors();
  }

  currentClick() {
    let year = $(document).find('#year');
    let month = $(document).find('#month');
    // if Current month is in view just update to current day, else Change the month to current
    if (Number(month.val()) === this.currentMonth && Number(year.val()) === this.currentYear) {
      if (!$('.day-box').hasClass('day-opened')) {
        $('.day-box').removeClass('selected-day');
        $('.current-day').addClass('selected-day');
      } else {
        $('.day-box').removeClass('selected-day day-opened');
        $('.current-day').addClass('selected-day day-opened');
      }
    } else {
      month.val(this.currentMonth).change();
      year.val(this.currentYear).change();

      this.changeCalSelectors();
    }
  }

  nextClick() {
    let year = $(document).find('#year');
    let month = $(document).find('#month');
    if (year.val() > (this.currentYear + 5) && month.val() == 11) {
      year.val(this.currentYear + 5).change();
      month.val(11).change();
    } else {
      if (month.val() == null || month.val() == 11) {
        month.val(0).change();
        year.val(Number(year.val()) + 1).change();
      } else {
        month.val(Number(month.val()) + 1).change();
      }
    }

    this.changeCalSelectors();
  }


  // Calendar Gestures
  selectDay(e) {
    if (!$(e.currentTarget).hasClass('selected-day') && !$(e.currentTarget).hasClass('day-opened')) {
      $('.day-box').removeClass('selected-day day-opened');
      $(e.currentTarget).addClass('selected-day');
    } else if ($(e.currentTarget).hasClass('selected-day')) {
      $('.opened-background').show();
      $(e.currentTarget).addClass('day-opened');
    }
  }

  closeDay() {
    $('.opened-background').hide();
    $('.day-box').removeClass('day-opened');
  }






  //Handling events
  getEvents() {
    console.log('Get events task started');

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker('../calendar/calendar.worker', { type: 'module' });

      this.dataService.getEvents()
      .subscribe((response) => {
          worker.postMessage(response);
        });

      worker.onmessage = ({ data }) => {
        this.getAllEvents = JSON.parse(data);
        console.log(this.getAllEvents);
        this.filterEvents();
        console.log('Get events task finished.');
      }
    } else {
      // Web workers are not supported in this environment.
      this.dataService.getEvents()
      .subscribe((response) => {
        let i;
        let eventlist = [];
        for (i = 0; i < response.length; i++) {
          eventlist[i] = {
            eventid: response[i].id.toString(),
            eventtitle: response[i].title,
            eventstart_date: response[i].start_date.substring(0, 10),
            eventend_date: response[i].end_date.substring(0, 10),
            eventdesc: response[i].description,
            eventlocation: response[i].location,
            eventfrequency: response[i].frequency,
            eventstart_time: moment(response[i].start_time, 'HH:mm:ss').format('h:mm A'),
            eventend_time: moment(response[i].end_time, 'HH:mm:ss').format('h:mm A'),
            eventcreatedAt: moment(response[i].created_at).format(),
            itemtype: response[i].item_type.toString()
          };
        }
        this.getAllEvents = eventlist;
        console.log(this.getAllEvents);
        console.log('Get events task finished.');
      });
    }
  }

  filterEvents() {
    console.log('Filter events task started.');
    let prevDays = $('.prev-month-days').length;
    let nextDays = $('.next-month-days').length;
    const lastDayBox = $('#year').val() + '-' + this.selectedMonth + '-' + $('.last-day-box').find('.number').html();
    const firstDayBox = $('#year').val() + '-' + this.selectedMonth + '-' + $('.first-day-box').find('.number').html();

    prevDays = prevDays + 1;
    nextDays = nextDays + 1;

    const lastDay = moment(lastDayBox).add(nextDays, 'days');
    const firstDay = moment(firstDayBox).subtract(prevDays, 'days');

    this.singleMonthEvents =  this.getAllEvents.filter(event => {
      return moment(event.eventstart_date).isBefore(lastDay) && moment(event.eventstart_date).isAfter(firstDay); 
    })
    console.log(this.singleMonthEvents);
    console.log('Filter events task finsihed.');
  }

  // showEvents() {
  //   let dayIndex;
  //   let monthEventsArray = [];
  //   const weeks = $(document).find('.weeks').children();
  //   console.log('Show events task started');
  //   setTimeout(() => {
  //     if (this.singleMonthEvents !== undefined) {
  //       // console.log(this.singleMonthEvents)
  //       for (var i = 0; i <= this.getEachMonthDays.length; i++) {
  //         monthEventsArray.push(this.singleMonthEvents.filter(event => {
  //           return this.getEachMonthDays[i] === event.eventstart_date;
  //         }))
  //       }
  //       console.log(monthEventsArray);
  //       this.eachDayEvents = monthEventsArray;
  //     } 
  //   }, 1);
  // }

}
