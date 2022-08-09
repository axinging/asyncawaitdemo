const tensorflow_DataType_DT_INT32 = 3;
async function runTFJS(SIGNATURE) {
  let model;  //: GraphModel;

  const weightsManifest =
      [{'name': 'Const', 'dtype': 'int32', 'shape': [2, 1]}];

  const SIMPLE_MODEL = {
    //}: tensorflow.IGraphDef = {
    node: [
      {
        name: 'Input',
        op: 'Placeholder',
        attr: {
          dtype: {
            type: tensorflow_DataType_DT_INT32,
          },
          shape: {shape: {dim: [{size: -1}, {size: 1}]}}
        }
      },
      {
        name: 'Const',
        op: 'Const',
        attr: {
          dtype: {type: tensorflow_DataType_DT_INT32},
          value: {
            tensor: {
              dtype: tensorflow_DataType_DT_INT32,
              tensorShape: {dim: [{size: 1}]},  // tensorShape is ignored.
            }
          },
          index: {i: 0},
          length: {i: 4}
        }
      },
      {name: 'Add1', op: 'Add', input: ['Input', 'Const'], attr: {}},
      {name: 'Add2', op: 'Add', input: ['Add1', 'Const'], attr: {}},
      {name: 'Add', op: 'Add', input: ['Add2', 'Const'], attr: {}}
      // Default output node
    ],
    versions: {producer: 1.0, minConsumer: 3}
  };

  const customLoader = {
    // : tfc.io.IOHandlerSync = {
    load: () => {
      return {
        modelTopology: SIMPLE_MODEL,
        weightSpecs: weightsManifest,
        weightData: new Int32Array([3, 5]).buffer,
        userDefinedMetadata: {signature: SIGNATURE}
      };
    }
  };
  const start = tf.memory().numTensors;
  model = await tf.loadGraphModel(customLoader);
  const start1 = tf.memory().numTensors;
  const input = tf.tensor2d([100, 200], [2, 1], 'int32');
  const output = model.predict(input);
  console.log(JSON.stringify(await output.data()));
  const start2 = tf.memory().numTensors;
  input.dispose();
  output.dispose();
  const start3 = tf.memory().numTensors;
  // Dispose tensor kept by load.
  model.dispose();

  // tf.backend().dispose();

  const start4 = tf.memory().numTensors;
  console.log(
      'numTensors: start = ' + start + ', after load = ' + start1 +
      ', after predict = ' + (start2) + ', after dispose in/out = ' + start3 +
      ', after model dispose = ' + (start4));
  // const saveResult = await model.save('downloads://abc');
  // console.log(saveResult);
}

async function runTFJSModel() {
    let SIGNATURE = null;
    let outputName = null;

    console.log("Outputs: " + outputName);
    await runTFJS(SIGNATURE);

    outputName = 'Add2';
    console.log("Outputs: " + outputName);
    SIGNATURE = { //: tensorflow.ISignatureDef = {
      inputs: { x: { name: 'Input:0', dtype: tensorflow_DataType_DT_INT32 } },
      outputs: { y: { name: outputName, dtype: tensorflow_DataType_DT_INT32 } }
    };
    await runTFJS(SIGNATURE);
}