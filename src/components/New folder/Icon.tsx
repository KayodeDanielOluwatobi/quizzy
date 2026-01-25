import React from 'react';
import { iconMap, IconName } from '@/icons/map';
import { cn } from '@/lib/utils'; // Assuming you have clsx/tailwind-merge set up

/* Logic:
   1. "Filled" is the default style.
   2. "Stroked" is optional.
   3. We pass styling props (className) directly to the SVG.
*/

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  variant?: 'filled' | 'stroked';
}

export function Icon({ 
  name, 
  variant = 'filled', // Default to filled
  className, 
  ...props 
}: IconProps) {
  
  // 1. Find the icon object in the map
  const iconSet = iconMap[name];

  if (!iconSet) {
    console.warn(`Icon "${name}" not found in map.`);
    return null;
  }

  // 2. Select the specific variant (filled vs stroked)
  const IconComponent = iconSet[variant];

  // 3. Render it with Tailwind classes
  return (
    <IconComponent 
      className={cn("w-6 h-6", className)} // Default size w-6 h-6, but overridable
      {...props} 
    />
  );
}