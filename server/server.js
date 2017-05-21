/**
 * Created by xiyao on 11/19/2016.
 */

// var sql = require('mysql');
//
// var config = {
//   user: 'root',
//   password: 'tangotango',
//   server: 'localhost',
//   port: 3306,
//   database: 'fh'
// };

var compression = require('compression');
var morgan = require('morgan');
var express = require('express');
var app = express();


app.use(compression());
app.use(morgan('common'));


// params processing, input checking, default input
// app.use((req,res,next)=>{
//     if (!req.query.limit) {
//       req.query.limit = 8;
//     } else if (req.query.limit > 100) {
//       req.query.limit = 100;
//     }
//     console.log(req.query);
//     next();
//   }
// );


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
  course = course.replace(/([0-9]*)$/, "/$1");
  if (course && /^[a-zA-Z]{2,4}\/[0-9]{3}/.test(course)) {
    console.log("requesting");
    uwclient.get('/courses/' + course + '/schedule.json', (e, r)=> {
      d = filterData([r]);
      res.send(d);
    });
  }
});




app.get('/do', function (req,res) {
  // all call waterloo api to get
  data= ['CS/245', 'CS/246', 'CS/251', 'MATH/239'];
  response = [];
  wait = data.length;
  for (i of data){
    uwclient.get('/courses/'+ i + '/schedule.json', (e,r)=> {
      wait--;
      response.push(r);
      if (wait == 0){
        res.send(makeSchedule(response));
        //res.send(filterData(response));
      }
    });
  }
});

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
  let course = "cs/135";
  uwclient.get('/courses/' + course + '/schedule.json', (e, r)=> {
    res.send(r);
  })
})  ;

// TODO: filter with weekday, split tutorial out.
function makeSchedule(data){
  //
  // open class only
  // filter
  // if possible: send back cleaned send back everything and list of selection i.e [0,0,0,0,0]
  results  = [];
  // clean data;
  // filter data;
  data = filterData(data);

  addCourse([],0, data, results);
  return [data, results];
}

function addCourse(cur, index, data, results){
  if (index >= data.length){
    console.log("before push", cur);
    results.push(cur);
    return;
  }
  // for each classes of current course
  for (i in data[index].classes){
    let canAdd = true;
    // for each picked courses
    for (j in cur){
      if (ifOverlap(data[index].classes[i], data[j].classes[cur[j]]) &&
        ifOverlap(data[index].classes[i], data[j].classes[cur[j]])){
        canAdd = false;
        break;
      }
    }
    if (canAdd) {
      console.log(i);
      console.log(cur);
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
function dayOverlap(a,b){
  a = a.weekdays;
  b = b.weekdays;
  return (a.includes("M") && b.includes("M")) ||
    (a.includes("W") && b.includes("W")) ||
    (a.includes("F") && b.includes("F")) ||
    (a.includes("Th") && b.includes("Th")) ||
    (a.includes("T") && !a.includes("Th") && !b.includes("Th") && b.includes("T"));
}

// function filterData(o){
//   o = o.data;
//   classes = [];
//   for (i of o){
//     a = i.classes[0];
//     classes.push({
//       class_nb: i.class_number,
//       section: i.section,
//       canEnrol: i.enrollment_capacity - i.enrollment_total,
//       start_time: a.date.start_time,
//       end_time :a.date.end_time,
//       weekdays : a.date.weekdays,
//       location : a.location,
//       instructors: a.instructors
//     });
//   }
//   return {
//     name: o[0].subject + o[0].catalog_number,
//     title: o[0].title,
//     classes: classes
//   }
// }


// take an array of response about course schedule;
// separate tut eliminate tus
// TODO: handle no data
function filterData(d){
  data = [];
  for (o of d){
    o = o.data;
    classes = [];
    tut = [];
    for (i of o){
      a = i.classes[0];
      if (i.section.includes("LEC")){
        classes.push({
          class_nb: i.class_number,
          section: i.section,
          canEnrol: i.enrollment_capacity - i.enrollment_total,
          start_time: a.date.start_time,
          end_time :a.date.end_time,
          weekdays : a.date.weekdays,
          location : a.location,
          instructors: a.instructors
        });
      }
      if (i.section.includes("TUT")){
        tut.push({
          class_nb: i.class_number,
          section: i.section,
          canEnrol: i.enrollment_capacity - i.enrollment_total,
          start_time: a.date.start_time,
          end_time :a.date.end_time,
          weekdays : a.date.weekdays,
          location : a.location,
          instructors: a.instructors
        });
      }
    }
    if (o.length > 0) {
      data.push({
        name: o[0].subject + o[0].catalog_number,
        title: o[0].title,
        type: "LEC",
        classes: classes
      });
      if (tut.length > 0) {
        data.push({
          name: o[0].subject + o[0].catalog_number,
          title: o[0].title,
          type: "TUT",
          classes: tut
        });
      }
    }
  }
  return data;
}

// input "18:30"
function ifOverlap(a,b){
  aS = getMin(a.start_time);
  bS = getMin(b.start_time);
  aE = getMin(a.end_time);
  bE = getMin(b.end_time);
  return (aS < bS && aE > bE) || (aS < bE && aE > bE);
}

// t is in the format "18:30"
function getMin(t){
  t = t.split(":");
  return 60* t[0] + t[1];
}

// instructor
// already enrolled
// closed class
function filter(data, criteria){
  if (criteria){
    data.filter(x =>{
      if (!criteria.showClosed){
        return x.canEnroll > 0;
      }
    })
  }
}
//
// // Dump all products
// app.get('/productAll', function (req, res) {
//   var connection = sql.createConnection(config);
//   connection.connect();
//
//   connection.query('SELECT * FROM product ORDER BY discount DESC', function(err, rows, fields) {
//     if (err) throw err;
//
//     console.log(rows[0].name);
//     res.send(rows);
//   });
//   connection.end();
// });
//
//
// // Dump all stores
// app.get('/storeAll', (req,res) => {
//     var connection = sql.createConnection(config);
//     connection.connect();
//
//     connection.query('SELECT * FROM store', function(err, rows, fields) {
//       if (err) throw err;
//
//       console.log(rows[0].name);
//       res.send(rows);
//     });
//
//     connection.end();
//   }
// );
//
// // Filter product by categories, sort by discount amount
// app.get('/product', function (req, res) {
//   var connection = sql.createConnection(config);
//   connection.connect();
//
//
//   connection.query(`SELECT * FROM product WHERE category="${req.query.category}" ORDER BY discount DESC`, function(err, rows, fields) {
//     if (err) throw err;
//
//     console.log(rows[0].name);
//     res.send(rows[0]);
//   });
//   connection.end();
// });
//
//
// app.get('/store', function (req, res) {
//   var connection = sql.createConnection(config);
//   connection.connect();
//
//   connection.query(`SELECT * FROM store WHERE category="${req.query.category}"`, function(err, rows, fields) {
//     if (err) throw err;
//
//     console.log(rows[0].name);
//     res.send(rows[0]);
//   });
//   connection.end();
// });

// sort by approximity

// and get store as well



app.listen(80, function () {
  console.log('Node listening on port 80!');
});

