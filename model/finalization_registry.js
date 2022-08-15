async function finalization_registry() {
  const start = tf.memory().numTensors;
  let waitingForCleanup = true;
  const startTime = Date.now();
  const aData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  {
    console.log('Case will leak 1 tensor');

    const dtype = 'float32';
    let a = tf.tensor2d(aData, [8, 2], dtype);
    a = null;
    let end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));

    let b = tf.tensor2d(aData, [8, 2], dtype);
    end = tf.memory().numTensors;
    console.log(' end = ' + end + ', leak = ' + (end - start));

    const registry = new FinalizationRegistry((heldValue) => {
      console.log(`cleanup: ${heldValue}`);
      console.log(`cleanup was called after ${
          ((Date.now() - startTime) / 1000).toFixed(1)}s`);
      waitingForCleanup = false;
    });

    registry.register(b, 'Tensor b');
    b = null;
  }
  let end = tf.memory().numTensors;
  console.log(' end = ' + end + ', leak = ' + (end - start));


  console.log('Allocating a lot of objects to try to force garbage collection');
  while (waitingForCleanup) {
    for (let i = 0; i < 100; i++) {
      const x = new Array(100);
    }
    await sleep(1000);
    console.log('wait');
  }
  console.log(`FinalizationRegistry was called after ${
      ((Date.now() - startTime) / 1000).toFixed(1)}s`);
  end = tf.memory().numTensors;
  console.log(' end = ' + end + ', leak = ' + (end - start));
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));