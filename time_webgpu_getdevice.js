

const [loopCount, control] = getURLState(location.search);
function loop(max, tag = '') {
  var sum = 0;
  console.log('Loop begin');
  const start = performance.now();
  for (var i = 0; i < max; i++) {
    sum = sum + Math.sqrt(i);
  }
  const end = performance.now();
  console.log('Loop time: ' + (end - start));
}

/*
(async () => {
  await runProgram();
})();
*/


async function getDevice() {
  if (!navigator.gpu) {
    console.log(
        'WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag.');
    return;
  }

  const gpuDescriptor = {powerPreference: 'high-performance'};

  const adapter = await navigator.gpu.requestAdapter(gpuDescriptor);
  let deviceDescriptor = {};
  const supportTimeQuery = adapter.features.has('timestamp-query');

  if (supportTimeQuery) {
    deviceDescriptor = {requiredFeatures: ['timestamp-query']};
  } else {
    console.warn(`This device doesn't support timestamp-query extension.`);
  }
  return await adapter.requestDevice(deviceDescriptor);
}

async function runProgram() {
  const start = performance.now();
  const device = await getDevice();
  const end = performance.now();
  console.log('await runProgram: ' + (end - start));
  return device;
}

const LOOP_SIZE = 1000000000;
loop(LOOP_SIZE * loopCount);
runProgram();
// time of run program() = loop + await getDevice time.
// Possible reason: getDevice happens in the main thread.
// In this case, main thread has no chance to get device until
// loop is done.
// (start time) Main script task; getDevice micro task; (end time);
loop(LOOP_SIZE * loopCount);
console.log('Program end');
