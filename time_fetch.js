const LOOP_SIZE = 1000000000;
function loop(max, tag = '') {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    // if ((i%(LOOP_SIZE/10) ===0) && tag !== '') {
    //     console.log( tag + "," + i + ", "  + performance.now());
    // }
    sum = sum + Math.sqrt(i);
  }
}

async function fetchData() {
  const response = await fetch('http://127.0.0.1:5501/');
  console.log("after await fetchdata");
}
async function foo() {
  console.log('before await, in foo');
  await fetchData();
  console.log('after await, in foo');
  return 1;
}
async function asyncCall(tag) {
  console.log(tag + 'before await foo, in asyncCall');
  const start = performance.now();
  const result = await foo();
  const end = performance.now();
  console.log(tag + 'asyncCall time = ' + (end - start));
  console.log(tag + 'after await foo, in asyncCall');
  console.log(result);
  console.log(tag + 'after promise, in asyncCall');
}

{
  const start = performance.now();
  loop(LOOP_SIZE);
  const end = performance.now();
  console.log(`sync loop 1 (${LOOP_SIZE}) time = ` + (end - start));
}

// First fetch
asyncCall('1st:');
{
  const start = performance.now();
  loop(LOOP_SIZE);
  const end = performance.now();
  console.log(`sync loop 2 (${LOOP_SIZE}) time = ` + (end - start));
}
// Second fetch.
asyncCall('2nd:');
console.log('Program end');

/*
When script is done:
Microtasks: 
1st#await foo()
2nd#await foo()

*/
