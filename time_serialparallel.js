const [loopCount, control] = getURLState(location.search);
// wait ms milliseconds
function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function series() {
  const start1 = performance.now();
  await wait(500);
  const start2 = performance.now();
  console.log("series#wait 1: " + (start2-start1));
  await wait(500);
  const end = performance.now();
  console.log("series#wait 2: " + (end-start2));
  return 'done!';
}


async function parallel() {
  const wait1 = wait(500);
  const wait2 = wait(500);
  const start1 = performance.now();
  await wait1;
  const start2 = performance.now();
  console.log("parallel#wait 1: " + (start2-start1));
  await wait2;
  const end = performance.now();
  console.log("parallel#wait 2: " + (end-start2));
  return 'done!';
}


if (control == 0) series();
else parallel();

