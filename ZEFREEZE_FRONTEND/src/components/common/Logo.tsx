import React from 'react';
import logo from './logo.png'; // Import de l'image

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ 
  variant = 'dark', 
  size = 'md'
}) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSize = {
    sm: 220,
    md: 180,
    lg: 120
  };

  return (
    <div className="flex items-center">
      {/* Remplacement de Snowflake par l'image du logo */}
      <img 
        src={logo} 
        alt="Logo" 
        className="mr-2"
        style={{ 
          width: iconSize[size], 
          height: iconSize[size] 
        }} 
      />
      <span className={`font-bold ${sizeClasses[size]} ${textColor}`}>
      </span>
    </div>
  );
};

export default Logo;