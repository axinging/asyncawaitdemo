async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
}
const LOOP_SIZE = 1000000000;
async function asyncCall(tag = '') {
  // #1 V8Task
  console.warn('#1 V8Task Get start time');
  console.log(tag + ' asyncCall start');
  const start = performance.now();
  // #2 V8Task Loop + Insert MicroTask 1
  console.warn('#2 V8Task executor(loop) + Insert MicroTask');
  // V8Task ends here.
  var result = await loop(LOOP_SIZE);
  const end = performance.now();
  console.log(tag + ' asyncCall time = ' + (end - start));
  console.warn('#3 MicroTask  Get end time');
  // #3 MicroTask end.
  // #3 Insert MicroTask 2.
}

(async function() {
  const start = performance.now();
  loop(LOOP_SIZE);
  const end = performance.now();
  console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
  await asyncCall('1st: ');
  //#4 Microtask 2.
  console.warn('$4 Microtask 2');
  console.warn('$4 Microtask 2 Main loop');
  loop(LOOP_SIZE);
  console.warn('$4 Microtask 2 Main loop end');
  // asyncCall("2nd: ");
  console.log('Program end');
  // #4 MicroTask Loop
  // #5 MicroTask Loop get end time;
})();
