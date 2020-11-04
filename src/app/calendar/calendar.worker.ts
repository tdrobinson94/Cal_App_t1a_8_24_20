/// <reference lib="webworker" />
import * as moment from 'moment';

addEventListener('message', ({ data }) => {
  let i;
  let eventlist = [];
  for (i = 0; i < data.length; i++) {
    // console.log(data)
    eventlist[i] = {
      eventid: data[i].id.toString(),
      eventtitle: data[i].title,
      eventstart_date: data[i].start_date.substring(0, 10),
      eventend_date: data[i].end_date.substring(0, 10),
      eventdesc: data[i].description,
      eventlocation: data[i].location,
      eventfrequency: data[i].frequency,
      eventstart_time: moment(data[i].start_time, 'HH:mm:ss').format('h:mm A'),
      eventend_time: moment(data[i].end_time, 'HH:mm:ss').format('h:mm A'),
      eventcreatedAt: moment(data[i].created_at).format(),
      itemtype: data[i].item_type.toString()
    };
  }

  const response = `${JSON.stringify(eventlist)}`;
  postMessage(response);
});
