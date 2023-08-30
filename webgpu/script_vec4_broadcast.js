// https://developers.google.com/web/updates/2019/08/get-started-with-gpu-compute-on-the-web
// import glslangInit from '@webgpu/glslang/dist/web-devel/glslang.onefile';
function acquireBuffer(device, byteSize, usage) {
  const newBuffer = device.createBuffer({size: byteSize, usage: usage});
  return newBuffer;
}

function getComputeShaderBad(workaround = 0) {
  const workaroundStr = workaround ? ' + 1u - 1u' : '';
  return ` 
  @group(0) @binding(0) var<storage, read> aData: array<vec4<f32>>;
  @group(0) @binding(1) var<storage, read_write> outputData: array<vec4<f32>>;
  
  fn o2i_outputData(offset: u32) -> vec2<u32> {
    var indices: vec2<u32>;
    var current = offset;
    
    let dim0 = current / 6u;
    let rest0 = current % 6u;
    indices[0] = dim0;
    current = rest0;
    indices[1] = current;
    return indices;
  }

  fn calcOffsetA(outputIndices: vec2<u32>) -> u32 {
    return 1u * (outputIndices[1] % 6u)+6u * (outputIndices[0] % 4u);
  }

  @compute @workgroup_size(64, 1, 1)
  fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let global_idx = global_id.x;
  
    if (global_idx >= 6u) { return; }  
    
    let outputIndices0 = o2i_outputData(global_idx * 4u + 0u);
    let offsetA0 = calcOffsetA(outputIndices0);
    let indexA0 = offsetA0 / 4u;
    let componentA0 = offsetA0 % 4u;
    outputData[global_idx][0] = aData[indexA0][componentA0];
    
    let outputIndices1 = o2i_outputData(global_idx * 4u + 1u);
    let offsetA1 = calcOffsetA(outputIndices1);
    let indexA1 = offsetA1 / 4u;
    let componentA1 = offsetA1 % 4u;
    outputData[global_idx][1] = aData[indexA1][componentA1];

    let outputIndices2 = o2i_outputData(global_idx * 4u + 2u);
    let offsetA2 = calcOffsetA(outputIndices2);
    let indexA2 = offsetA2 / 4u;
    let componentA2 = offsetA2 % 4u;
    outputData[global_idx][2] = aData[indexA2][componentA2];
    
    let idx3 = global_idx * 4u + 3u;
    let outputIndices3 = o2i_outputData(idx3);
    let offsetA3 = calcOffsetA(outputIndices3);
    let indexA3 = offsetA3 / 4u;
    let componentA3 = offsetA3 % 4u${workaroundStr};
    outputData[global_idx][3] = aData[indexA3][componentA3];
  }
`;
}


function defaultGpuBufferUsage() {
  return GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST;
}

async function runTest(device, shaderWgsl) {
  // First Matrix
  const firstMatrix = new Float32Array([
    0,  1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ]);

  const gpuBufferFirstMatrix = device.createBuffer({
    mappedAtCreation: true,
    size: firstMatrix.byteLength,
    usage: GPUBufferUsage.STORAGE
  });
  const arrayBufferFirstMatrix = gpuBufferFirstMatrix.getMappedRange();
  new Float32Array(arrayBufferFirstMatrix).set(firstMatrix);
  gpuBufferFirstMatrix.unmap();

  // Result Matrix
  const sizeA = 4;
  const sizeB = 6;
  const resultMatrixBufferSize =
      Float32Array.BYTES_PER_ELEMENT * (sizeA * sizeB);
  const resultMatrixBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
  });

  // Compute shader code (GLSL)

  // Pipeline setup
  // const shaderWgsl = getComputeShaderBad();
  const computePipeline = device.createComputePipeline({
    layout: 'auto',
    compute: {
      module: device.createShaderModule({code: shaderWgsl}),
      entryPoint: 'main'
    }
  });

  const bindGroupLayout = computePipeline.getBindGroupLayout(0);
  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {binding: 0, resource: {buffer: gpuBufferFirstMatrix}},
      {binding: 1, resource: {buffer: resultMatrixBuffer}}
    ]
  });
  // Commands submission

  const commandEncoder = device.createCommandEncoder();

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(computePipeline);
  passEncoder.setBindGroup(0, bindGroup);
  const workPerThread = 4;
  passEncoder.dispatchWorkgroups(
      Math.ceil(sizeA * sizeB / workPerThread / 64) /* x */, 1 /* y */);
  passEncoder.end();

  // Get a GPU buffer for reading in an unmapped state.
  const gpuReadBuffer = device.createBuffer({
    size: resultMatrixBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
  });

  // Encode commands for copying buffer to buffer.
  commandEncoder.copyBufferToBuffer(
      resultMatrixBuffer /* source buffer */, 0 /* source offset */,
      gpuReadBuffer /* destination buffer */, 0 /* destination offset */,
      resultMatrixBufferSize /* size */
  );

  // Submit GPU commands.
  const gpuCommands = commandEncoder.finish();
  device.queue.submit([gpuCommands]);

  gpuBufferFirstMatrix.destroy();
  resultMatrixBuffer.destroy();

  // Read buffer.
  await gpuReadBuffer.mapAsync(GPUMapMode.READ);
  const arrayBuffer = gpuReadBuffer.getMappedRange();
  console.log(new Float32Array(arrayBuffer));
}


(async () => {
  if (!navigator.gpu) {
    console.log(
        'WebGPU is not supported. Enable chrome://flags/#enable-unsafe-webgpu flag.');
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter.requestDevice();
  console.log('Run original case:');
  await runTest(device, getComputeShaderBad(0));
  console.log('Run case with workaround:');
  await runTest(device, getComputeShaderBad(1));
})();
