import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EventDataService } from '../services/eventdata.service';
import { MONTHS } from './months.constant';
import $ from 'jquery';
import _ from 'lodash';
import * as moment from 'moment';
import 'hammerjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {

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
  loading = true;
  openform = false;
  hideFormButton = false;

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

  //Handling events
  getEvents() {
    console.log('Get events task started');

    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker('./calendar.worker', { type: 'module' });

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
            eventstart_date: response[i].start_date.substring(0, 10).replace(/-/g, "/"),
            eventend_date: response[i].end_date.substring(0, 10).replace(/-/g, "/"),
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

  submitEvent() {
    console.log(this.addItemForm.value);
    this.dataService.createEvent(this.addItemForm.value)
      .subscribe((response) => {
        this.addItemForm.reset();
        this.closeForm();
        this.getEvents();
        this.mobileHideElements();
      });
  }

  updateEvent() {
    console.log(this.updateItemForm.value);
    this.dataService.updatedEvent(this.updateItemForm.value)
      .subscribe((response) => {
        this.closeEventUpdateForm();
        this.getEvents();
        this.mobileHideElements();
      });
  }

  deleteEvent(e) {
    // On click set the value of the form with the value of the button
    this.updateItemForm = new FormGroup({
      user_id: new FormControl(''),
      group_id: new FormControl(''),
      id: new FormControl(this.updateItemForm.value.id),
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

    this.closeForm();
    // Delete the event
    this.dataService.deleteEvent(this.updateItemForm.value)
      .subscribe((response) => {
        this.closeEventUpdateForm();
        this.getEvents();
        this.mobileHideElements();
      });
  }

  ngAfterViewInit() {
    this.createCalendarGrid();
    this.mobileHideElements();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
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
          "date": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format().substring(0, 10).replace(/-/g, "/"),
          "date1": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format().substring(0, 10), 
          "day": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('D'),
          "month": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('M'),
          "year": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('Y')
        });
      } else if (i >= 10 && i <= monthDays) {
        this.month.push({
          "date": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format().substring(0, 10).replace(/-/g, "/"), 
          "date1": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + i).format().substring(0, 10),
          "day": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('D'),
          "month": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('M'),
          "year": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + i).format('Y')
        });
      } else if (i > monthDays && i <= (monthDays + nextMonthDayCount)) {
        this.month.push({
          "date": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + monthDays).add((i - monthDays), 'days').format().substring(0, 10).replace(/-/g, "/"),
          "date1": moment(selectedYear + '-' + (Number(selectedMonth) + 1) + '-' + monthDays).add((i - monthDays), 'days').format().substring(0, 10),
          "day": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + (i - monthDays)).format('D'),
          "month": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + (i - monthDays)).add((1), 'month').format('M'),
          "year": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + (i - monthDays)).add((1), 'month').format('Y')
        });
      } 

      if (i === monthDays) {
        this.lastDay = monthDays;
      }
    }

    for (var i:any = 1; i <= prevMonthDayCount; i++) {
      if (prevMonthDayCount > 0) {
        this.month.unshift({
          "date": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + 1).subtract((i), 'days').format().substring(0, 10).replace(/-/g, "/"), 
          "day": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + 1).subtract((i), 'days').format().substring(8, 10),
          "month": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + 1).subtract((1), 'days').format('M'),
          "year": moment(selectedYear + '/' + (Number(selectedMonth) + 1) + '/' + 1).subtract((1), 'days').format('Y')
        });
      }
    }
    // console.log(this.month);
  }

  changeCalSelectors() {
    this.month = [];
    this.createCalendarGrid();
    this.loading = false;
    $('.opened-background').hide();
    setTimeout(() => {
      this.mobileHideElements();
      if (!$('.day-box').hasClass('day-opened')) {
        $('.add-item-button, .add-item-container').removeClass('moved');
      }
    }, 50)
  }

  // Calendar Navigation
  prevClick() {
    this.loading = true;
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
    $('.calendar-container').addClass('cal-swipe-left');
    setTimeout(() => {
      $('.calendar-container').removeClass('cal-swipe-left cal-swipe-right');
      this.changeCalSelectors();
    }, 300);
  }

  currentClick() {
    let year = $(document).find('#year');
    let month = $(document).find('#month');
    $('.add-item-button, .add-item-container').removeClass('moved');
    // if Current month is in view just update to current day, else Change the month to current
    if (Number(month.val()) === this.currentMonth && Number(year.val()) === this.currentYear) {
      if (!$('.day-box').hasClass('day-opened')) {
        $('.day-box').removeClass('selected-day');
        $('.current-day').addClass('selected-day');
        $('.add-item-button, .add-item-container').removeClass('moved');
      } else {
        $('.add-item-button, .add-item-container').addClass('moved');
        $('.day-box').removeClass('selected-day day-opened');
        $('.current-day').addClass('selected-day day-opened');
      }
    } else {
      this.loading = true;
      month.val(this.currentMonth).change();
      year.val(this.currentYear).change();

      setTimeout(() => {
        this.changeCalSelectors();
      },)
    }
  }

  nextClick() {
    this.loading = true
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

    $('.calendar-container').addClass('cal-swipe-right');
    setTimeout(() => {
      $('.calendar-container').removeClass('cal-swipe-left cal-swipe-right');
      this.changeCalSelectors();
    }, 300);
  }


  // Calendar Gestures
  selectDay(e) {
    this.mobileHideElements()

    $('.add-item-form').removeClass('show-form');
    $('.event').removeClass('selected');
    if ($(e.target).hasClass('prev-day-icon')) {
      $('.update-event-form').removeClass('show-update-form');
      //show popup background because we are in day view
      $('.opened-background').show();
      if (!$(e.currentTarget).prev().hasClass('disabled')) {
        this.removeClassesForDayBox();
        if ($(e.currentTarget).hasClass('first-day-box')) {
          this.swipePrevMonthAnimationOne();
        } else if ($(e.currentTarget).prev().length === 0) {
          $(e.currentTarget).parent().prev().children().eq(6).addClass('selected-day day-opened swipe-right');
          this.swipePrevEndOfRow();
        } else {
          $(e.currentTarget).prev().addClass('selected-day day-opened swipe-right');
          this.swipePrevEndOfRow();
        }
      } else {
        this.swipePrevMonthAnimationOne();
      }
      this.enableDefaultScrolling();

    } else if ($(e.target).hasClass('next-day-icon')) {
      $('.update-event-form').removeClass('show-update-form');
      //show popup background because we are in day view
      $('.opened-background').show();
      // window.navigator.vibrate(this.gestureVibration);
      if (!$(e.currentTarget).next().hasClass('disabled')) {
        this.removeClassesForDayBox();
        if ($(e.currentTarget).hasClass('last-day-box')) {
          this.swipeNextMonthAnimationOne();
        } else if ($(e.currentTarget).next().length === 0) {
          $(e.currentTarget).parent().next().children().eq(0).addClass('selected-day day-opened swipe-left');
          this.swipeNextEndOfRow();
        } else {
          $(e.currentTarget).next().addClass('selected-day day-opened swipe-left');
          this.swipeNextEndOfRow();
        }

      } else {
        this.swipeNextMonthAnimationOne();
      }
      this.enableDefaultScrolling();

    } else if ($(e.target).hasClass('close-day-icon')) {
      this.closeDay();
    } else if (!$(e.currentTarget).hasClass('selected-day') && !$(e.currentTarget).hasClass('day-opened')) {
      $('.day-box').removeClass('selected-day day-opened');
      $(e.currentTarget).addClass('selected-day');
    } else if ($(e.currentTarget).hasClass('selected-day')) {
      $('.opened-background').show();
      $(e.currentTarget).addClass('day-opened');
      $('.add-item-button, .add-item-container').addClass('moved');
      this.enableDefaultScrolling();
    }
  }

  closeDay() {
    $('.opened-background').hide();
    $('.day-box').removeClass('day-opened swipe-left swipe-right');
    $('.add-item-button, .add-item-container').removeClass('moved');
    $('.transactions').removeClass('normal-scrolling');
    setTimeout(() => {
      $('.transactions').animate({ scrollTop: 0 }, 200);
    }, 300);
    this.closeForm();
    this.closeEventUpdateForm();
  }


  selectEvent(e) {
    if ($('.day-box').hasClass('day-opened')) {
      const day = $('.selected-day .transactions').attr('date1');
      $('.event').removeClass('selected');
      $('.add-item-button, .add-item-container').hide();
      $('.prev-day, .next-day').addClass('hide');
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
        $('.transactions, .close-day').addClass('update-form-opened')
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
          end_date: new FormControl(day),
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
          end_date: new FormControl(day),
          start_time: new FormControl(eCurrentTime),
          end_time: new FormControl(eEndTime),
          all_day: new FormControl(false),
          location: new FormControl(e.currentTarget.childNodes[2].innerHTML.trim()),
        });
      }
      console.log(this.updateItemForm.value);
    }
    
  }


  onSwipeLeft(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.event').removeClass('selected');
      $('.day-opened').removeClass('bounce-left');
      if (!$('.day-box').hasClass('day-opened')) {
        if ($(e.target).parent().parent().parent().hasClass('show-form') || $(e.target).parent().parent().parent().parent().hasClass('show-form')) {
          // Do nothing
          console.log($(e.target));
        } else {
          this.nextClick();
        }
      } 
    }
  }

  swipeDayLeft(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.event').removeClass('selected');
      $('.day-opened').removeClass('bounce-left');
      if ($('.day-box').hasClass('day-opened')) {
        if ($(e.target).hasClass('transactions')) {
          if (!$(e.target).parent().next().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().hasClass('last-day-box')) {
              this.swipeNextMonthAnimationOne();
            } else if ($(e.target).parent().next().length === 0) {
              $(e.target).parent().parent().next().children().eq(0).addClass('selected-day day-opened swipe-left');
              this.swipeNextEndOfRow();
            } else {
              $(e.target).parent().next().addClass('selected-day day-opened swipe-left');
              this.swipeNextDay();
            }
          } else {
            this.swipeNextMonthAnimationOne();
          }
        } else if ($(e.target).hasClass('event')) {
          if (!$(e.target).parent().parent().next().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().parent().hasClass('last-day-box')) {
              this.removeClassesForDayBox();
            } else if ($(e.target).parent().parent().next().length === 0) {
              $(e.target).parent().parent().parent().next().children().eq(0).addClass('selected-day day-opened swipe-left');
              this.swipeNextEndOfRow();
            } else {
              $(e.target).parent().parent().next().addClass('selected-day day-opened swipe-left');
              this.swipeNextDay();
            }
          } else {
            this.swipeNextMonthAnimationOne();
          }
        } else if ($(e.target).hasClass('event-details')) {
          if (!$(e.target).parent().parent().parent().next().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().parent().parent().hasClass('last-day-box')) {
              this.removeClassesForDayBox();
            } else if ($(e.target).parent().parent().parent().next().length === 0) {
              $(e.target).parent().parent().parent().parent().next().children().eq(0).addClass('selected-day day-opened swipe-left');
              this.swipeNextEndOfRow();
            } else {
              $(e.target).parent().parent().parent().next().addClass('selected-day day-opened swipe-left');
              this.swipeNextDay();
            }
          } else {
            this.swipeNextMonthAnimationOne();
          }
        }
      }
      // this.enableDefaultScrolling();
    }
  }

  onSwipeRight(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.event').removeClass('selected');
      $('.day-opened').removeClass('bounce-right');
      if (!$('.day-box').hasClass('day-opened')) {
        if ($(e.target).parent().parent().parent().hasClass('show-form') || $(e.target).parent().parent().parent().parent().hasClass('show-form')) {
          // Do nothing
          console.log($(e.target));
        } else {
          this.prevClick();
        }
      }
    }
  }

  swipeDayRight(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.event').removeClass('selected');
      $('.day-opened').removeClass('bounce-right');
      if ($('.day-box').hasClass('day-opened')) {
        if ($(e.target).hasClass('transactions')) {
          if (!$(e.target).parent().prev().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().hasClass('first-day-box')) {
              this.swipePrevMonthAnimationOne();
            } else if ($(e.target).parent().prev().length === 0) {
              $(e.target).parent().parent().prev().children().eq(0).addClass('selected-day day-opened swipe-right');
              this.swipePrevEndOfRow();
            } else {
              $(e.target).parent().prev().addClass('selected-day day-opened swipe-right');
              this.swipePrevDay();
            }
          } else {
            this.swipePrevMonthAnimationOne();
          }
        } else if ($(e.target).hasClass('event')) {
          if (!$(e.target).parent().parent().prev().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().parent().hasClass('first-day-box')) {
              this.swipePrevMonthAnimationOne();
            } else if ($(e.target).parent().parent().prev().length === 0) {
              $(e.target).parent().parent().parent().prev().children().eq(0).addClass('selected-day day-opened swipe-right');
              this.swipePrevEndOfRow();
            } else {
              $(e.target).parent().parent().prev().addClass('selected-day day-opened swipe-right');
              this.swipePrevDay();
            }
          } else {
            this.swipePrevMonthAnimationOne();
          }
        } else if ($(e.target).hasClass('event-details')) {
          if (!$(e.target).parent().parent().parent().prev().hasClass('disabled')) {
            this.removeClassesForDayBox();
            if ($(e.target).parent().parent().parent().hasClass('first-day-box')) {
              this.swipePrevMonthAnimationOne();
            } else if ($(e.target).parent().parent().parent().prev().length === 0) {
              $(e.target).parent().parent().parent().parent().prev().children().eq(0).addClass('selected-day day-opened swipe-right');
              this.swipePrevEndOfRow();
            } else {
              $(e.target).parent().parent().parent().prev().addClass('selected-day day-opened swipe-right');
              this.swipePrevDay();
            }
          } else {
            this.swipePrevMonthAnimationOne();
          }
        }
      }
      // this.enableDefaultScrolling();
    }
  }

  swipeDayDown(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.event').removeClass('selected');
      if (!$('.day-box').hasClass('day-opened')) {
        // do nothing 
        this.getEvents();
      }
    }
  }

  closeEventUpdateForm() {
    // window.navigator.vibrate(this.gestureVibration);
    $('.event').removeClass('selected');
    $('.transactions, .close-day').removeClass('update-form-opened')
    $('.update-event-form').addClass('closed');
    // Delay for the Close animation
    setTimeout(() => {
      $('.update-event-form').removeClass('show-update-form');
      this.updateItemForm.reset();
    }, 100);
    $('.add-item-button, .add-item-container').show();
    $('.prev-day, .next-day').removeClass('hide');
  }

  openForm() {
    //show popup background because we are in day view
    $('.opened-background').show();
    $('.add-item-container').animate({ scrollTop: 0 }, 300);
    this.openform = true;
    this.hideFormButton = true;
    $('.form-nav-bar, .add-item-form').addClass('animate-events-one');
    setTimeout(() => {
      $('.form-nav-bar, .add-item-form').addClass('animate-events-two');
      // $('input[name=title]').focus();
    }, 450);

    const day = $('.selected-day .transactions').attr('date1');
    let minutes: any = Number(String(this.clock.getMinutes()).padStart(2, '0'));
    if (minutes < 10) {
      minutes = '0' + minutes;
      minutes.toString();
    }
    let hours: any = Number(String(this.clock.getHours()).padStart(2, '0'));
    if (hours === 24 && minutes > 0) {
      hours = '00';
    } else if (hours < 10) {
      hours = '0' + hours;
      hours.toString();
    }
    let extraHour: any = Number(String(this.clock.getHours() + 1).padStart(2, '0'));
    if (extraHour === 24 && minutes > 0) {
      extraHour = '00';
    } else if (extraHour < 10) {
      extraHour = '0' + extraHour;
      extraHour.toString();
    }
    const currentTime = hours.toString() + ':' + minutes.toString();
    const endTime = (extraHour) + ':' + minutes;

    const userID = sessionStorage.getItem('userId');

    $('.date-input-end').show();
    this.addItemForm = new FormGroup({
      user_id: new FormControl(userID),
      group_id: new FormControl(''),
      item_type: new FormControl(''),
      frequency: new FormControl(''),
      title: new FormControl(''),
      description: new FormControl(''),
      start_date: new FormControl(day),
      end_date: new FormControl(day),
      start_time: new FormControl(currentTime),
      end_time: new FormControl(endTime),
      all_day: new FormControl(false),
      location: new FormControl(''),
    });
  }

  closeForm() {
    if (!$('.day-box').hasClass('day-opened')) {
      $('.opened-background').hide();
    }
    this.addItemForm.reset();
    this.openform = false;
    $('.form-nav-bar, .add-item-form').removeClass('animate-events-one animate-events-two');
    setTimeout(() => {
      this.hideFormButton = false;
    }, 200);
  }


  onStartDateChange(e) {

    this.addItemForm = new FormGroup({
      user_id: new FormControl(this.addItemForm.value.user_id),
      group_id: new FormControl(this.updateItemForm.value.group_id),
      item_type: new FormControl(this.addItemForm.value.item_type),
      frequency: new FormControl(this.addItemForm.value.frequency),
      title: new FormControl(this.addItemForm.value.title),
      description: new FormControl(this.addItemForm.value.description),
      start_date: new FormControl(e.target.value),
      end_date: new FormControl(e.target.value),
      start_time: new FormControl(this.addItemForm.value.start_time),
      end_time: new FormControl(this.addItemForm.value.end_time),
      all_day: new FormControl(this.addItemForm.value.all_day),
      location: new FormControl(this.addItemForm.value.location),
    });

    this.updateItemForm = new FormGroup({
      user_id: new FormControl(this.updateItemForm.value.user_id),
      group_id: new FormControl(this.updateItemForm.value.group_id),
      id: new FormControl(this.updateItemForm.value.id),
      item_type: new FormControl(this.updateItemForm.value.item_type),
      frequency: new FormControl(this.updateItemForm.value.frequency),
      title: new FormControl(this.updateItemForm.value.title),
      description: new FormControl(this.updateItemForm.value.description),
      start_date: new FormControl(e.target.value),
      end_date: new FormControl(e.target.value),
      start_time: new FormControl(this.updateItemForm.value.start_time),
      end_time: new FormControl(this.updateItemForm.value.end_time),
      all_day: new FormControl(this.updateItemForm.value.all_day),
      location: new FormControl(this.updateItemForm.value.location),
    });
  }

  onStartTimeChange(e) {
    let minutes: any = Number(String(e.target.value).slice(-2));
    if (minutes < 10) {
      minutes = '0' + minutes;
      minutes.toString();
    }

    let hours: any = Number(String(e.target.value).substring(0, 2)) + 1;
    if (hours === 24 && minutes > 0) {
      hours = '00';
    } else if (hours < 10) {
      hours = '0' + hours;
      hours.toString();
    }

    const endTime = hours + ':' + minutes;

    this.addItemForm = new FormGroup({
        user_id: new FormControl(this.addItemForm.value.user_id),
        group_id: new FormControl(this.updateItemForm.value.group_id),
        item_type: new FormControl(this.addItemForm.value.item_type),
        frequency: new FormControl(this.addItemForm.value.frequency),
        title: new FormControl(this.addItemForm.value.title),
        description: new FormControl(this.addItemForm.value.description),
        start_date: new FormControl(this.addItemForm.value.start_date),
        end_date: new FormControl(this.addItemForm.value.end_date),
        start_time: new FormControl(e.target.value),
        end_time: new FormControl(endTime),
        all_day: new FormControl(this.addItemForm.value.all_day),
        location: new FormControl(this.addItemForm.value.location),
      });

    this.updateItemForm = new FormGroup({
      user_id: new FormControl(this.updateItemForm.value.user_id),
      group_id: new FormControl(this.updateItemForm.value.group_id),
      id: new FormControl(this.updateItemForm.value.id),
      item_type: new FormControl(this.updateItemForm.value.item_type),
      frequency: new FormControl(this.updateItemForm.value.frequency),
      title: new FormControl(this.updateItemForm.value.title),
      description: new FormControl(this.updateItemForm.value.description),
      start_date: new FormControl(this.updateItemForm.value.start_date),
      end_date: new FormControl(this.updateItemForm.value.end_date),
      start_time: new FormControl(e.target.value),
      end_time: new FormControl(endTime),
      all_day: new FormControl(this.updateItemForm.value.all_day),
      location: new FormControl(this.updateItemForm.value.location),
    });
  }

  frequencyChange(e) {
    console.log(this.addItemForm.value.frequency);
    if (this.addItemForm.value.frequency == 2) {
      $('.date-input-end, .date-input-end-update').hide();
      this.addItemForm = new FormGroup({
        user_id: new FormControl(this.addItemForm.value.user_id),
        group_id: new FormControl(''),
        item_type: new FormControl(this.addItemForm.value.item_type),
        frequency: new FormControl(this.addItemForm.value.frequency),
        title: new FormControl(this.addItemForm.value.title),
        description: new FormControl(this.addItemForm.value.description),
        start_date: new FormControl(this.addItemForm.value.start_date),
        end_date: new FormControl(this.addItemForm.value.end_date),
        start_time: new FormControl(this.addItemForm.value.start_time),
        end_time: new FormControl(this.addItemForm.value.end_time),
        all_day: new FormControl(this.addItemForm.value.all_day),
        location: new FormControl(this.addItemForm.value.location),
      });

      this.updateItemForm = new FormGroup({
        user_id: new FormControl(this.updateItemForm.value.user_id),
        group_id: new FormControl(''),
        id: new FormControl(this.updateItemForm.value.id),
        item_type: new FormControl(this.updateItemForm.value.item_type),
        frequency: new FormControl(this.updateItemForm.value.frequency),
        title: new FormControl(this.updateItemForm.value.title),
        description: new FormControl(this.updateItemForm.value.description),
        start_date: new FormControl(this.updateItemForm.value.start_date),
        end_date: new FormControl(this.updateItemForm.value.end_date),
        start_time: new FormControl(this.updateItemForm.value.start_time),
        end_time: new FormControl(this.updateItemForm.value.end_time),
        all_day: new FormControl(this.updateItemForm.value.all_day),
        location: new FormControl(this.updateItemForm.value.location),
      });
    } else {
      let i = 1;
      const groupID = i;
      $('.date-input-end, .date-input-end-update').show();
      this.addItemForm = new FormGroup({
        user_id: new FormControl(this.addItemForm.value.user_id),
        group_id: new FormControl(groupID),
        item_type: new FormControl(this.addItemForm.value.item_type),
        frequency: new FormControl(this.addItemForm.value.frequency),
        title: new FormControl(this.addItemForm.value.title),
        description: new FormControl(this.addItemForm.value.description),
        start_date: new FormControl(this.addItemForm.value.start_date),
        end_date: new FormControl(this.addItemForm.value.end_date),
        start_time: new FormControl(this.addItemForm.value.start_time),
        end_time: new FormControl(this.addItemForm.value.end_time),
        all_day: new FormControl(this.addItemForm.value.all_day),
        location: new FormControl(this.addItemForm.value.location),
      });

      this.updateItemForm = new FormGroup({
        user_id: new FormControl(this.updateItemForm.value.user_id),
        group_id: new FormControl(groupID),
        item_type: new FormControl(this.updateItemForm.value.item_type),
        frequency: new FormControl(this.updateItemForm.value.frequency),
        title: new FormControl(this.updateItemForm.value.title),
        description: new FormControl(this.updateItemForm.value.description),
        start_date: new FormControl(this.updateItemForm.value.start_date),
        end_date: new FormControl(this.updateItemForm.value.end_date),
        start_time: new FormControl(this.updateItemForm.value.start_time),
        end_time: new FormControl(this.updateItemForm.value.end_time),
        all_day: new FormControl(this.updateItemForm.value.all_day),
        location: new FormControl(this.updateItemForm.value.location),
      });
    }
  }

  allDaySelected(e) {
    const endTime = 23 + ':' + 59;
    const startTime = '00' + ':' + '00';

    if (e.target.checked === true) {
      this.allDay = true;
    } else {
      this.allDay = false;
    }

    this.addItemForm = new FormGroup({
      user_id: new FormControl(this.addItemForm.value.user_id),
      group_id: new FormControl(''),
      item_type: new FormControl(this.addItemForm.value.item_type),
      frequency: new FormControl(this.addItemForm.value.frequency),
      title: new FormControl(this.addItemForm.value.title),
      description: new FormControl(this.addItemForm.value.description),
      start_date: new FormControl(this.addItemForm.value.start_date),
      end_date: new FormControl(this.addItemForm.value.end_date),
      start_time: new FormControl(startTime),
      end_time: new FormControl(endTime),
      all_day: new FormControl(this.addItemForm.value.all_day),
      location: new FormControl(this.addItemForm.value.location),
    });

    this.updateItemForm = new FormGroup({
      user_id: new FormControl(this.updateItemForm.value.user_id),
      group_id: new FormControl(''),
      id: new FormControl(this.updateItemForm.value.id),
      item_type: new FormControl(this.updateItemForm.value.item_type),
      frequency: new FormControl(this.updateItemForm.value.frequency),
      title: new FormControl(this.updateItemForm.value.title),
      description: new FormControl(this.updateItemForm.value.description),
      start_date: new FormControl(this.updateItemForm.value.start_date),
      end_date: new FormControl(this.updateItemForm.value.end_date),
      start_time: new FormControl(startTime),
      end_time: new FormControl(endTime),
      all_day: new FormControl(this.updateItemForm.value.all_day),
      location: new FormControl(this.updateItemForm.value.location),
    });
  }



  //Helper functions
  removeClassesForDayBox() {
    $('.day-box').removeClass('selected-day day-opened swipe-left swipe-right bounce-right bounce-left');
  }

  swipeNextMonthAnimationOne() {
    this.nextClick();
    setTimeout(() => {
      $('.opened-background').show();
      $('.day-box').removeClass('selected-day');
      $('.first-day-box').addClass('selected-day day-opened swipe-left');
    }, 350);
  }

  swipeNextEndOfRow() {
    $('.opened-background').show();
  }

  swipeNextDay() {
    $('.opened-background').show();
    setTimeout(() => {
      this.enableDefaultScrolling();
    }, 300);
  }

  swipePrevMonthAnimationOne() {
    this.prevClick();
    setTimeout(() => {
      $('.opened-background').show();
      $('.day-box').removeClass('selected-day');
      $('.last-day-box').addClass('selected-day day-opened swipe-right');
    }, 350);
  }

  swipePrevEndOfRow() {
    $('.opened-background').show();
  }

  swipePrevDay() {
    $('.opened-background').show();
    setTimeout(() => {
      this.enableDefaultScrolling();
    }, 300);
  }

  enableDefaultScrolling() {
    if ($('.day-opened .event').last().position() !== undefined) {
      if ($('.day-opened .transactions').height() <= $('.day-opened .event').last().position().top + 280) {
        $('.day-opened .transactions').addClass('normal-scrolling');
      }
    }
  }


  mobileHideElements() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.next-day, .prev-day').addClass('hide');
    } else {
      $('.next-day, .prev-day').removeClass('hide');
    }
  }

}
