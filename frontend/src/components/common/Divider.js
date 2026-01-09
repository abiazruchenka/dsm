import React from 'react';
import './Divider.css';

export default function Divider({ className = '', ariaHidden = true }) {
  return <div className={`divider ${className}`} aria-hidden={ariaHidden} />;
}
