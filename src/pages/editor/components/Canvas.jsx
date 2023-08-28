import React from 'react';

import CanvasContent from './CanvasContent';

export default ({
  mobileOriginPos,
  posData,
  allCabinetHeight,
  stepCurrent,
}) => (
  <div style={{ top: '0px', left: '0px' }}>
    <CanvasContent
      mobileOriginPos={mobileOriginPos}
      posData={posData}
      allCabinetHeight={allCabinetHeight}
      stepCurrent={stepCurrent}
    />
  </div>
);

