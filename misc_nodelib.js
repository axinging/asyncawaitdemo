'use strict';
const fs = require('fs');

async function main() {
  const data = await fs.promises.readFile('dump_FaceLandmarkDetection_attention_mesh_image_0.25_1_cpu.json');
  let tensorsMap = JSON.parse(data);
  const keysOfTensors = Object.keys(tensorsMap);
  for (let i = 0; i < keysOfTensors.length; i++) {
    const key = keysOfTensors[i].replace(/\//g, '-');
    console.log(key);
    console.log(tensorsMap[keysOfTensors[i]]);
    fs.writeFileSync(`${key}.json`,  JSON.stringify(tensorsMap[keysOfTensors[i]]));
  }
}

main();
