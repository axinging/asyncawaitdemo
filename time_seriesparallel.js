const [loopCount, control] = getURLState(location.search);
// wait ms milliseconds
function wait(tag, ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function series() {
  const start = performance.now();
  await wait('1st: ', 2000);
  const start2 = performance.now();
  console.log('series#wait 1: ' + (start2 - start));
  await wait('2nd: ', 2000);
  const end = performance.now();
  console.log('series#wait 2: ' + (end - start2));
  console.log('series#wait 1+2: ' + (end - start));
  return 'done!';
}


async function parallel() {
  const wait1 = wait('1st: ', 2000);
  const wait2 = wait('2nd: ', 2000);
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
