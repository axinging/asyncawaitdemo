'use strict';
// 'https://i.stack.imgur.com/RPEQQ.png';

async function main() {
  let localBuild = ['core', 'cpu', 'webgpu', 'webgl', 'tfjs-converter'];
  await loadTFJS(localBuild);
  await testTFDrawAlpha('cpu');
  await testTFDrawAlpha('webgpu');
  await testCanvasDrawAlpha();
  await testCanvasPutImageDataAlpha();
  await testDrawComposite();
  await testTFDrawAlphaGray('cpu');
  await testTFDrawAlphaGray('webgpu');
}

function appendCanvas(canvasInfo) {
  const canvasArea = document.getElementById('canvas_area');
  var newFieldSet = document.createElement('fieldset');
  let innerHTML = `<legend>${canvasInfo.legend}</legend>`;
  canvasInfo['canvases'].forEach(
      item => innerHTML +=
      `${item.text}<canvas id="${item.id}" width="48" height="48"></canvas>`);
  newFieldSet.innerHTML = innerHTML;
  canvasArea.appendChild(newFieldSet);
}

async function testTFDrawAlpha(backendName) {
  await tf.setBackend(backendName);
  await tf.ready();
  tfdraw = true;
  drawContextType = getContextName(backendName);
  let dataURL1, dataURL2;
  {
    const canvas = document.getElementById(`tfdraw_alpha_${backendName}_1`);
    await drawBackground(canvas, 0.3);
    dataURL1 = canvas.toDataURL();
  }
  {
    const canvas = document.getElementById(`tfdraw_alpha_${backendName}_2`);
    await drawBackground(canvas, 1.0);
    dataURL2 = canvas.toDataURL();
  }
  if (dataURL1 === dataURL2) {
    console.error('Opacity not work!');
  }
}

async function testTFDrawAlphaGray(backendName) {
  const idPrefix = 'tf.draw AlphaGray test';
  const canvasInfo = {
    'legend': `${idPrefix}(${backendName}):`,
    'canvases': [
      {
        'text': `Draw by tf.draw(${backendName}), alpha = 0.3:`,
        'id': `${idPrefix}_${backendName}_1`
      },
      {
        'text': `Draw by tf.draw(${backendName}), alpha = 0.9:`,
        'id': `${idPrefix}_${backendName}_2`
      }
    ]
  };

  appendCanvas(canvasInfo);
  await tf.setBackend(backendName);
  await tf.ready();
  tfdraw = true;
  drawContextType = getContextName(backendName);
  let dataURL1, dataURL2;
  {
    const canvas = document.getElementById(`${idPrefix}_${backendName}_1`);
    await drawBackgroundGray(canvas, 0.3);
    dataURL1 = canvas.toDataURL();
  }
  {
    const canvas = document.getElementById(`${idPrefix}_${backendName}_2`);
    await drawBackgroundGray(canvas, 1.0);
    dataURL2 = canvas.toDataURL();
  }
  if (dataURL1 === dataURL2) {
    console.error('Opacity not work!');
  }
}

async function testCanvasDrawAlpha() {
  let backendName = 'cpu';
  tfdraw = false;
  drawContextType = getContextName(backendName);
  let dataURL1, dataURL2;
  {
    const canvas = document.getElementById('canvas_draw_alpha_1');
    await drawBackground(canvas, 0.3);
    dataURL1 = canvas.toDataURL();
  }
  {
    const canvas = document.getElementById('canvas_draw_alpha_2');
    await drawBackground(canvas, 0.9);
    dataURL2 = canvas.toDataURL();
  }
  if (dataURL1 === dataURL2) {
    console.error('Opacity not work!');
  }
}

async function putImageDataByCanvas(canvas, alpha) {
  const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
  for (var i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i + 3] = 255 * alpha;
  }
  var context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
}

async function testCanvasPutImageDataAlpha() {
  let backendName = 'cpu';
  tfdraw = false;
  drawContextType = getContextName(backendName);
  let dataURL1, dataURL2;
  {
    const canvas = document.getElementById('canvas_putimagedata_alpha_1');
    await putImageDataByCanvas(canvas, 0.3);
    dataURL1 = canvas.toDataURL();
  }
  {
    const canvas = document.getElementById('canvas_putimagedata_alpha_2');
    await putImageDataByCanvas(canvas, 0.9);
    dataURL2 = canvas.toDataURL();
  }
  if (dataURL1 === dataURL2) {
    console.error('Opacity not work!');
  }
}

// Draw-compisite test.
async function testDrawComposite() {
  let backendName = 'cpu';
  await tf.setBackend(backendName);
  await tf.ready();
  drawContextType = getContextName(backendName);
  {
    tfdraw = false;
    const canvas = document.getElementById('drawcomposite');
    await drawBackground(canvas);
    await drawForground(canvas);
  }
  readBackTFDrawTest();
  {
    tfdraw = true;
    const canvas = document.getElementById('drawcomposite_cpu');
    await drawBackground(canvas, 0.0);
    await drawForground(canvas);
  }

  backendName = 'webgpu';
  await tf.setBackend(backendName);
  await tf.ready();
  drawContextType = getContextName(backendName);
  {
    tfdraw = true;
    const canvas = document.getElementById('drawcomposite_webgpu');
    await drawBackground(canvas);
    await drawForground(canvas);
  }
}

const IMG_OPAQUE = 'RPEQQ_opaque.jpg';
const IMG_TRANSPARENT = 'RPEQQ.png';
var drawContextType = 'webgpu';
const width = 48;
const height = 48;
let tfdraw = true;

async function drawForground(canvas, alpha = 1.0) {
  if (tfdraw) {
    // This is not transparent.
    const [imageData, w, h] = await ImageURLToImageData(IMG_TRANSPARENT);
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha}
    });
  } else {
    var context = canvas.getContext('2d');
    // This is transparent.
    const img = new Image();
    img.src = IMG_TRANSPARENT;
    await img.decode();
    context.drawImage(img, 0, 0);
    // This is not transparent.
    /*
    const [img, w, h] = await ImageURLToImageData(IMG_TRANSPARENT);
    context.putImageData(img, 0, 0);
    */
  }
}

async function drawBackground(canvas, alpha = 1.0) {
  if (tfdraw) {
    // const imageData = ImageToData(img);
    const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha}
    });
  } else {
    const img = new Image();
    img.src = IMG_OPAQUE;
    await img.decode();
    var context = canvas.getContext('2d');
    // const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
    context.globalAlpha = alpha;
    context.drawImage(img, 0, 0);
  }
}

function colorToGray(colorImageData) {
  for (let j = 0; j < colorImageData.height; j++) {
    for (let i = 0; i < colorImageData.width; i++) {
      var index = (i * 4) * colorImageData.width + (j * 4);
      var red = colorImageData.data[index];
      var green = colorImageData.data[index + 1];
      var blue = colorImageData.data[index + 2];
      var alpha = colorImageData.data[index + 3];
      var average = (red + green + blue) / 3;
      colorImageData.data[index] = average;
      colorImageData.data[index + 1] = average;
      colorImageData.data[index + 2] = average;
      colorImageData.data[index + 3] = alpha;
    }
  }
}

async function drawBackgroundGray(canvas, alpha = 1.0) {
  if (tfdraw) {
    // const imageData = ImageToData(img);
    const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
    colorToGray(imageData);
    const img = tf.tensor3d(imageData.data, [width, height, 4], 'int32');
    tf.browser.draw(img, canvas, {
      contextOptions: {contextType: drawContextType},
      imageOptions: {alpha}
    });
  } else {
    const img = new Image();
    img.src = IMG_OPAQUE;
    await img.decode();
    var context = canvas.getContext('2d');
    // const [imageData, w, h] = await ImageURLToImageData(IMG_OPAQUE);
    context.globalAlpha = alpha;
    context.drawImage(img, 0, 0);
  }
}

function ImageDataToImage(imageData) {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  var context = canvas.getContext('2d');
  context.putImageData(imageData, 0, 0);
  console.log(imageData);
  // Convert the canvas element to an image object
  const image = new Image();
  image.src = canvas.toDataURL();
  console.log(image.src);
  return image;
}

// https://stackoverflow.com/questions/36588722/html-canvas-putimagedata-with-transparency-causes-incorrect-rgb-to-be-saved
function readBackTFDrawTest() {
  if (drawContextType !== '2d') return;
  const canvas = document.createElement('canvas');
  var ct = canvas.getContext('2d');
  var data = [];
  data[0] = 200;      // r
  data[1] = 100;      // g
  data[2] = 50;       // b
  data[3] = 25;       // a
  console.log(data);  //[200, 100, 50, 25].
  const img = tf.tensor3d(data, [1, 1, 4], 'int32');
  tf.browser.draw(img, canvas, {contextOptions: {contextType: '2d'}});

  // ct.putImageData(image, 0, 0);
  var debug = ct.getImageData(0, 0, 1, 1);

  console.log(debug.data);  //[204, 102, 51, 25]
}

async function ImageURLToImageData(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  return [
    context.getImageData(0, 0, canvas.width, canvas.height), img.naturalWidth,
    img.naturalHeight
  ];
}

function ImageToData(img) {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  canvas.height = img.naturalHeight;
  canvas.width = img.naturalWidth;
  context.drawImage(img, 0, 0);
  console.log(canvas.width + ', ' + canvas.height);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function getContextName(backendName) {
  if (backendName === 'cpu') {
    return '2d';
  } else if (backendName === 'webgpu') {
    return 'webgpu';
  }
}
