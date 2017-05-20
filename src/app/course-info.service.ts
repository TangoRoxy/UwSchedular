import { Injectable } from '@angular/core';
import { Http, Response }          from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {environment} from '../environments/environment';

@Injectable()
export class CourseInfoService {

  constructor(private http: Http) { }

  getCourseInfo() {
    return this.http.get(environment.courseInfoUrl).map(this.extractData);
  }

  private extractData(res: Response) {
    let body = res.json();
    return body.data || { };
  }

}
