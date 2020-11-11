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





  //Forms
   // Delete event form
   deleteItemForm = new FormGroup({
    id: new FormControl(''),
  });


  // Add event form
  addItemForm = new FormGroup({
    user_id: new FormControl(''),
    group_id: new FormControl(''),
    item_type: new FormControl(''),
    frequency: new FormControl(''),
    title: new FormControl(''),
    description: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    start_time: new FormControl(''),
    end_time: new FormControl(''),
    all_day: new FormControl(''),
    location: new FormControl(''),
  });

  // Update event form
  updateItemForm = new FormGroup({
    user_id: new FormControl(''),
    group_id: new FormControl(''),
    id: new FormControl(''),
    frequency: new FormControl(''),
    title: new FormControl(''),
    description: new FormControl(''),
    start_date: new FormControl(''),
    end_date: new FormControl(''),
    start_time: new FormControl(''),
    end_time: new FormControl(''),
    all_day: new FormControl(''),
    location: new FormControl(''),
  });
  allDay = false;

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
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format().substring(0, 10), 
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('Y')
        });
      } else if (i >= 10 && i <= monthDays) {
        this.month.push({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format().substring(0, 10), 
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format('Y')
        });
      } else if (i > monthDays && i <= (monthDays + nextMonthDayCount)) {
        this.month.push({
          "date": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + monthDays).add((i - monthDays), 'days').format().substring(0, 10),
          "day": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + (i - monthDays)).format('D'),
          "month": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + (i - monthDays)).add((1), 'month').format('M'),
          "year": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + (i - monthDays)).add((1), 'month').format('Y')
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
    $('.add-item-form').removeClass('show-form');
    $('.event').removeClass('selected');
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
    this.closeEventUpdateForm();
  }


  selectEvent(e) {
    const day = $('.selected-day .transactions').attr('date');
    $('.event').removeClass('selected');
    $('.add-item-button, .add-item-container').hide();
    $('.prev-day, .next-day').addClass('hide');
    $('.number').addClass('event-opened');
    console.log('event clicked');
    setTimeout(() => {
      if ($(e.target).hasClass('event')){
        $(e.target).addClass('selected');
      } else if ($(e.target).parent().hasClass('event')) {
        $(e.target).parent().addClass('selected');
      } else {
        $(e.target).parent().parent().addClass('selected');
      }
    }, 20)


    setTimeout(() => {
      $('.update-event-form').addClass('show-update-form').removeClass('closed');
    }, 200);
    $('.update-event-form').animate({ scrollTop: 0 }, 300);

    // Define variables by finding the html of the 1st child element an reducing it to AM or PM, just hours, and just minutes
    const timeofday = e.currentTarget.childNodes[4].children[0].innerHTML.trim().split(' ')[1];
    let eHours: any = Number(e.currentTarget.childNodes[4].children[0].innerHTML.trim().split(':')[0]);
    const eMinutes: any = e.currentTarget.childNodes[4].children[0].innerHTML.trim().split(':')[1].substring(0, 2);

    // This is a repeat of the above just for creating the end date, except this time we find the 2nd child element
    const endDay = e.currentTarget.childNodes[5].innerHTML.trim();
    const timeofday2 = e.currentTarget.childNodes[4].children[1].innerHTML.trim().split(' ')[1];
    let eEndTimeHours: any = Number(e.currentTarget.childNodes[4].children[1].innerHTML.trim().split(':')[0]);
    const eEndTimeMinutes = e.currentTarget.childNodes[4].children[1].innerHTML.trim().split(':')[1].substring(0, 2);

    // Define how to display Hours, this checks for AM/PM on a 24hr format
    if (timeofday === 'PM' && eHours <= 10) {
      eHours = 24 - (12 - eHours);
    } else if (timeofday === 'PM' && eHours > 10) {
      if (eHours === 12) {
        eHours = eHours;
      } else {
        eHours = eHours + 12;
      }
    } else if (timeofday === 'AM' && eHours < 10) {
      eHours = '0' + eHours;
    } else if (timeofday === 'AM' && eHours === 12) {
      eHours = '00';
    }

    // Repeat of above but for the end time
    if (timeofday2 === 'PM' && eEndTimeHours <= 10) {
      eEndTimeHours = 24 - (12 - eEndTimeHours);
    } else if (timeofday2 === 'PM' && eEndTimeHours > 10) {
      if (eEndTimeHours === 12) {
        eEndTimeHours = eEndTimeHours;
      } else {
        eEndTimeHours = eEndTimeHours + 12;
      }
    } else if (timeofday2 === 'AM' && eEndTimeHours < 10) {
      eEndTimeHours = '0' + eEndTimeHours;
    }

    // Set the time to variables and concat the values to a proper time input format
    const eCurrentTime = eHours + ':' + eMinutes;
    const eEndTime = eEndTimeHours + ':' + eEndTimeMinutes;
    const userID = sessionStorage.getItem('userId');

    if (e.currentTarget.childNodes[3].innerHTML.trim() == 2) {
      $('.date-input-end-update').hide();
    } else {
      $('.date-input-end-update').show();
    }

    // Update the form with the time values defined above

    if (eCurrentTime === '00:00' && eEndTime === '23:59') {
      this.allDay = true;
      this.updateItemForm = new FormGroup({
        user_id: new FormControl(userID),
        group_id: new FormControl(''),
        id: new FormControl(e.currentTarget.childNodes[6].value),
        item_type: new FormControl(Number(e.currentTarget.childNodes[7].innerHTML.trim())),
        frequency: new FormControl(Number(e.currentTarget.childNodes[3].innerHTML.trim())),
        title: new FormControl(e.currentTarget.childNodes[0].innerHTML.trim()),
        description: new FormControl(e.currentTarget.childNodes[1].innerHTML.trim()),
        start_date: new FormControl(day),
        end_date: new FormControl(endDay),
        start_time: new FormControl(eCurrentTime),
        end_time: new FormControl(eEndTime),
        all_day: new FormControl(true),
        location: new FormControl(e.currentTarget.childNodes[2].innerHTML.trim()),
      });
    } else {
      this.allDay = false;
      this.updateItemForm = new FormGroup({
        user_id: new FormControl(userID),
        group_id: new FormControl(''),
        id: new FormControl(e.currentTarget.childNodes[6].value),
        item_type: new FormControl(Number(e.currentTarget.childNodes[7].innerHTML.trim())),
        frequency: new FormControl(Number(e.currentTarget.childNodes[3].innerHTML.trim())),
        title: new FormControl(e.currentTarget.childNodes[0].innerHTML.trim()),
        description: new FormControl(e.currentTarget.childNodes[1].innerHTML.trim()),
        start_date: new FormControl(day),
        end_date: new FormControl(endDay),
        start_time: new FormControl(eCurrentTime),
        end_time: new FormControl(eEndTime),
        all_day: new FormControl(false),
        location: new FormControl(e.currentTarget.childNodes[2].innerHTML.trim()),
      });
    }
    console.log(this.updateItemForm.value);
  }

  closeEventUpdateForm() {
    // window.navigator.vibrate(this.gestureVibration);
    $('.num-box').removeClass('event-opened');
    $('.update-event-form').addClass('closed');
    // Delay for the Close animation
    setTimeout(() => {
      $('.update-event-form').removeClass('show-update-form');
      this.updateItemForm.reset();
    }, 100);
    $('.add-item-button, .add-item-container').show();
    $('.prev-day, .next-day').removeClass('hide');
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
        // console.log(this.getAllEvents);
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
        // console.log(this.getAllEvents);
        console.log('Get events task finished.');
      });
    }
  }

}
