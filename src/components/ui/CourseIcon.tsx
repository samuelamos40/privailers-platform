import React from 'react';

const colors = [
  '#003366', // Navy Blue
  '#0ea5e9', // Sky Blue
  '#10b981', // Emerald
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#00b8d4'  // Teal
];

interface CourseIconProps {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CourseIcon: React.FC<CourseIconProps> = ({ title, size = 'md' }) => {
  const initial = title.charAt(0).toUpperCase();
  
  // Deterministic color based on title string
  const colorIndex = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const backgroundColor = colors[colorIndex];

  const sizeMap = {
    sm: { width: '40px', height: '40px', fontSize: '1.25rem' },
    md: { width: '60px', height: '60px', fontSize: '2rem' },
    lg: { width: '100px', height: '100px', fontSize: '3.5rem' },
    xl: { width: '100%', height: '100%', fontSize: '5rem' }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <div style={{
      width,
      height,
      background: `linear-gradient(135deg, ${backgroundColor}, ${backgroundColor}dd)`,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '1.5rem',
      fontWeight: 800,
      fontSize,
      fontFamily: 'var(--font-poppins)',
      boxShadow: `0 10px 20px -5px ${backgroundColor}44`,
      userSelect: 'none',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      {/* Glass overlay effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 50%)',
        pointerEvents: 'none'
      }} />
      <span style={{ 
        position: 'relative', 
        zIndex: 1, 
        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transform: 'translateY(-2px)'
      }}>
        {initial}
      </span>
    </div>
  );
};

export default CourseIcon;
