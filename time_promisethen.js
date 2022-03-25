async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
}
const LOOP_SIZE = 1000000000;

(async function() {
  const promise1 = new Promise((resolve, reject) => {
    console.log('Main # Post MicroTask1 # In Promise new ');
    // Post MicroTask
    resolve('Success From Promise!');
  });
  console.log('Main # after new promise');
  const ret1 = promise1.then((value) => {
    console.log('Microtask1 # posted by Resolve: ' + value);
    return true;
  });
  console.log(ret1);
  loop(LOOP_SIZE);
  console.log('Main # Post MicroTask2');
  console.log('MicroTask2 # ' + await ret1);
  console.log('MicroTask2 # Program end');
})();
