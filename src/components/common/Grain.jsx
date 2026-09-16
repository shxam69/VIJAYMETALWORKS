import React from 'react';

const Grain = () => (
  <div style={{ position:'fixed', inset:0, zIndex:1, pointerEvents:'none', opacity:.025,
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
    backgroundRepeat:'repeat', backgroundSize:'256px 256px' }}/>
);

export default Grain;
