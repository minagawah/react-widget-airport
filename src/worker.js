import 'core-js';

const arr = [];

onconnect = (e = {}) => {
  console.log('[airport.worker] ++++ connect');
  const { ports = [] } = e;
  const [port] = ports;

  arr.push(port);

  port.onmessage = (event = {}) => {
    console.log('[airport.worker] ++++ message');
    const { data } = event;
    if (data) {
      arr.forEach(p => {
        p.postMessage(data);
      });
    }
  };

  port.start();
};
