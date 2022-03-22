function getURLState(url) {
    let params = new URLSearchParams(url);
    const keys = [...params.keys()];
    if (keys.length === 0)
      return null;
    let loop = 1;
    if (params.has('loop')) {
      loop = Number(params.get('loop'));
    }
    return loop;
  }
