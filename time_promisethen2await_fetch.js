async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
}
const LOOP_SIZE = 1000000000;

async function fetchData() {
  console.log("Main # Post MicroTask1 # In Promise new ");
  const response = await fetch('./index.html');
  // 1. Main thread post task to network; 
  // 2. When network thread is done, post MicroTask into main thread.
  console.log("Microtask1 # posted by Chromium network");
  return true;
}

(async function() {
  const fetchPromise = fetch('./index.html');
  const ret1 = fetchData();

  console.log('Main # after new promise(fetch)');
  console.log(ret1);
  loop(LOOP_SIZE);
  console.log('Main # Post MicroTask2');
  console.log('MicroTask2 # ' + await ret1);
  console.log('MicroTask2 # Program end');
})();
