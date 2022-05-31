// const webglVersion = 1;
function qglGetQueryCounterBits(gl, ext) {
  if (webglVersion == 1) {
    console.log(
        'QUERY_COUNTER_BITS_EXT = ' +
        ext.getQueryEXT(ext.TIMESTAMP_EXT, ext.QUERY_COUNTER_BITS_EXT));
  } else {
    console.log(
        'QUERY_COUNTER_BITS_EXT = ' +
        gl.getQuery(ext.TIMESTAMP_EXT, ext.QUERY_COUNTER_BITS_EXT));
  }
}

function qglGetGLExtension(gl) {
  let ext;
  if (webglVersion == 1) {
    ext = gl.getExtension('EXT_disjoint_timer_query');
  } else {
    ext = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  }
  return ext;
}

function qglTimestampQuery(gl, ext) {
  let query;
  if (webglVersion == 1) {
    query = ext.createQueryEXT();
    ext.queryCounterEXT(query, ext.TIMESTAMP_EXT);
  } else {
    query = gl.createQuery();
    ext.queryCounterEXT(query, ext.TIMESTAMP_EXT);
  }
  return query;
}

function qglQueryResuleAvailable(gl, ext, query) {
  let available = false;
  if (webglVersion == 1) {
    available = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_AVAILABLE_EXT);
  } else {
    available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
  }
  return available;
}

function qglGetQueryParameter(gl, ext, query) {
  let timestamp = 0;  // = gl.getQueryParameter(query, gl.QUERY_RESULT);
  if (webglVersion == 1) {
    timestamp = ext.getQueryObjectEXT(query, ext.QUERY_RESULT_EXT);
  } else {
    timestamp = gl.getQueryParameter(query, gl.QUERY_RESULT);
  }
  return timestamp;
}

function qglDeleteQuery(gl, ext, query) {
  if (webglVersion == 1) {
    ext.deleteQueryEXT(query);
  } else {
    gl.deleteQuery(query);
  }
}

function qglGetTimestampQueryResult(...args) {
  const gl = args[0];
  const ext = args[1];
  let query = args[2];
  let tag = args[3];
  let available = false;
  if (query) {
    available = qglQueryResuleAvailable(gl, ext, query);
    let disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);

    if (available && !disjoint) {
      // See how much time the rendering of the object took in nanoseconds.
      let timeStamp = qglGetQueryParameter(gl, ext, query);
      // Do something useful with the time.  Note that care should be
      // taken to use all significant bits of the result, not just the
      // least significant 32 bits.
      console.log(tag + ': ' + timeStamp);
    }

    if (available || disjoint) {
      // Clean up the query objects.
      qglDeleteQuery(gl, ext, query);

      // Don't re-enter this polling loop.
      query = null;
    }
  }
  return available;
}

function qglGetMultipleTimestampQueryResult(...args) {
  const gl = args[0];
  const ext = args[1];
  let queries = args[2];
  let endQuery = queries[queries.length - 1];
  let tag = args[3];
  let available = false;
  if (endQuery) {
    available = qglQueryResuleAvailable(gl, ext, endQuery);
    let disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
    // console.log("qglQueryResuleAvailable");

    if (available && !disjoint) {
      // See how much time the rendering of the object took in nanoseconds.
      let timeResults = [];
      queries.forEach((query, i) => {
        let timestamp = qglGetQueryParameter(gl, ext, query);
        timeResults.push(timestamp);
      });

      // Do something useful with the time.  Note that care should be
      // taken to use all significant bits of the result, not just the
      // least significant 32 bits.
      console.log(timeResults + ', ' + tag);
    }

    if (available || disjoint) {
      // Clean up the query objects.
      queries.forEach((query, i) => {
        qglDeleteQuery(gl, ext, query);
      });
      // gl.deleteQuery(startQuery);
      // gl.deleteQuery(endQuery);

      // Don't re-enter this polling loop.
      endQuery = null;
    }
  }
  return available;
}

function sleep(queryFn, ...args) {
  setTimeout(function() {
    const available = queryFn(...args);
    if (available == false) {
      sleep(queryFn, ...args);
    }
  }, 100);
}

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
