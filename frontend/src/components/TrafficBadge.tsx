import React from 'react';

interface TrafficBadgeProps {
  factor: number;
}

const TrafficBadge: React.FC<TrafficBadgeProps> = ({ factor }) => {
  let label = 'Low';
  let colorClass = 'text-green-500 bg-green-50';

  if (factor >= 1.4) {
    label = 'High';
    colorClass = 'text-red-500 bg-red-50';
  } else if (factor >= 1.1) {
    label = 'Medium';
    colorClass = 'text-yellow-600 bg-yellow-50';
  }

  return (
    <div className={`flex flex-col items-end`}>
       <span className="text-xs text-gray-400 uppercase font-bold mb-0.5">Traffic</span>
       <span className={`text-xs font-bold px-2 py-1 rounded-md ${colorClass}`}>
         {label}
       </span>
    </div>
  );
};

export default TrafficBadge;