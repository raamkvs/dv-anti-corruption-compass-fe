import React from 'react';

interface Props {
  children: React.ReactNode;
  message?: string;
}

/**
 * Wraps a WebGL component (globe, choropleth map, etc.) that cannot be captured
 * during print. In screen mode the children render normally; during print the
 * children are hidden and a static placeholder message is shown instead.
 */
export function WebGLPrintPlaceholder({
  children,
  message = 'View interactive map on the website',
}: Props) {
  return (
    <div className='webgl-print-placeholder'>
      {children}
      <div className='webgl-print-placeholder__fallback'>
        <span>{message}</span>
      </div>
    </div>
  );
}
