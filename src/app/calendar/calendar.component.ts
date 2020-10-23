import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { EventDataService } from '../services/eventdata.service';
import { MONTHS } from './months.constant';
import $ from 'jquery';
import _ from 'lodash';
import * as moment from 'moment';
import 'hammerjs';
import { toExcelDate } from 'js-excel-date-convert';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private dataService: EventDataService, private cookieService: CookieService) { }

  // Date variables
  clock = new Date();
  currentMonth = this.clock.getMonth();
  currentYear = this.clock.getFullYear();
  currentDay = this.clock.getDate();
  currentDayofWeek = this.clock.getDay();
  isCurrentWeekday = false;
  openform = false;
  hideFormButton = false;
  makeEventVisible = false;

  // Calendar variables
  rows: any = [];
  weekDays: any = [];
  weekDayAbbrv: any = [
    { name: 'Sun', num: 0 }, { name: 'Mon', num: 1 }, { name: 'Tue', num: 2 },
    { name: 'Wed', num: 3 }, { name: 'Thu', num: 4 }, { name: 'Fri', num: 5 },
    { name: 'Sat', num: 6 }
  ];

  // Selector options variables
  monthSelectorOptions: any = [];
  yearSelectorOptions: any = [];

  getEachMonthDays: any;

  events: any;
  eachEvent: any;

  groupID: any = 0;

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

  // Hide loading indicator
  loading = false;

  getEventsFinished = false;

  // Gesture Vibration
  gestureVibration = 2;

  ngOnInit() {
    this.createCalendarGrid();
  }

  // This will set our calendar table and the control bar
  createCalendarGrid() {
    let i;

    // Create 6 rows
    const rowsInCalendar = 6;
    for (i = 0; i < rowsInCalendar; i++) {
      this.rows.push(i);
    }

    // Create each weekday box or 7 columns
    const daysInWeek = 7;
    for (i = 0; i < daysInWeek; i++) {
      this.weekDays.push(i);
    }

    // Create each weekday title in the control bar
    for (i = 0; i < this.weekDayAbbrv.length; i++) {
      if (this.weekDayAbbrv[i].num === this.currentDayofWeek) {
        // console.log('This is the weekday: ' + this.weekDayAbbrv[i].num);
      }
    }

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

    // Detect the user device for specific UI compatability adjustments
    if (navigator.userAgent.indexOf('Mac') !== -1) {
      if (navigator.userAgent.indexOf('Chrome') !== -1) {
        $('.calendar-navbar').addClass('mac');
      }
    } else if (navigator.userAgent.indexOf('Win') !== -1) {
      // console.log('Windows');
    }
  }

  ngAfterViewInit() {
    // Every 10 sec get update the date automatically and if day changes
    // update the calendar as well as the current day number and day of week
    setInterval(() => {
      this.clock = new Date();
      if (this.currentDay !== this.clock.getDate()) {
        this.currentDay = this.clock.getDate();
        this.currentDayofWeek = this.clock.getDay();
        this.currentMonth = this.clock.getMonth();
        this.currentYear = this.clock.getFullYear();

        if ($('.day-box').find('.current-day').parent().next().length === 0) {
          setTimeout(() => {
            $('.day-box').find('.current-day').parent().parent().next().find('.num-box').eq(0).addClass('current-day');
            $('.day-box').find('.current-day').eq(0).removeClass('current-day');
          }, 200);
        } else {
            setTimeout(() => {
              $('.day-box').find('.current-day').parent().next().find('.num-box').addClass('current-day');
              $('.day-box').find('.current-day').eq(0).removeClass('current-day');
            }, 200);
        }
      }
    }, 10 * 1000);

    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      $('.prev, .next').hide();
      $('.close-day, .close-form').addClass('mobile');
    } else {
      $('.prev, .next').show();
      $('.close-day, .close-form').removeClass('mobile');
    }

    // On first load init calendar
    this.changeCal();

    // Initial loading of the events
    setTimeout(() => {
      this.getEvents();
    }, 100);
  }

  // Find the start day of the selected Month and Year and render each day number into the calendar table
  renderMonth() {
    // Use jquery to slightly manipulate DOM and render
    MONTHS[1].days = Number($('#year').val()) % 4 == 0 ? 29 : 28;
    const currentMonth = $(document).find('#month').val();
    let nextMonth = Number($(document).find('#month').val()) + 2;
    let currentYear = $(document).find('#year').val();
    const startOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const monthDays = MONTHS[$(document).find('#month').val()].days;
    const weeks = $(document).find('.weeks').children();
    _.range(1, 43).forEach((dayIndex, i) => {
      // Get the index of each box in the first row of the calendar table
      const day = $(weeks[startOfMonth + dayIndex - 1]);

      // if current month and year find the current day and style it
      if (this.clock.getDate() === dayIndex && this.clock.getMonth() ==
      $('#month').val() && this.clock.getFullYear() == $('#year').val()) {
        day.find('.num-box').addClass('current-day');
        day.find('.num-box').parent().addClass('clicked-day day-background-color selected-day').removeClass('dead-month-color');
      }
      // If not current month then find 1st day and style it
      else {
        day.find('.day-box').children().removeClass('current-day');
        day.find('.num-date').parent().parent().removeClass('dead-month-color day-background-color');
      }

      if (dayIndex > monthDays) {
        // If calendar hits Dec set next month to Jan of next year
        if (nextMonth === 13) {
          nextMonth = 1;
          currentYear = Number(currentYear) + 1;
        }

        // If calendar hits any month thats not december
        const standardMonth = '0' + nextMonth;
        const newDayIndex = (dayIndex - monthDays);
        const standardDayIndex = '0' + newDayIndex;
        const excelDate = toExcelDate(new Date(currentYear, Number(standardMonth), Number(newDayIndex))).toString();

        if (nextMonth < 10) {

          if ((newDayIndex) < 10) {
            day.find('.date-value').html(currentYear + '-' + standardMonth + '-' + standardDayIndex);
            day.find('.num-date').html(newDayIndex).parent().parent().addClass('dead-month-color');
            day.find('.excel-date').html(excelDate);
          } else {
            day.find('.date-value').html(currentYear + '-' + standardMonth + '-' + newDayIndex);
            day.find('.num-date').html(newDayIndex).parent().parent().addClass('dead-month-color');
            day.find('.excel-date').html(excelDate);
          }
        } else {
          if ((dayIndex - monthDays) < 10) {
            day.find('.date-value').html(currentYear + '-' + nextMonth + '-' + standardDayIndex);
            day.find('.num-date').html(newDayIndex).parent().parent().addClass('dead-month-color');
            day.find('.excel-date').html(excelDate);
          } else {
            day.find('.date-value').html(currentYear + '-' + nextMonth + '-' + newDayIndex);
            day.find('.num-date').html(newDayIndex).parent().parent().addClass('dead-month-color');
            day.find('.excel-date').html(excelDate);
          }
        }
      } else {
        const thisMonth = (Number(currentMonth) + 1);
        const standardNewMonth = '0' + thisMonth;
        const newDays = dayIndex;
        const standardNewDays = '0' + dayIndex;

        const excelDate = toExcelDate(new Date(currentYear, Number(standardNewMonth), Number(newDays))).toString();
        
        if (thisMonth < 10) {
          if (dayIndex < 10) {
            day.find('.date-value').html(currentYear + '-' + standardNewMonth + '-' + standardNewDays);
            day.find('.num-date').html('&nbsp' + newDays + '&nbsp');
            day.find('.excel-date').html(excelDate);
          } else {
            day.find('.date-value').html(currentYear + '-' + standardNewMonth + '-' + newDays);
            day.find('.num-date').html(newDays);
            day.find('.excel-date').html(excelDate);
          }
        } else {
          if (dayIndex < 10) {
            day.find('.date-value').html(currentYear + '-' + thisMonth + '-' + standardNewDays);
            day.find('.num-date').html('&nbsp' + newDays + '&nbsp');
            day.find('.excel-date').html(excelDate);
          } else {
            day.find('.date-value').html(currentYear + '-' + thisMonth + '-' + newDays);
            day.find('.num-date').html(newDays);
            day.find('.excel-date').html(excelDate);
          }
        }
      }

      // Find the 1 day of each month and add Class first-day
      if (day.find('.num-date').html() === '&nbsp;' + '1' + '&nbsp;') {
        day.find('.num-date').parent().addClass('first-day');
        day.find('.num-date').parent().parent().addClass('first-day-box');
      } else {
        day.find('.num-date').parent().removeClass('first-day');
        day.find('.num-date').parent().parent().removeClass('first-day-box');
      }

      if (Number(day.find('.num-date').html()) === monthDays) {
        day.find('.num-date').parent().addClass('last-day');
        day.find('.num-date').parent().parent().addClass('last-day-box');
      } else {
        day.find('.num-date').parent().removeClass('last-day');
        day.find('.num-date').parent().parent().removeClass('last-day-box');
      }
    });

  }

  renderPrevMonthDays() {
    MONTHS[1].days = Number($(document).find('#year').val()) % 4 == 0 ? 29 : 28;
    let currentYear = $(document).find('#year').val();
    let prevMonth = Number($(document).find('#month').val());
    const startOfMonth = new Date($(document).find('#year').val(), $(document).find('#month').val(), 1).getDay();
    const prevMonthDays = $(document).find('#month').val() == 0 ? 31 : MONTHS[$(document).find('#month').val() - 1].days;
    const weeks = $(document).find('.weeks').children();
    const prevDays = _.range(1, prevMonthDays + 1).slice(-startOfMonth);

    _.range(0, startOfMonth).forEach((dayIndex) => {
      const day = $(weeks[dayIndex]);

      const excelDate = toExcelDate(new Date(currentYear, Number(prevMonth), Number((prevDays[dayIndex]))));

      if (startOfMonth > dayIndex) {
        if (prevMonth === 0) {
          prevMonth = 12;
          currentYear = Number(currentYear) - 1;
        }

        if (prevMonth < 10) {
          const standardNewMonth = '0' + prevMonth;
          day.find('.date-value').html(currentYear + '-' + standardNewMonth + '-' + (prevDays[dayIndex]));
          day.find('.num-date').html((prevDays[dayIndex]));
          day.find('.excel-date').html(excelDate);
        } else {
          day.find('.date-value').html(currentYear + '-' + prevMonth + '-' + (prevDays[dayIndex]));
          day.find('.num-date').html((prevDays[dayIndex]));
          day.find('.excel-date').html(excelDate);
        }

        day.find('.num-date').parent().parent().addClass('dead-month-color');
        day.find('.num-box').parent().removeClass('day-background-color');
      }
    });
  }

  selectedDay() {
    if ($('.day-box').hasClass('day-background-color') == true) {
      // $(document).find('#todays-day').html;
    } else if ($('.num-box').hasClass('first-day') == true) {
      $('.first-day').parent().addClass('selected-day clicked-day');
      $('.dead-month-color').removeClass('clicked-day');
    }
  }

  changeCal() {
    $('.update-event-form').removeClass('show-update-form');
    $('.day-box').removeClass('clicked-day double-click selected-day swipe-right swipe-left first-day-box last-day-box');
    $('.main-info-section').removeClass('animate-events-one animate-events-two');
    $('.add-item-button, .add-item-container').show();
    $('.add-item-form').removeClass('show-form');
    $('.num-box').removeClass('first-day last-day current-day');
    $('.main-info-section, .event-count').hide();
    $('.event').removeClass('visible');
    $('.event-container').removeClass('visible-parent');
    this.renderPrevMonthDays();
    this.renderMonth();
    this.selectedDay();
  }

  prevClick() {
    // window.navigator.vibrate(this.gestureVibration);
    if ($(document).find('#year').val() < (this.currentYear - 5)) {
      $(document).find('#year').val(this.currentYear - 5).change();
      $(document).find('#month').val(0).change();
    } else {
      if ($('#month').val() == null || $('#month').val() == 0) {
        $(document).find('#month').val(11).change();
        $(document).find('#year').val(Number($(document).find('#year').val()) - 1).change();
      } else {
        $(document).find('#month').val(Number($(document).find('#month').val()) - 1).change();
      }
    }
    $('.calendar-container').addClass('cal-swipe-left');
    setTimeout(() => {
      this.changeCal();
      setTimeout(() => {
        this.showEvents();
      }, 100);
      $('.calendar-container').removeClass('cal-swipe-left cal-swipe-right');
    }, 200);
  }

  currentClick() {
    // window.navigator.vibrate(this.gestureVibration);
    $('.calendar-wrapper').removeClass('cal-swipe-left cal-swipe-right');
    $(document).find('#month').val(this.currentMonth).change();
    $(document).find('#year').val(this.currentYear).change();
    this.changeCal();
    setTimeout(() => {
      this.showEvents();
    }, 100);
  }

  nextClick() {
    // window.navigator.vibrate(this.gestureVibration);
    if ($(document).find('#year').val() > (this.currentYear + 5) && $(document).find('#month').val() == 11) {
      $(document).find('#year').val(this.currentYear + 5).change();
      $(document).find('#month').val(11).change();
    } else {
      if ($(document).find('#month').val() == null || $(document).find('#month').val() == 11) {
        $(document).find('#month').val(0).change();
        $(document).find('#year').val(Number($(document).find('#year').val()) + 1).change();
      } else {
        $(document).find('#month').val(Number($(document).find('#month').val()) + 1).change();
      }
    }
    $('.calendar-container').addClass('cal-swipe-right');
    setTimeout(() => {
      this.changeCal();
      setTimeout(() => {
        this.showEvents();
      }, 100);
      $('.calendar-container').removeClass('cal-swipe-left cal-swipe-right');
    }, 200);
  }


  onSwipeLeft(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      // window.navigator.vibrate(this.gestureVibration);
      $('.double-click').removeClass('bounce-left');
      if (!$('.day-box').hasClass('double-click')) {
        this.nextClick();
      } else {
        if ($(e.target).hasClass('main-info-section')) {
          if (!$(e.target).parent().next().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-left swipe-right bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().hasClass('last-day-box')) {
              this.nextClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.first-day').parent().addClass('clicked-day double-click swipe-left');
              }, 200);
            } else if ($(e.target).parent().next().length === 0) {
              $(e.target).parent().parent().next().children().eq(0).addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            } else {
              $(e.target).parent().next().addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.nextClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.first-day').parent().addClass('clicked-day double-click swipe-left');
            }, 200);
          }
        } else if ($(e.target).hasClass('event')) {
          if (!$(e.target).parent().parent().parent().next().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-left swipe-right bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().parent().parent().hasClass('last-day-box')) {
              this.nextClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.first-day').parent().addClass('clicked-day double-click swipe-left');
              }, 200);
            } else if ($(e.target).parent().parent().parent().next().length === 0) {
              $(e.target).parent().parent().parent().parent().next().children().eq(0).addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            } else {
              $(e.target).parent().parent().parent().next().addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.nextClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.first-day').parent().addClass('clicked-day double-click swipe-left');
            }, 200);
          }
        } else if ($(e.target).hasClass('event-details')) {
          if (!$(e.target).parent().parent().parent().parent().next().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-left swipe-right bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().parent().parent().parent().hasClass('last-day-box')) {
              this.nextClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.first-day').parent().addClass('clicked-day double-click swipe-left');
              }, 200);
            } else if ($(e.target).parent().parent().parent().parent().next().length === 0) {
              $(e.target).parent().parent().parent().parent().parent().next().children().eq(0).addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            } else {
              $(e.target).parent().parent().parent().parent().next().addClass('clicked-day double-click swipe-left');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.nextClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.first-day').parent().addClass('clicked-day double-click swipe-left');
            }, 200);
          }
        }
      }
    }
  }

  onSwipeRight(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      // window.navigator.vibrate(this.gestureVibration);
      if (!$('.day-box').hasClass('double-click')) {
        this.prevClick();
      } else {
        if ($(e.target).hasClass('main-info-section')) {
          if (!$(e.target).parent().prev().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-left swipe-right bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().hasClass('first-day-box')) {
              this.prevClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.last-day').parent().addClass('clicked-day double-click swipe-right');
              }, 200);
            } else if ($(e.target).parent().prev().length === 0) {
              $(e.target).parent().parent().prev().children().eq(6).addClass('clicked-day double-click swipe-right');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            } else {
              $(e.target).parent().prev().addClass('clicked-day double-click swipe-right');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.prevClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.last-day').parent().addClass('clicked-day double-click swipe-right');
            }, 200);
          }
        } else if ($(e.target).hasClass('event')) {
          if (!$(e.target).parent().parent().parent().prev().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-right swipe-left bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().parent().parent().hasClass('first-day-box')) {
              this.prevClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.last-day').parent().addClass('clicked-day double-click swipe-right');
              }, 200);
            } else if ($(e.target).parent().parent().parent().prev().length === 0) {
              $(e.target).parent().parent().parent().parent().prev().children().eq(6).addClass('clicked-day double-click swipe-right');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            } else {
              $(e.target).parent().parent().parent().prev().addClass('clicked-day double-click swipe-right');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.prevClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.last-day').parent().addClass('clicked-day double-click swipe-right');
            }, 200);
          }
        } else if ($(e.target).hasClass('event-details')) {
          if (!$(e.target).parent().parent().parent().parent().prev().hasClass('dead-month-color')) {
            $('.day-box').removeClass('clicked-day double-click swipe-right swipe-left bounce-right bounce-left');
            $('.main-info-section').removeClass('animate-events-one animate-events-two');
            if ($(e.target).parent().parent().parent().parent().hasClass('first-day-box')) {
              this.prevClick();
              setTimeout(() => {
                $('.day-box').removeClass('clicked-day');
                $('.last-day').parent().addClass('clicked-day double-click swipe-right');
              }, 200);
            } else if ($(e.target).parent().parent().parent().parent().prev().length === 0) {
              $(e.target).parent().parent().parent().parent().parent().prev().children().eq(6).addClass('clicked-day double-click swipe-right');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');
              }, 400);
            } else {
              $(e.target).parent().parent().parent().parent().prev().addClass('clicked-day double-click swipe-right');
              $('.double-click .num-date').removeClass('auto-hide');
              $('.double-click').find('.main-info-section').addClass('animate-events-one');
              setTimeout(() => {
                $('.double-click').find('.main-info-section').addClass('animate-events-two');

                if ($('.double-click .visible-parent').last().position() !== undefined) {
                  if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
                    $('.double-click .main-info-section').addClass('normal-scrolling');
                  } else {
                    $('.double-click .main-info-section').removeClass('normal-scrolling');
                  }
                }
              }, 400);

              setTimeout(() => {
                $('.double-click .num-date').addClass('auto-hide');
              }, 7000);
            }
          } else {
            this.prevClick();
            setTimeout(() => {
              $('.day-box').removeClass('clicked-day');
              $('.last-day').parent().addClass('clicked-day double-click swipe-right');
            }, 200);
          }
        }
      }
    }
  }

  onSwipeDown(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      if (!$('.day-box').hasClass('double-click') || $('.update-event-form').hasClass('show-update-form')) {
        this.showEvents();
      } else {
        if ($(e.target).hasClass('event') || $(e.target).hasClass('main-info-section') || $(e.target).hasClass('event-details')) {
          console.log('no scroll');
        } else {
          // window.navigator.vibrate(this.gestureVibration);
          $('.day-box').removeClass('double-click swipe-right swipe-left');
          $('.main-info-section').removeClass('normal-scrolling');
          $('.main-info-section').removeClass('animate-events-one animate-events-two');
          $('.visible').removeClass('selected-event');
          setTimeout(() => {
            $('.main-info-section').animate({ scrollTop: 0 }, 300);
          }, 400);
        }
      }
    }
  }

  onSwipeDownForm(e) {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
      this.closeForm();
      this.closeEventUpdateForm();
    }
  }

  clickonDay(e) {
    $('.add-item-form').removeClass('show-form');
    $('.extra').hide();
    if ($(e.target).hasClass('prev-day-icon')) {
      $('.visible').removeClass('selected-event');
      $('.update-event-form').removeClass('show-update-form');
      $('.num-box').removeClass('event-opened');
      // window.navigator.vibrate(this.gestureVibration);
      if (!$(e.currentTarget).prev().hasClass('dead-month-color')) {
        $('.day-box').removeClass('clicked-day double-click swipe-right swipe-left');
        $('.main-info-section').removeClass('animate-events-one animate-events-two');
        if ($(e.currentTarget).hasClass('first-day-box')) {
          this.prevClick();
          setTimeout(() => {
            $('.day-box').removeClass('clicked-day');
            $('.last-day').parent().addClass('clicked-day double-click swipe-left');
          }, 200);
        } else if ($(e.currentTarget).prev().length === 0) {
          $(e.currentTarget).parent().prev().children().eq(6).addClass('clicked-day double-click swipe-left');
          $('.double-click').find('.main-info-section').addClass('animate-events-one');
          setTimeout(() => {
            $('.double-click').find('.main-info-section').addClass('animate-events-two');
          }, 400);
        } else {
          $(e.currentTarget).prev().addClass('clicked-day double-click swipe-left');
          $('.double-click').find('.main-info-section').addClass('animate-events-one');
          setTimeout(() => {
            $('.double-click').find('.main-info-section').addClass('animate-events-two');
          }, 400);
        }
      } else {
        this.prevClick();
        setTimeout(() => {
          $('.day-box').removeClass('clicked-day');
          $('.last-day').parent().addClass('clicked-day double-click swipe-left');
        }, 200);
      }
    } else if ($(e.target).hasClass('next-day-icon')) {
      $('.visible').removeClass('selected-event');
      $('.update-event-form').removeClass('show-update-form');
      $('.num-box').removeClass('event-opened');
      // window.navigator.vibrate(this.gestureVibration);
      if (!$(e.currentTarget).next().hasClass('dead-month-color')) {
        $('.day-box').removeClass('clicked-day double-click swipe-right swipe-left');
        $('.main-info-section').removeClass('animate-events-one animate-events-two');
        if ($(e.currentTarget).hasClass('last-day-box')) {
          this.nextClick();
          setTimeout(() => {
            $('.day-box').removeClass('clicked-day');
            $('.first-day').parent().addClass('clicked-day double-click swipe-right');
          }, 200);
        } else if ($(e.currentTarget).next().length === 0) {
          $(e.currentTarget).parent().next().children().eq(0).addClass('clicked-day double-click swipe-right');
          $('.double-click').find('.main-info-section').addClass('animate-events-one');
          setTimeout(() => {
            $('.double-click').find('.main-info-section').addClass('animate-events-two');
          }, 400);
        } else {
          $(e.currentTarget).next().addClass('clicked-day double-click swipe-right');
          $('.double-click').find('.main-info-section').addClass('animate-events-one');
          setTimeout(() => {
            $('.double-click').find('.main-info-section').addClass('animate-events-two');
          }, 400);
        }
      } else {
        this.nextClick();
        setTimeout(() => {
          $('.day-box').removeClass('clicked-day');
          $('.first-day').parent().addClass('clicked-day double-click swipe-right');
        }, 200);
      }
    } else if ($(e.target).hasClass('close-day-icon')) {
      // window.navigator.vibrate(this.gestureVibration);
      $('.day-box').removeClass('double-click swipe-right swipe-left');
      $('.main-info-section').removeClass('normal-scrolling');
      $('.main-info-section').removeClass('animate-events-one animate-events-two');
      $('.visible').removeClass('selected-event');
      setTimeout(() => {
        $('.main-info-section').animate({ scrollTop: 0 }, 300);
      }, 400);
    } else if (!$(e.currentTarget).hasClass('clicked-day') && !$(e.currentTarget).hasClass('double-click')) {
      $('.day-box').removeClass('clicked-day double-click');
      $(e.currentTarget).addClass('clicked-day');
    } else if ($(e.currentTarget).hasClass('clicked-day')) {
      $(e.currentTarget).addClass('double-click');
      $('.double-click .num-date').removeClass('auto-hide');
      $(e.currentTarget).find('.main-info-section').addClass('animate-events-one');
      setTimeout(() => {
        $('.double-click').find('.main-info-section').addClass('animate-events-two');

        if ($('.double-click .visible-parent').last().position() !== undefined) {
          if ($('.double-click .main-info-section').height() <= $('.double-click .visible-parent').last().position().top) {
            $('.double-click .main-info-section').addClass('normal-scrolling');
          }
        } 
      }, 400);

      setTimeout(() => {
        $('.double-click .num-date').addClass('auto-hide');
      }, 9000);
    }
  }

  eachDayEventsCount() {
    let dayIndex;
    const weeks = $(document).find('.weeks').children();

    for (dayIndex = 0; dayIndex <= 42; dayIndex++) {
      const day = $(weeks[dayIndex - 1]);
      if (day.find('.visible-parent').length !== 0 && day.find('.visible-parent').length <= 9) {
        day.find('.event-count').html('&nbsp' + day.find('.visible-parent').length + '&nbsp').show();
      } else if (day.find('.visible-parent').length !== 0) {
        day.find('.event-count').html(day.find('.visible-parent').length).show();
      }

    }
  }

  getEvents() {
    $('.main-info-section, .event-count').hide();
    this.loading = true;
    this.dataService.getEvents()
      .subscribe((response) => {
        let i;
        const eventlist = [];
        const weeks = $(document).find('.weeks').children();

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
          this.loading = false;
        }
        this.events = eventlist;

        this.showEvents();
        this.loading = false;
      });
  }

  showEvents() {
    $('.main-info-section, .event-count').hide();
    $('.event').removeClass('visible');
    $('.event-container').removeClass('visible-parent');

    let i;
    let dayIndex;
    const weeks = $(document).find('.weeks').children();

    for (i = 0; i < this.events.length; i++) {
      for (dayIndex = 0; dayIndex <= 42; dayIndex++) {
        const day = $(weeks[dayIndex - 1]);

        day.find('.event-count').empty().hide();

        if (day.find('.date-value').html() === this.events[i].eventstart_date) {
          setTimeout(() => {
            day.find('.event[startDate="' + day.find('.date-value').html() + '"]').addClass('visible');
            day.find('.event[startDate="' + day.find('.date-value').html() + '"]').parent().addClass('visible-parent');
            this.eachDayEventsCount();
            $('.main-info-section').show();
          }, 100);
        } else {
          $('.main-info-section').show();
        }
      }
    }
  }

  // Click on an Event
  selectEvent(e) {
    const day = $('.clicked-day .date-value').text();

    // If delete button has been clicked
    if ($(e.target).hasClass('delete-event')) {
      this.deleteItemForm = new FormGroup({
        id: new FormControl($(e.target).val()),
      });
    }
    // If an event has been clicked once
    else if (!$(e.currentTarget).hasClass('selected-event')) {
      $('.visible').removeClass('selected-event');
      $('.update-event-form').removeClass('show-update-form');
      $(e.currentTarget).addClass('selected-event');
      $('.num-box').removeClass('event-opened');
    } 
    // If an event has been clicked twice
    else if ($(e.currentTarget).hasClass('selected-event')) {
      $('.form-nav-bar h2').removeClass('auto-hide');
      $('.add-item-button, .add-item-container').hide();
      $('.num-box').addClass('event-opened');
      setTimeout(() => {
        $('.update-event-form').addClass('show-update-form').removeClass('closed');
      }, 200);
      $('.update-event-form').animate({ scrollTop: 0 }, 400);

      setTimeout(() => {
        $('.form-nav-bar h2').addClass('auto-hide');
      }, 7000);

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
      const userID = this.cookieService.get('userId');

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
  }

  // Delete an event
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
        // Get the new Events table after the item has been deleted
        setTimeout(() => {
          this.getEvents();
        }, 300);
      });
  }

  openForm() {
    $('.form-nav-bar h2').removeClass('auto-hide');
    $('.add-item-container').animate({ scrollTop: 0 }, 400);
    this.openform = true;
    this.hideFormButton = true;
    // window.navigator.vibrate(this.gestureVibration);
    $('.form-nav-bar, .add-item-form').addClass('animate-events-one');
    setTimeout(() => {
      $('.form-nav-bar, .add-item-form').addClass('animate-events-two');
      // $('input[name=title]').focus();
    }, 450);

    setTimeout(() => {
      $('.form-nav-bar h2').addClass('auto-hide');
    }, 7000);

    const day = $('.clicked-day .date-value').text();
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

    const userID = this.cookieService.get('userId');

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

  closeForm() {
    // window.navigator.vibrate(this.gestureVibration);
    this.addItemForm.reset();
    this.openform = false;
    $('.form-nav-bar, .add-item-form').removeClass('animate-events-one animate-events-two');
    setTimeout(() => {
      this.hideFormButton = false;
    }, 300);
  }

  submitEvent() {
    // window.navigator.vibrate(this.gestureVibration);
    this.loading = true;
    console.log(this.addItemForm.value);

    this.dataService.createEvent(this.addItemForm.value)
      .subscribe((response) => {
        this.addItemForm.reset();
        this.closeForm();
        this.loading = false;

        setTimeout(() => {
          this.getEvents();
        }, 300);
      });
  }

  updateEvent() {
    // window.navigator.vibrate(this.gestureVibration);
    this.loading = true;
    console.log(this.updateItemForm.value);
    this.dataService.updatedEvent(this.updateItemForm.value)
      .subscribe((response) => {
        this.closeEventUpdateForm();
        this.loading = false;

        setTimeout(() => {
          this.getEvents();
        }, 300);
      });
  }

  closeEventUpdateForm() {
    // window.navigator.vibrate(this.gestureVibration);
    this.updateItemForm.reset();
    $('.event').removeClass('selected-event');
    $('.num-box').removeClass('event-opened');
    $('.update-event-form').addClass('closed');
    // Delay for the Close animation
    setTimeout(() => {
      $('.update-event-form').removeClass('show-update-form');
    }, 300);
    $('.add-item-button, .add-item-container').show();
  }


  ngOnDestroy() {
    
  }

}