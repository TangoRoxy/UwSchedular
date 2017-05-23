/**
 * Created by xiyao on 11/19/2016.
 */

var compression = require('compression');
var morgan = require('morgan');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();


app.use(compression());
app.use(morgan('common'));
app.use(bodyParser.json());


// Testing purpose
app.get('/', function (req, res) {
  res.send('Hello World!');
});


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var uwaterlooApi = require('uwaterloo-api');
var uwclient = new uwaterlooApi({
  API_KEY : 'fbacc92a5473805ed1382f4dbe2e229e'
});


app.get('/course', function (req,res) {
  // all call waterloo api to get
  let course = req.query.course;
  console.log(course);
  path = course.replace(/([0-9]*)$/, "/$1");
  if (path && /^[a-zA-Z]{2,5}\/[0-9]{3}/.test(path)) {
    console.log("requesting");
    uwclient.get('/courses/' + path + '/schedule.json', (e, r)=> {
      let d = [];
      r = processData1([r]);
      if (r.length > 0){
        d = filterData4(r, {courses:[{name: course}]});
      }
      res.send(d);
    });
  }
});


app.post('/t', function(req,res){
  console.log(req.body);
  request = req.body.courses.map(x=>x.name.replace(/([0-9]*)$/, "/$1"));
  response = [];
  wait = request.length;
  for (i of request){
    uwclient.get('/courses/'+ i + '/schedule.json', (e,r)=> {
      wait--;
      if (r){
        response.push(r);
      }

      if (wait == 0){
        res.send(makeSchedule1(response,req.body));
        //res.send(filterData(response));
      }
    });
  }
});


function makeSchedule1(r, form){
  r= processData1(r);
  r= filterData4(r, form);
  console.log(r);
  console.log(form);
  result=[];
  addCourse([],0,r,result);
  return [result,r];
}

app.get('/t', function (req,res) {
  // all call waterloo api to get
  // data= ['STAT/331'];
  // response = [];
  // wait = data.length;
  // for (i of data){
  //   uwclient.get('/courses/'+ i + '/schedule.json', (e,r)=> {
  //     wait--;
  //     response.push(r);
  //     if (wait == 0){
  //       res.send(makeSchedule(response));//.map(x=> x.map(filterData)));
  //     }
  //   });
  // }
  console.log(req.query);
  // let course = req.query.course;
  // course = course ? course : "cs/135";
  // uwclient.get('/courses/' + course + '/schedule.json', (e, r)=> {
  //   res.send(r);
  //   console.log(e);
  // })
})  ;


// filtered out useless information;
function processData1(r){
  console.log(r);
  return r.map(x=>x.data).filter(x=>x.length>0);
}


function reformatApiData(section){
  let clas = section.classes[0];
  return {
    class_nb: section.class_number,
    section: section.section,
    canEnrol: section.enrollment_capacity - section.enrollment_total,
    start_time: clas.date.start_time,
    end_time :clas.date.end_time,
    weekdays : clas.date.weekdays,
    location : clas.location.building ? clas.location.building + ' ' + clas.location.room: null,
    instructors: clas.instructors[0]
  };
}


// take an array of response about course schedule;
// separate tut eliminate tus
function filterData4(r, form){
  let showOpenOnly = form.showOpenOnly ? form.showOpenOnly : false;
  result = [];
  // loop through form;
  console.log(r);
  console.log(form);
  for (crit of form.courses){

    // find correct data
    let info;
    for (data of r){
      // console.log("**************************");
      // console.log(data);
      // console.log(crit);
      if (data[0].subject + data[0].catalog_number == crit.name){
        info = data;
        break;
      }
    }
    console.log(info);
    // make shit to push it in result
    classes = [];
    tut = [];
    for (section of info){
      if (section.section.includes("LEC")){
        if ((!crit.section || crit.section == "Any" || crit.section == section.section)
          && (!showOpenOnly || crit.enrolled || section.enrollment_capacity - section.enrollment_total > 0)){
          classes.push(reformatApiData(section));
        }
      } else if (section.section.includes("TUT")){
        // get corresponding related info;
        let r;
        if (crit.related){
          for (comp of crit.related){
            // console.log(section.section);
            // console.log(comp);
            if (comp.section && comp.section.includes("TUT")){
              r = comp;
              break;
            }
          }
        }
        if (!r){
          r = {section: "Any"};
        }
        if ((!r.section || r.section == "Any" || r.section == section.section)
          && (!showOpenOnly || r.enrolled || section.enrollment_capacity - section.enrollment_total > 0)){
          tut.push(reformatApiData(section));
        }
      }
    }
    result.push({
      name: info[0].subject + info[0].catalog_number,
      title: info[0].title,
      type: "LEC",
      classes: classes
    });
    if (tut.length > 0) {
      result.push({
        name: info[0].subject + info[0].catalog_number,
        title: info[0].title,
        type: "TUT",
        classes: tut
      });
    }
  }
  return result;
}


function addCourse(cur, index, data, results){
  if (index >= data.length){
//    console.log("before push", cur);
    results.push(cur);
    return;
  }
  // for each classes of current course
  for (i in data[index].classes){
    let canAdd = true;
    // for each picked courses
    for (j in cur){
      if (dayOverlap(data[index].classes[i], data[j].classes[cur[j]]) &&
        ifOverlap(data[index].classes[i], data[j].classes[cur[j]])){
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
  //    console.log(i);
    //  console.log(cur);
      addCourse(cur.concat([i]), index + 1, data, results);
    }
  }
}

// o.data is an array of classes
// o.xx : general information
// o.classes: [cls]
// cls = {
//   section: stirng,
//   available: bool,
//   start_time: xx,
//   end_time: xx,
//   weekdays: xx,
//   instructor: xx,
//   location: xx,
// }


// TODO: use lambda to make it cooler
// test if there is a common day
function dayOverlap(a,b){
  if (!a.weekdays || !b.weekdays){
    return false;
  }
  a = a.weekdays;
  b = b.weekdays;
  return (a.includes("M") && b.includes("M")) ||
    (a.includes("W") && b.includes("W")) ||
    (a.includes("F") && b.includes("F")) ||
    (a.includes("Th") && b.includes("Th")) ||
    (a.includes("T") && !a.includes("Th") && !b.includes("Th") && b.includes("T"));
}


// check if two interval overlaps
function ifOverlap(a,b){
  if (!a.start_time || !b.start_time){
    return false;
  }
  aS = getMin(a.start_time);
  bS = getMin(b.start_time);
  aE = getMin(a.end_time);
  bE = getMin(b.end_time);
  return (aS <= bS && aE >= bS) || (aS < bE && aE > bE);
}

// t is in the format "18:30"
// return total number of min
function getMin(t){
  t = t.split(":");
  return 60* Number(t[0]) + Number(t[1]);
}


app.listen(80, function () {
  console.log('Node listening on port 80!');
});

