import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  footerText?: string;
  footerLinkText?: string;
  onFooterLinkClick?: () => void;
  maxWidth?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  footerText,
  footerLinkText,
  onFooterLinkClick,
  maxWidth = "max-w-[440px]",
}) => {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 select-none"
      style={{
        background: "linear-gradient(135deg, #F6F3FE 0%, #ECE6FA 50%, #DFD8F8 100%)",
      }}
    >
      {/* Centered Floating White Card with Exact Proportions */}
      <div
        className={`w-full ${maxWidth} bg-white rounded-[28px] p-8 sm:p-10 shadow-[0_20px_60px_rgba(110,89,219,0.13)] relative z-10 box-border`}
      >
        {/* Children Form Content */}
        {children}

        {/* Bottom Switch Link */}
        {footerText && footerLinkText && (
          <div className="mt-7 text-center text-[13.5px] text-[#8C87A5]">
            {footerText}{" "}
            <button
              type="button"
              onClick={onFooterLinkClick}
              className="text-[#5B42F3] hover:text-[#4931DB] font-semibold bg-transparent border-none cursor-pointer ml-1 transition-colors"
            >
              {footerLinkText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
