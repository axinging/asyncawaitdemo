const LOOP_SIZE = 1000000000;
function loop(max, tag = '') {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
}

function log(str) {
  console.warn(str);
}
async function fetchData() {
  const response = await fetch('./index.html');
}
async function foo() {
  await fetchData();
  return 1;
}
async function asyncCall(tag) {
  console.log(tag + ' asyncCall start');
  log('V8Task #1 Main ' + tag);
  const start = performance.now();
  const result = await foo();
  log('V8MicroTask #1  ' + tag);
  const end = performance.now();
  console.log(tag + 'asyncCall time = ' + (end - start));
}

{
  const start = performance.now();
  loop(LOOP_SIZE);
  const end = performance.now();
  console.log(`sync loop 1 (${LOOP_SIZE}) time = ` + (end - start));
}

(async function() {
  // First fetch
  log('V8Task #1 Main');
  await asyncCall('1st:');
  {
    const start = performance.now();
    loop(LOOP_SIZE);
    const end = performance.now();
    console.log(`sync loop 2 (${LOOP_SIZE}) time = ` + (end - start));
  }
  // Second fetch.
  await asyncCall('2nd:');
  console.log('Program end');
})();
