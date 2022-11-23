function createStagingGPUBufferFromData(device, data, dtype) {
  const bytesPerElement = 4;
  const sizeInBytes = data.length * bytesPerElement;

  const gpuWriteBuffer = device.createBuffer({
    mappedAtCreation: true,
    size: sizeInBytes,
    usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
  });
  const arrayBuffer = gpuWriteBuffer.getMappedRange();
  if (dtype === 'float32') {
    new Float32Array(arrayBuffer).set(data);
  } else if (dtype === 'int32') {
    new Int32Array(arrayBuffer).set(data);
  } else {
    throw new Error(
        `Creating tensor from GPUBuffer only supports` +
        `'float32'|'int32' dtype, while the dtype is ${dtype}.`);
  }
  gpuWriteBuffer.unmap();
  return gpuWriteBuffer;
}

function createGPUBufferFromData(
    device, data, dtype,
    bufferUsage = GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC) {
  const bytesPerElement = 4;
  const sizeInBytes = data.length * bytesPerElement;

  const gpuWriteBuffer = createStagingGPUBufferFromData(device, data, dtype);
  const gpuReadBuffer = device.createBuffer(
      {mappedAtCreation: false, size: sizeInBytes, usage: bufferUsage});

  const copyEncoder = device.createCommandEncoder();
  copyEncoder.copyBufferToBuffer(
      gpuWriteBuffer, 0, gpuReadBuffer, 0, sizeInBytes);
  device.queue.submit([copyEncoder.finish()]);
  gpuWriteBuffer.destroy();
  return gpuReadBuffer;
}

function acquireBuffer(device, size, usage, mappedAtCreation = false) {
  const newBuffer = device.createBuffer({size, usage, mappedAtCreation});
  return newBuffer;
}

function copyBuffer(device, srcBuffer, size, usage) {
  const dstBuffer = acquireBuffer(device, size, usage);
  const copyEncoder = device.createCommandEncoder();
  const querySet = device.createQuerySet({
    type: 'timestamp',
    count: 2,
  });
  copyEncoder.writeTimestamp(querySet, 0);
  copyEncoder.copyBufferToBuffer(srcBuffer, 0, dstBuffer, 0, size);
  copyEncoder.writeTimestamp(querySet, 1);
  const copyCommands = copyEncoder.finish();
  device.queue.submit([copyCommands]);
  dstBuffer.destroy();
  return querySet;
}

async function getTimeFromQuerySet(device, querySet) {
  const queryBuffer = acquireBuffer(
      device, 16, GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE);
  const dst = acquireBuffer(
      device, 16, GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST);
  const currentCommandEncoder = device.createCommandEncoder();
  currentCommandEncoder.resolveQuerySet(querySet, 0, 2, queryBuffer, 0);
  currentCommandEncoder.copyBufferToBuffer(queryBuffer, 0, dst, 0, 16);
  device.queue.submit([currentCommandEncoder.finish()]);

  await dst.mapAsync(GPUMapMode.READ);
  const arrayBuf = new BigUint64Array(dst.getMappedRange());
  const timeElapsedNanos = Number((arrayBuf[1] - arrayBuf[0]));
  dst.unmap();
  // Release buffer.
  queryBuffer.destroy();
  // Return milliseconds.
  return timeElapsedNanos / 1000000;
}

async function getDevice() {
  const gpuDescriptor = {powerPreference: 'high-performance'};

  const adapter = await navigator.gpu.requestAdapter(gpuDescriptor);
  const deviceDescriptor = {};

  deviceDescriptor.requiredFeatures =
      // tslint:disable-next-line:no-any
      ['timestamp-query'];
  const adapterLimits = adapter.limits;
  deviceDescriptor.requiredLimits = {
    'maxComputeWorkgroupStorageSize':
        adapterLimits.maxComputeWorkgroupStorageSize,
    'maxComputeWorkgroupsPerDimension':
        adapterLimits.maxComputeWorkgroupsPerDimension,
    'maxStorageBufferBindingSize': adapterLimits.maxStorageBufferBindingSize,
  };

  return await adapter.requestDevice(deviceDescriptor);
}

function genData(shapeSize) {
  let data = [];
  for (let i = 0; i < shapeSize; i++) {
    data[i] = Math.random();
  }
  return data;
}

function sizeFromShape(shape) {
  if (shape.length === 0) {
    return 1;
  }
  let size = shape[0];
  for (let i = 1; i < shape.length; i++) {
    size *= shape[i];
  }
  return size;
}

async function testCreateTensorFromGPUBuffer(shape) {
  const device = await getDevice();
  const dtype = 'float32';
  const aData = genData(sizeFromShape(shape));
  const aBuffer = createGPUBufferFromData(device, aData, dtype);
  const querySet = copyBuffer(device, aBuffer, aData.length * 4, aBuffer.usage);
  aBuffer.destroy();
  const time = await getTimeFromQuerySet(device, querySet);
  return time;
}

async function testOne(shape) {
  const times = [];
  for (let i = 0; i < 10; i++) {
    const time = await testCreateTensorFromGPUBuffer(shape);
    times.push(time.toFixed(2));
  }
  console.log(shape + ': ' + times);
}

async function mainTest() {
  await testOne([112, 112, 3]);
  await testOne([224, 224, 3]);
  await testOne([576, 576, 3]);
  await testOne([1024, 1024, 3]);
}
