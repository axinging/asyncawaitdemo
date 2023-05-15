'use strict';
const kPixelValue = 0x66;
const kPixelValueFloat = 0x66 / 0xff;
const isTFJS = true;
async function getDevice() {
  if (!navigator.gpu) {
    alert(
        `WebGPU is not supported. Please use Chrome Canary browser with flag --enable-unsafe-webgpu enabled.`);
    return;
  }

  let device;
  if (isTFJS) {
    device = tf.backend().device;
  } else {
    const adapter = await navigator.gpu.requestAdapter();
    device = await adapter.requestDevice();
  }

  const canvas = document.getElementById('canvas')
  const swapChain = canvas.getContext('webgpu');

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
  swapChain.configure({
    device,
    format: presentationFormat,
    alphaMode: 'opaque',
  });
  return [device, swapChain, presentationFormat];
}



function writePixelsToWebGPUCanvas(canvas, device) {
  const format = 'bgra8unorm';
  const alphaMode = 'opaque';
  const ctx = canvas.getContext('webgpu');

  ctx.configure({
    device: device,
    format,
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST,
    alphaMode,
  });

  const canvasTexture = ctx.getCurrentTexture();
  const tempTexture = device.createTexture({
    size: {width: 1, height: 1, depthOrArrayLayers: 1},
    format,
    usage: GPUTextureUsage.COPY_SRC | GPUTextureUsage.RENDER_ATTACHMENT |
        GPUTextureUsage.COPY_DST,
  });
  const tempTextureView = tempTexture.createView();
  const encoder = device.createCommandEncoder();

  const clearOnePixel = (origin, color) => {
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: tempTextureView,
          clearValue: color,
          loadOp: 'clear',
          storeOp: 'store'
        },
      ],
    });
    pass.end();
    encoder.copyTextureToTexture(
        {texture: tempTexture}, {texture: canvasTexture, origin},
        {width: 1, height: 1});
  };

  clearOnePixel([0, 0], [0, 0, kPixelValueFloat, kPixelValueFloat]);
  clearOnePixel([1, 0], [0, kPixelValueFloat, 0, kPixelValueFloat]);
  clearOnePixel([0, 1], [kPixelValueFloat, 0, 0, kPixelValueFloat]);
  clearOnePixel(
      [1, 1], [kPixelValueFloat, kPixelValueFloat, 0, kPixelValueFloat]);

  device.queue.submit([encoder.finish()]);
  tempTexture.destroy();

  return canvas;
}

async function readPixelsFromWebGPUCanvas(webgpuCanvas, width, height) {
  const snapshot = await createImageBitmap(webgpuCanvas);
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(snapshot, 0, 0);
  return new Uint8ClampedArray(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data);
}

function getCanvas() {
  return document.getElementById('canvas');
}

function getCanvas2() {
  return document.getElementById('canvas2');
}

var drawContextType = 'webgpu';
const width = 48;
const height = 48;
const tfdraw = false;

async function drawForground(canvas) {
  if (tfdraw) {
    // const imageData = getTransparentData(width, height);
    // console.log(imageData);
    const [imageData, w, h] = await imageUrlToImageData('RPEQQ.png');
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    // context.globalAlpha = 0.5;
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha: 0.5}
    });
  } else {
    var context = canvas.getContext('2d');
    // This is transparent.
    //  drawTransparent(canvas, width, height);

    // This is transparent too.
    /*
    const img = new Image();
    img.src = 'RPEQQ.png';
    await img.decode();
    context.drawImage(img, 0, 0);
    */

    // This is not transparent.
    const [img, w, h] = await imageUrlToImageData('RPEQQ.png');
    context.putImageData(img, 0, 0);
  }
}

async function drawBackground(canvas) {
  const img = new Image();
  // img.src = 'https://i.stack.imgur.com/RPEQQ.png';
  img.src = 'RPEQQ_opaque.jpg';
  await img.decode();
  if (tfdraw) {
    // const imageData = imageToData(img);
    const [imageData, w, h] = await imageUrlToImageData('RPEQQ_opaque.jpg');
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(
        img, canvas, {contextOptions: {contextType: drawContextType}});
  } else {
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
  }
}

async function main(backendName) {
  if (backendName === 'cpu') {
    drawContextType = '2d';
  } else if (backendName === 'webgpu') {
    drawContextType = 'webgpu';
  }
  const canvas = getCanvas2();
  await drawBackground(canvas);
  await drawForground(canvas);
}

function toDataURL(src) {
  var image = new Image();
  image.crossOrigin = 'Anonymous';
  image.onload = function() {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;
    context.drawImage(this, 0, 0);
    var dataURL = canvas.toDataURL('image/jpeg');
    // console.log(dataURL);
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
    var pix = imgd.data;
    console.log(pix);
  };
  image.src = src;
}

async function imageUrlToImageData(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  console.log(canvas.width + ', ' + canvas.height);
  return [
    context.getImageData(0, 0, canvas.width, canvas.height), img.naturalWidth,
    img.naturalHeight
  ];
}

function imageToData(img) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  console.log(canvas.width + ', ' + canvas.height);
  return [
    context.getImageData(0, 0, canvas.width, canvas.height).data,
    img.naturalWidth, img.naturalHeight
  ];
}

function getOpaueData(width, height) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.beginPath();
  context.rect(0, 0, 50, 50);
  context.fillStyle = 'blue';
  context.fill();
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}

function getOpaue(width, height) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.beginPath();
  context.rect(0, 0, 50, 50);
  context.fillStyle = 'blue';
  context.fill();
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function getTransparentData(width, height) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.globalAlpha = 0.5;  // set global alpha
  context.beginPath();
  context.arc(50, 50, 50, 0, 2 * Math.PI, false);
  context.fillStyle = 'red';
  context.fill();
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}

function getForground(width, height) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.globalAlpha = 0.5;  // set global alpha
  context.beginPath();
  context.arc(50, 50, 50, 0, 2 * Math.PI, false);
  context.fillStyle = 'red';
  context.fill();
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function drawTransparent(canvas, width, height) {
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.globalAlpha = 0.5;  // set global alpha
  context.beginPath();
  context.arc(50, 50, 50, 0, 2 * Math.PI, false);
  context.fillStyle = 'red';
  context.fill();
}

function drawOpaque(canvas, width, height) {
  var context = canvas.getContext('2d');
  canvas.height = height;
  canvas.width = width;
  // draw rectangle
  context.beginPath();
  context.rect(0, 0, 50, 50);
  context.fillStyle = 'blue';
  context.fill();
}
