import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, RequestOptions, Headers}          from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/throttletime';
import {environment} from '../environments/environment';

@Injectable()
export class CourseInfoService {

  constructor(private http: Http) { }

  querySubject = new Subject();
  // observ = this.querySubject.throttleTime(1000).distinctUntilChanged().switchMap((s)=>this.getCourseInfo(s));
  observ = this.querySubject.switchMap((s)=>this.getCourseInfo(s));
  i = 0;

  getCourseInfo(s) {
    console.log(this.i++);
    let params: URLSearchParams = new URLSearchParams();
    params.set("course",s);
    return this.http.get(environment.courseInfoUrl, {search: params}).map(this.extractData);
  }


  private extractData(res: Response) {
    return res.json();
  }

  getSchedule(form){
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });
    return this.http.post(environment.makeScheduleUrl, form, options).map(this.extractData);
  }

  getInfo(s){
    return this.getCourseInfo(s);
    // this.querySubject.next(s);
    // console.log(s);
    // return this.observ;
  }


  // todo: filtering invalid input
}
