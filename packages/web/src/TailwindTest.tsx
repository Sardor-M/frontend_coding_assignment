import React from "react";

const TailwindTest: React.FC = () => {
  return (
    <div className="p-4 bg-blue-500 text-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Tailwind CSS is working!</h2>
      <p className="text-sm">This component is styled using Tailwind CSS.</p>
    </div>
  );
};

export default TailwindTest;
