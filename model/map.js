// https://javascript.plainenglish.io/javascript-finalizer-2859f0832f07
let arrCollection = new Map();
let arrCollection2 = new Map();
let arrCollection3 = new Map();

// arrCollection should not be GCed.
const registerFinalizer = new FinalizationRegistry(message => {
  console.log(message)
});

(function() {
  let arr = [1, 2, 3]
  
  arrCollection.set(arr, "first array")
 
  registerFinalizer.register(arr, 'Array is now cleaned up')
} ())

setInterval(function() {
  console.log(arrCollection)
}, 3000)