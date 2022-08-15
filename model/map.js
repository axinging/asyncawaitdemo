// https://javascript.plainenglish.io/javascript-finalizer-2859f0832f07
let arrCollection = new Map()

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