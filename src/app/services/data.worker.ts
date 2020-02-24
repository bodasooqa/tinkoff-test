/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  if (data.range) {
    const optimizedRange = [];

    for (let i = 0; i < data.range.length; i += Math.ceil(data.range.length / 50)) {
      optimizedRange.push(data.range[i]);
    }

    if (optimizedRange[optimizedRange.length - 1] !== data.range[data.range.length]) {
      optimizedRange.push(data.range[data.range.length - 1]);
    }

    postMessage(optimizedRange);
  }

  if (data.all) {
    const range = data.all.data.slice(data.all.startRangePoint, data.all.endRangePoint);

    postMessage(range);
  }
});
