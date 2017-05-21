import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ScheduleFormComponent } from './schedule-form/schedule-form.component';
import {CourseInfoService} from "./course-info.service";

@NgModule({
  declarations: [
    AppComponent,
    ScheduleFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [CourseInfoService],
  bootstrap: [AppComponent]
})
export class AppModule { }
