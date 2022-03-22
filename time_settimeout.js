

const [loopCount, control] = getURLState(location.search);

function resolveAfter2Seconds() {
  var promise = new Promise(resolve => {
    console.log('new Promise executor');
    // const start = performance.now();

    setTimeout(() => {
      // const end = performance.now();
      // console.log('setTimeout time = ' + (end - start));
      resolve('resolved');
    }, 2000);
  });
  console.log('resolveAfter2Seconds end');
  return promise;
}

async function asyncCall() {
  console.log('asyncCall start');
  const start = performance.now();
  console.log('asyncCall start = ' + start);
  var result = await resolveAfter2Seconds();
  const end = performance.now();
  console.log('asyncCall time = ' + (end - start));
  console.log(result);
  console.log('asyncCall end');
}

function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
}

const LOOP_SIZE = 1000000000 * loopCount;
const start = performance.now();
if (control != 1) {
  loop(LOOP_SIZE);
}
const end = performance.now();
console.log(`sync loop (${LOOP_SIZE}) time = ` + (end - start));
asyncCall();
loop(LOOP_SIZE);
console.log('Program end');
