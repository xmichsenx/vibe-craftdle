import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="w-full bg-mc-dark border-b-2 border-mc-stone px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-minecraft text-xl text-mc-gold hover:text-mc-green transition-colors">
          Craftdle
        </Link>
        <nav className="flex gap-4">
          <Link to="/classic" className="font-minecraft text-xs text-mc-gray hover:text-white transition-colors">
            Classic
          </Link>
          <Link to="/crafting" className="font-minecraft text-xs text-mc-gray hover:text-white transition-colors">
            Crafting
          </Link>
          <Link to="/texture" className="font-minecraft text-xs text-mc-gray hover:text-white transition-colors">
            Texture
          </Link>
          <Link to="/sound" className="font-minecraft text-xs text-mc-gray hover:text-white transition-colors">
            Sound
          </Link>
        </nav>
      </div>
    </header>
  );
}
