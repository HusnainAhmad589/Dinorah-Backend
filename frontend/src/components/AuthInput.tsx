import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
  id?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  isPassword?: boolean;
  autoComplete?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  icon,
  isPassword = false,
  autoComplete,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const computedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col text-left w-full">
      <label
        htmlFor={inputId}
        className="text-[11.5px] font-bold tracking-[0.06em] uppercase text-[#474164] mb-2"
      >
        {label}
      </label>

      <div className="relative flex items-center w-full">
        <input
          id={inputId}
          type={computedType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full bg-[#F7F6FD] border ${
            error
              ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20"
              : "border-[#EBE7F8] focus:border-[#5B42F3] focus:ring-2 focus:ring-[#5B42F3]/15"
          } focus:bg-white rounded-[12px] py-3.5 pl-4.5 ${
            isPassword || icon ? "pr-11" : "pr-4.5"
          } text-[14.5px] text-[#1E1B4B] placeholder-[#A09CB8] outline-none transition-all duration-200 box-border`}
        />

        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-[#8C87A5] hover:text-[#5B42F3] transition-colors bg-transparent border-none cursor-pointer flex items-center p-1"
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={18} strokeWidth={1.8} />
            ) : (
              <Eye size={18} strokeWidth={1.8} />
            )}
          </button>
        ) : icon ? (
          <span className="absolute right-3.5 text-[#8C87A5] pointer-events-none flex items-center">
            {icon}
          </span>
        ) : null}
      </div>

      {error && (
        <span className="text-[12px] text-[#EF4444] mt-1.5 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
