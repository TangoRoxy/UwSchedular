import { Component } from '@angular/core';
import { ElementRef, AfterViewInit, Input} from '@angular/core';
import * as $ from 'jquery';
@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements AfterViewInit {

  interval = [];
  weekday = [];
  color = ['#567362', '#7382e6', '#ffbff2',  '#ff00ee', '#bf8f30', '#bfffd0', '#ffcc00', '#006644'];
  //@ViewChild('*') private table;
  @Input() detail;
  @Input() schedule;
  @Input() no: number;

  tbody : any;

  constructor(private ef: ElementRef) {
    this.interval= Array(31).fill(0).map((x,i)=> i);
    this.weekday= Array(5).fill(0).map((x,i)=>i);
  }

  ngAfterViewInit() {

    this.tbody = $(this.ef.nativeElement).find("tbody").children();

    for(let i in this.schedule){
      let course = this.detail[i].classes[this.schedule[i]];
      // this is an online course
      if (!course.start_time){
        continue;
      }
      let time = this.getTime(course.start_time, course.end_time);
      let days = this.getDate(course.weekdays);
      // changing every day
      for (let k = time[0]; k <= time[1]; k++){
        let row = this.tbody.eq(k).children();
        for (let j of days){
          row.eq(j).css("background-color", this.color[Number(i)%this.color.length]);
          row.eq(j).html(Number(i)+1);
        }
      }
    }
  }
  //set color
  //change inner html


  // Monday is 2,...
  getDate(s){
    let tests = [/M/, /T[^h]/,/W/, /Th/, /F/];
    let days = [];
    for (let i in tests){
      if (tests[i].test(s)){
        days.push(Number(i)+1);
      }
    }
    return days;
  }


  // 8:00 is 1st row , 8:30 is 2nd ..., round up
  // start, end will be valid
  getTime(start,end) {
    return [start, end].map(x => {
      let s = x.split(':');
      return Math.floor((Number(s[1]) + Number(s[0]) * 60 - 480) / 30);
    });
  }

  top(){
    window.scroll(0,0);
  }
}
