export function getLayerConfig(template) {
  const frames = template.frames
    .filter((f) => f.height !== 350)
    .sort((a, b) => {
      const locationOrder = {
        LEFT: 0,
        LEFT_CORNER: 1,
        CENTER: 2,
        RIGHT: 3,
        RIGHT_CORNER: 4,
      };

      if (a.location === b.location) {
        if (a.location === 'LEFT') {
          return a.position.z - b.position.z;
        }
        if (a.location === 'CENTER') {
          return a.position.x - b.position.x;
        }
      }

      return locationOrder[a.location] - locationOrder[b.location];
    });
  const newFrames = frames.map((frame) => {
    let layersNumber = frame.components?.length ?? 0;
    const layers = [];

    const frameArray = template.frames.filter(
      (f) => f.location === frame.location
        && f.position.x === frame.position.x
        && f.position.z === frame.position.z,
    ).sort((a, b) => a.position.y - b.position.y);
    layersNumber += frameArray.length;

    frameArray.forEach((f) => {
      const sortedComponents = f.components
        .sort((a, b) => b.position.y - a.position.y);
      sortedComponents.forEach((element, index, array) => {
        if (index === 0) {
          const frameHeight = f.position.y + f.height / 1000;

          layers.push({
            height: frameHeight - element.position.y - 0.02,
            stackNo: layers.length + 1,
            position: { ...element.position, y: element.position.y + 0.02 },
            frameId: f.id,
            componentId: element.id,
          });
        } else {
          layers.push({
            height: array[index - 1].position.y - element.position.y - 0.02,
            stackNo: layers.length + 1,
            position: { ...element.position, y: element.position.y + 0.02 },
            frameId: f.id,
            componentId: element.id,
          });
        }
      });
      const lastComponent = sortedComponents[sortedComponents.length - 1];
      // if (f.height === 350) {
      //   layers.push({
      //     height: lastComponent.position.y,
      //     stackNo: layers.length + 1,
      //     position: { ...f.position, x: 0, z: 0 },
      //     frameId: f.id,
      //   });
      // } else {
      const drawer = f.components.find((c) => c.componentGroup === 'DRAWER');
      if (!drawer) {
        const bottomHeight = f.height === 350 ? 0 : 0.1;
        if (lastComponent) {
          layers.push({
            height: lastComponent.position.y - bottomHeight,
            stackNo: layers.length + 1,
            position: { x: 0, y: f.position.y + bottomHeight, z: 0 },
            frameId: f.id,
          });
        } else {
          layers.push({
            height: f.height / 1000 - 0.02,
            stackNo: layers.length + 1,
            position: { x: 0, y: f.position.y + bottomHeight, z: 0 },
            frameId: f.id,
          });
        }
      }
    });

    frame.layersNumber = layersNumber;
    // 获取数组长度
    const sortedLayers = layers.sort((a, b) => a.position.y - b.position.y);
    sortedLayers.forEach((l, index) => {
      l.stackNo = index + 1;
    });


    frame.layers = sortedLayers;
    return frame;
  });

  return newFrames;
}

export function test() {}
