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
  console.warn("V8Task #1 Get start time");
  console.log(tag + ' asyncCall start');
  const start = performance.now();
  // #2 V8Task Insert MicroTask
  console.warn("V8Task #2 Insert MicroTask + executor(loop)");
  var result = await loop(LOOP_SIZE);
  const end = performance.now();
  console.log(tag + ' asyncCall time = ' + (end - start));
  console.warn("V8MicroTask #4 Get end time");
}
const start = performance.now();
loop(LOOP_SIZE);
const end = performance.now();
console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
asyncCall("1st: ");
// #3 V8Task Loop
console.warn("V8Task #3 Main");
console.warn("V8Task #3 Main Loop");
// If comment out below loop, the async is correct.
loop(LOOP_SIZE);
console.warn("V8Task #3 Main end");
// asyncCall("2nd: ");
console.log('Program end');
// #4 MicroTask Loop
// #5 MicroTask Loop get end time;
