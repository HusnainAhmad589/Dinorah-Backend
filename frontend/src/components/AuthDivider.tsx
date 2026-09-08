import React from "react";

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ text = "OR" }) => {
  return (
    <div className="flex items-center my-6 w-full">
      <div className="flex-1 h-[1px] bg-[#DED6CC]"></div>
      <span className="px-4 text-[11px] tracking-[0.25em] font-medium uppercase text-[#81766E]">
        {text}
      </span>
      <div className="flex-1 h-[1px] bg-[#DED6CC]"></div>
    </div>
  );
};
