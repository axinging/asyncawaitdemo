const [loopCount, control] = getURLState(location.search);
async function loop(max) {
  var sum = 0;
  for (var i = 0; i < max; i++) {
    if (i == 100) console.log(i);
    sum = sum + Math.sqrt(i);
  }
}

const LOOP_SIZE = 1000000000;
async function wait(tag = '') {
  console.log(tag + ' wait start');
  const start = performance.now();
  var result = await loop(LOOP_SIZE);
  const end = performance.now();
  console.log(tag + ' wait time = ' + (end - start));
}

async function series() {
  const start = performance.now();
  await wait("1st: ");
  const start2 = performance.now();
  console.log('series#wait 1: ' + (start2 - start));
  await wait("2nd: ");
  const end = performance.now();
  console.log('series#wait 2: ' + (end - start2));
  console.log("series#wait 1+2: " + (end-start));
  return 'done!';
}


async function parallel() {
  const wait1 = wait("1st: ");
  const wait2 = wait("2nd: ");
  const start = performance.now();
  await wait1;
  const start2 = performance.now();
  console.log('parallel#wait 1: ' + (start2 - start));
  await wait2;
  const end = performance.now();
  console.log('parallel#wait 2: ' + (end - start2));
  console.log('parallel#wait 1+2: ' + (end - start));
  return 'done!';
}


if (control == 0)
  series();
else
  parallel();
