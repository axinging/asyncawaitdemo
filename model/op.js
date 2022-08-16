async function addTest() {
  const aValues = [1.0, 2.0, 3.0, NaN];
  const bValues = [1, 2, 3, 4];
  const shape = [4, 1];

  const a = tf.tensor2d(aValues, shape, 'float32');
  const b = tf.tensor2d(bValues, shape, 'int32');

  const r = tf.add(a, b);
  const expected = [];

  for (let i = 0; i < a.size; i++) {
    expected[i] = aValues[i] + bValues[i];
  }

  console.log(await r.data());
  tf.test_util.expectArraysClose(await r.data(), expected);
}


async function less() {
  const aValues = [1.0, 3.0, 3.0, NaN];
  const bValues = [3, 2, NaN, 4];
  const shape = [4, 1];
  const a = tf.tensor2d(aValues, shape, 'float32');
  const b = tf.tensor2d(bValues, shape, 'int32');
  const r = tf.less(a, b);

  const expected = [];

  for (let i = 0; i < a.size; i++) {
    expected[i] = Math['less'](aValues[i], bValues[i]);
  }
  console.log(await r.data());
  tf.test_util.expectArraysClose(await r.data(), expected);
}

async function functionPointer(funcStr) {
  var fn = window[funcStr];
  var fnTF = tf[funcStr];
  const aValues = [1.0, 3.0, 3.0, NaN];
  const bValues = [3, 2, NaN, 4];
  const shape = [4, 1];
  const a = tf.tensor2d(aValues, shape, 'float32');
  const b = tf.tensor2d(bValues, shape, 'float32');
  const r = fnTF(a, b);

  const expected = [];

  for (let i = 0; i < a.size; i++) {
    expected[i] = Math[funcStr](aValues[i], bValues[i]);
  }
  console.log(await r.data());
  console.log(expected);
  tf.test_util.expectArraysClose(await r.data(), expected);
}

async function mainTest() {
  // await addTest();
  await functionPointer('less');
  await functionPointer('atan2');
}

Math.less = function(a, b) {
  return a < b;
}
