## Object function
Object's function:
```
      predictFunc: (inputResolution = 128) => {
        return model => model.calcArea();
      },
```

Equals:
```
      predictFunc: (model, inputResolution = 128) => {
        return model => model.calcArea();
      },
```

So be sure pass model when call predictFunc.