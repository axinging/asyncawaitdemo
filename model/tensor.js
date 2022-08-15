async function tensorTest() {
  {
    console.log('Case will leak 1 tensor');
    const start = tf.memory().numTensors;
    const aData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const dtype = 'float32';
    let a = tf.tensor2d(aData, [8, 2], dtype);
    a = null; // Leak!
    const end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));
  }
  {
    console.log('Case add will leak 1 tensor');
    const start = tf.memory().numTensors;
    const aData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const dtype = 'float32';
    const b =
        new Float32Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
    const a = tf.tensor2d(aData, [8, 2], dtype);
    const result = tf.add(a, tf.tensor2d(b, [8, 2])); // Leak!
    await result.data();
    result.dispose();
    a.dispose();
    const end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));
  }
  {
    console.log('Case add will not leak in tidy');
    const start = tf.memory().numTensors;
    const sum = tf.tidy(() => {
      const aData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
      const dtype = 'float32';
      const b =
          new Float32Array([1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4]);
      const a = tf.tensor2d(aData, [8, 2], dtype);
      const result = tf.add(a, tf.tensor2d(b, [8, 2]));

      a.dispose();
      return result;
    });
    await sum.data();
    sum.dispose();
    const end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));
  }

  {
    console.log('Case scalar leak 3');
    const start = tf.memory().numTensors;
    const res = tf.add(tf.scalar(1, 'int32'), tf.scalar(true, 'bool')); // Leak!
    const end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));
  }
  {
    console.log('Case tidy no leak');
    const start = tf.memory().numTensors;
    tf.tidy(() => {
      const a = tf.scalar(1);
      tf.square(a);  // Uploads to GPU.
      const b = tf.scalar(1);
      tf.square(b);  // Uploads to GPU.
    });
    const end = tf.memory().numTensors;
    console.log(
        'start = ' + start + ', end = ' + end + ', leak = ' + (end - start));
  }
}