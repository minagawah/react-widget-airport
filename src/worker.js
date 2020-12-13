import 'core-js';

const arr = [];

onconnect = (e = {}) => {
  console.log('(widget::airport.worker) Connected');
  const { ports = [] } = e;
  const [port] = ports;

  arr.push(port);

  port.onmessage = (event = {}) => {
    const { data } = event;
    console.log('(widget::airport.worker) Received a message.');

    if (data) {
      if (data.action && data.action === 'close') {
        console.log('(widget::airport.worker) Closing');
        port.close();
      } else {
        console.log('(widget::airport.worker) Posting: ', data);
        arr.forEach(p => {
          p.postMessage(data);
        });
      }
    } else {
      console.log('(widget::airport.worker) ???? event: ', event);
    }
  };

  port.start();
};
