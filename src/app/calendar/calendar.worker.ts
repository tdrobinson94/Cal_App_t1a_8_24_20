/// <reference lib="webworker" />
import * as moment from 'moment';


addEventListener('message', ({ data }) => {
  const response = `worker response to ${data}`;
  postMessage(response);
});
