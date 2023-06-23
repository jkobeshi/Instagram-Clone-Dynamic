import React, { useState, useEffect } from "react";
import moment from "moment";

export default function Timestamp({ timestamp }) {
  //utc time
  //var c = moment.utc().format('YYYY-MM-DD HH:mm:ss')
  //var stillUtc = moment.utc(c).toDate();
  //local time
  //var d = moment(stillUtc).local().format('YYYY-MM-DD HH:mm:ss')
  //var stillUtc2 = moment.utc(d).toDate()
  // var diff = stillUtc2.diff(stillUtc)

  //var date1 = moment(c)
  //var date2 = moment(d)
  //var diff = date2.diff(date1)
  //var x = moment(timestamp, "YYYY-MM-DD hh:mm:ss").fromNow()

  var local_timestamp = moment
    .utc(timestamp)
    .local()
    .format("YYYY-MM-DD HH:mm:ss");
  var now = moment.utc().local().format("YYYY-MM-DD HH:mm:ss");

  var date1 = moment(local_timestamp);
  var date2 = moment(now);
  var duration = moment.duration(date1.diff(date2)).humanize(true);

  //var timezone = moment.tz.guess();
  //console.log(timezone);
  /*
    console.log(timestamp)
    var a = moment(timestamp)


    a = moment.tz(timezone).format('Z')

    console.log(a)

    

    var b = a.fromNow()
    console.log(b)
  */
  return <div>{duration}</div>;
}
