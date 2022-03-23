async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    // if (i == 100) console.log(i);
    sum = sum + Math.sqrt(i);
  }
}
const LOOP_SIZE = 1000000000;
async function asyncCall(tag = '') {
  // #1 V8Task
  console.log(tag + ' asyncCall start');
  const start = performance.now();
  // #2 V8Task Insert MicroTask
  var result = await loop(LOOP_SIZE);
  const end = performance.now();
  console.log(tag + ' asyncCall time = ' + (end - start));
}
const start = performance.now();
loop(LOOP_SIZE);
const end = performance.now();
console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
asyncCall("1st: ");
// If comment out below, the async is correct.
// #3 V8Task Loop
loop(LOOP_SIZE);
// asyncCall("2nd: ");
console.log('Program end');
// #4 MicroTask Loop
// #5 MicroTask Loop get end time;
