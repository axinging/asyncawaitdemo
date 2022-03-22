function getURLState(url) {
    let params = new URLSearchParams(url);
    const keys = [...params.keys()];
    if (keys.length === 0)
      return null;
    let loop = 1;
    let control = 0;
    if (params.has('loop')) {
      loop = Number(params.get('loop'));
    }
    if (params.has('control')) {
        control = Number(params.get('control'));
      }
    return [loop, control];
  }
