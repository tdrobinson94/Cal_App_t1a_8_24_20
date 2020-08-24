import { BrowserModule, HammerModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';
import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { SettingsComponent } from './settings/settings.component';
import { UserDataService } from './services/userdata.service';
import { AuthGuard } from './auth.guard';
import { GuestGuard } from './guest.guard';
import { ProfileComponent } from './profile/profile.component';
import { EventDataService } from './services/eventdata.service';
import { TestCalendarComponent } from './test-calendar/test-calendar.component';


export class HammerConfig extends HammerGestureConfig {
  overrides: any = {
    swipe: { direction: Hammer.DIRECTION_ALL }
  };
}

@NgModule({
  imports: [
    BrowserModule,
    HammerModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    SignupComponent,
    LoginComponent,
    CalendarComponent,
    SettingsComponent,
    ProfileComponent,
    TestCalendarComponent
  ],
  providers: [
    { provide: HAMMER_GESTURE_CONFIG, useClass: HammerConfig },
    { provide: LocationStrategy, useClass: HashLocationStrategy }, UserDataService, AuthGuard, GuestGuard,
    EventDataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
