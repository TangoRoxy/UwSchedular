import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent implements OnInit {

  constructor() { }


  debug = true;
  courses = [];

  addCourse(){
    if (this.courses.length < 7){
      this.courses.push({});
    }
  }

  remove(i : number){
    this.courses.splice(i,1);
  }
  ngOnInit() {
  }

}
