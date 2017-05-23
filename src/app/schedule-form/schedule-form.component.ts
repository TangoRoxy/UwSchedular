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
  courses : Array<any> = [];
  form = {courses: this.courses, showOpenOnly: true};
  cache = {};
  // MOCK
  result = [ [ [ "0", "0", "0" ], [ "0", "1", "0" ], [ "0", "2", "0" ], [ "1", "0", "0" ], [ "1", "1", "0" ], [ "1", "2", "0" ], [ "2", "0", "0" ], [ "2", "1", "0" ], [ "2", "2", "0" ] ], [ { "name": "CS350", "title": "Operating Systems", "type": "LEC", "classes": [ { "class_nb": 3646, "section": "LEC 001", "canEnrol": 5, "start_time": "14:30", "end_time": "15:50", "weekdays": "MW", "location": { "building": "MC", "room": "4040" }, "instructors": "Zille Huma,Kamal" }, { "class_nb": 3800, "section": "LEC 002", "canEnrol": 1, "start_time": "10:00", "end_time": "11:20", "weekdays": "TTh", "location": { "building": "MC", "room": "4040" }, "instructors": "Istead,Lesley Ann" }, { "class_nb": 3936, "section": "LEC 003", "canEnrol": 1, "start_time": "14:30", "end_time": "15:50", "weekdays": "TTh", "location": { "building": "MC", "room": "4040" }, "instructors": "Istead,Lesley Ann" } ] }, { "name": "CS341", "title": "Algorithms", "type": "LEC", "classes": [ { "class_nb": 3551, "section": "LEC 001", "canEnrol": 5, "start_time": "08:30", "end_time": "09:50", "weekdays": "TTh", "location": { "building": "MC", "room": "4040" }, "instructors": "Lau,Lap Chi" }, { "class_nb": 3748, "section": "LEC 002", "canEnrol": 5, "start_time": "11:30", "end_time": "12:50", "weekdays": "TTh", "location": { "building": "MC", "room": "4040" }, "instructors": "Lau,Lap Chi" }, { "class_nb": 3935, "section": "LEC 003", "canEnrol": 1, "start_time": "13:00", "end_time": "14:20", "weekdays": "TTh", "location": { "building": "MC", "room": "2035" }, "instructors": "Lau,Lap Chi" } ] }, { "name": "CO351", "title": "Network Flow Theory", "type": "LEC", "classes": [ { "class_nb": 3539, "section": "LEC 001", "canEnrol": 14, "start_time": "10:00", "end_time": "11:20", "weekdays": "TTh", "location": { "building": "MC", "room": "4058" }, "instructors": "Nayak,Ashwin" } ] } ] ];
  //result= [];
  addCourse(){
    if (this.courses.length < 7){
      this.courses.push({related:[{},{}]});
    }
  }

  remove(i : number){
    this.courses.splice(i,1);
  }

  ngOnInit() {
    this.addCourse();
  }

  getCourseInfo($event){
    // console.log($event);
    let s = this.cleanFormat($event.target.value);

    if (this.checkIfValid(s)){
      this.cs.getInfo(s).subscribe(r=>{
        console.log(r);
        for (let c of this.courses){
          if (this.cleanFormat(c.name) == s){
            c.name = s;
          }
        }
        this.processData(r);
        // if (r.length > 0){
        //   let index = -1;
        //   for(let i= 0; i < this.courses.length; i++){
        //
        //     if (this.cleanFormat(this.courses[i].name) == r[0].name){
        //       index = i;
        //     }
        //   }
        //   console.log(index);
        //   if (index == -1){
        //     return;
        //   }
        //   this.courses[index].title = r[0].title;
        //   for (let c of r){
        //     if (c.type == "LEC"){
        //       this.courses[index].section = c.classes;
        //     } else{
        //       if (this.courses[index].related){
        //         this.courses[index].related.push({
        //           name: r[0].name + '-' + c.type,
        //           section: c.classes
        //         });
        //       }
        //       this.courses[index].related = [{
        //         name: r[0].name + '-' + c.type,
        //         section: c.classes
        //       }];
        //     }
        //   }
        // }

      });
    }

  }
  processData(r){
    // TODO: check if cache already exists?
    if (r.length > 0) {
      let data : any = {title: r[0].title, related: []};
      for (let c of r) {
        if (c.type == "LEC") {
          // data.classes = [{section: "any"}].concat(c.classes);
          data.classes = c.classes;
          data.classes.push({section: "any"});
        } else {
          let i = data.related.push(c.classes);
          data.related[i-1].push({section:"any"});
        }
      }
      this.cache[r[0].name] = data;
    }
  }

  cacheExist(s){
    return !!this.cache[this.cleanFormat(s)];
  }

  cleanFormat(s){
    if (!s){
      return "";
    }
    let regex = /[^a-zA-Z0-9]/g;
    return s.replace(regex,"").toUpperCase();
  }

  checkIfValid(s){
    console.log(s);
    let courseFormat = /^[a-zA-Z]{2,4}[0-9]{3}$/;
    return courseFormat.test(s);
  }

  submit(form){
    this.courses = this.courses.filter(c=>this.checkIfValid(c.name));
    this.form.courses = this.courses;
    if (form.courses.length > 0){
      this.cs.getSchedule(form).subscribe((r)=>{
        if (r){
          this.result=r;
        }
      });
    }

  }
}

// course-info-cache [upgrade to a lru-cache
// { name : {title : calculus 3, classes: [{type, section, time.. , instructor, location ... }], related: [{type, section ... }]
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
 *  2. Form Submission
 *  3. API revamp: support filter
 *  4. course information presentation
 *  ---
 *  5. table presentation
 *  6. form presentation/ overall presentation
 *  * : frontend observable caching
 *  * : interfaces: form, sectionInfo,  cached info
 *  *1: save button: save to cookie
 *  *2: clear all cache/ all entry
 */


interface courseForm{
  courses: Array<any>,
  showOpenOnly?: boolean
}

interface lecture{
  name?: string,
  section?: string,
  enrolled?: boolean,
  related?: Array<any>
}

interface relatedComp{
  section?: string,
  enrolled?: string
}

interface courseInfo{
  section: string,
  class_nb: number,
  canEnrol: number,
  start_time: string,
  end_time: string,
  weekdays: string,
  location: any, //string,
  instructors: any
}

interface cachedCourse{
  title: string,
  classes: Array<courseInfo>,
  related: Array<courseInfo>
}
