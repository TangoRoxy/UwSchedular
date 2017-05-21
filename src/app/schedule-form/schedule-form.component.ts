import { Component, OnInit } from '@angular/core';
import { CourseInfoService } from '../course-info.service';
@Component({
  selector: 'app-schedule-form',
  templateUrl: './schedule-form.component.html',
  styleUrls: ['./schedule-form.component.css']
})
export class ScheduleFormComponent implements OnInit {

  constructor(private cs: CourseInfoService) { }


  debug = true;
  courses = [];
  cache = {};
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

  getCourseInfo($event){
    // console.log($event);
    let s = this.cleanFormat($event.target.value);
    if (this.checkIfValid(s)){
      this.cs.getInfo(s).subscribe(r=>{
        console.log(r);

        if (r.length > 0){
          let index = -1;
          for(let i= 0; i < this.courses.length; i++){

            if (this.cleanFormat(this.courses[i].name) == r[0].name){
              index = i;
            }
          }
          console.log(index);
          if (index == -1){
            return;
          }
          this.courses[index].title = r[0].title;
          for (let c of r){
            if (c.type == "LEC"){
              this.courses[index].section = c.classes;
            } else{
              if (this.courses[index].related){
                this.courses[index].related.push({
                  name: r[0].name + '-' + c.type,
                  section: c.classes
                });
              }
              this.courses[index].related = [{
                name: r[0].name + '-' + c.type,
                section: c.classes
              }];
            }
          }
        }

      });
    }

  }
  processData(r, cache){
    // TODO: check if cache already exists?
    if (r.length > 0) {
      let data : any = {title: r[0].title, related: []};
      for (let c of r) {
        if (c.type == "LEC") {
          data.classes = c.classes;
        } else {
          data.related.push(c.classes);
        }
      }
      cache[r[0].name] = data;
    }
  }
  cleanFormat(s){
    let regex = /[^a-zA-Z0-9]/g;
    return s.replace(regex,"").toUpperCase();
  }

  checkIfValid(s){
    console.log(s);
    let courseFormat = /^[a-zA-Z]{2,4}[0-9]{3}$/;
    return courseFormat.test(s);
  }
}

// course-info-cache [upgrade to a lru-cache
// { name : {title : calculus 3, classes: [{type, section, time.. , instructor, location ... }], related: {type, section ... }
// }

// separate form and info
/**
 * form is
 * courses : [{name: cs350
 *  section: "001"
 *  enrolled: true
 *  related: [{section:  001
 *             enrolled: true}]
 * showOpenOnly: bool
 */


/**
 *  TODO:
 *  1. Change processing return data: store it in the cache; form retrieve it differently
 *  2.
 *
 *
 *  *1: save button: save to cookie
 *  *2: clear all cache/ all entry
 */
