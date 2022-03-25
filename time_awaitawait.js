async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    // if (i == 100) console.log("loop");
    sum = sum + Math.sqrt(i);
  }
  // await loop2(max);
}

async function loop2(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    // if (i == 100) console.log("loop2");
    sum = sum + Math.sqrt(i);
  }
}

const LOOP_SIZE = 1000000000;
async function asyncCall(tag = '') {
  {
    console.log(
        tag + '1:' +
        ' asyncCall start');
    console.warn('#2 V8Task Get start time');
    const start = performance.now();
    console.warn('#3 V8Task Insert MicroTask1 + executor(loop)');
    var result = await loop(LOOP_SIZE);
    const end = performance.now();
    console.log(
        tag + '1:' +
        ' MicroTask1 asyncCall time = ' + (end - start));
    console.warn('#5 MicroTask1 Get end time');
  }
  {
    console.log(
        tag + '2:' +
        ' asyncCall start');
    console.warn('#5 MicroTask1 Insert MicroTask2 + executor(loop) + Get start time');
    const start = performance.now();
    var result = await loop(LOOP_SIZE);
    const end = performance.now();
    console.log(
        tag + '2:' +
        ' asyncCall time = ' + (end - start));
    console.warn('#5 MicroTask2 Get end time');
  }
}

const start = performance.now();
loop(LOOP_SIZE);
const end = performance.now();
console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
console.warn('#1 V8Task');
asyncCall('1st: ');
// main loop
// If comment out below, the async is correct.
console.warn('#4 V8Task Loop');
loop(LOOP_SIZE);
// asyncCall('2nd: ');
console.warn('#4 V8Task');
console.log('Program end');

/*
(async function() {
    const start = performance.now();
    loop(LOOP_SIZE);
    const end = performance.now();
    console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
    await asyncCall('1st: ');
    // main loop
    // If comment out below, the async is correct.
    loop(LOOP_SIZE);
    // asyncCall('2nd: ');
    console.log('Program end');
  })();
*/
