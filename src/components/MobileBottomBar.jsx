import React from 'react';
import Link from 'next/link';

export function MobileBottomBar() {
  return (
    <div className="mb">
      <a className="btn" href="tel:07309092376">Call now</a>
      <Link className="btn p" href="/contact">Free quote</Link>
    </div>
  );
}
