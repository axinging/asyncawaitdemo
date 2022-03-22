async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    if (i == 100) console.log(i);
    sum = sum + Math.sqrt(i);
  }
}
const LOOP_SIZE = 1000000000;
async function asyncCall() {
  console.log('asyncCall start');
  const start = performance.now();
  var result = await loop(LOOP_SIZE);
  const end = performance.now();
  console.log('asyncCall time = ' + (end - start));
}
const start = performance.now();
loop(LOOP_SIZE);
const end = performance.now();
console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
asyncCall();
// main loop
// If comment out below, the async is correct.
loop(LOOP_SIZE);
console.log('Program end');
