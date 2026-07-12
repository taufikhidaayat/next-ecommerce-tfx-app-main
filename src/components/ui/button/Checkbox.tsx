import { AiOutlineCheck } from "react-icons/ai";

type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
};

// Kotak centang (checkbox) bergaya, mis. untuk memilih item keranjang atau setuju S&K.
export function Checkbox({
    checked,
    onChange,
    disabled = false,
}: CheckboxProps) {
    return (
        <label className="relative flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => {
                    if (!disabled) onChange(e.target.checked);
                }}
                className={`peer appearance-none w-5 h-5 rounded-md border border-gray-300 bg-white transition-all duration-200 checked:bg-green-500 checked:border-green-500 focus:ring-2 focus:ring-green-200 outline-none shadow-sm
          ${disabled ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-60" : ""}`}
                style={{
                    boxShadow: checked
                        ? "0 2px 8px 0 rgba(16,185,129,0.12)"
                        : "0 1px 3px 0 rgba(0,0,0,0.05)",
                }}
            />
            <AiOutlineCheck
                className={`absolute left-0 top-0 w-5 h-5 text-white pointer-events-none transition-opacity duration-150 
          ${checked ? "opacity-100" : "opacity-0"}`}
            />
            <span
                className={`absolute left-0 top-0 w-5 h-5 rounded-md transition-all duration-200
          peer-hover:ring-2 peer-hover:ring-green-400 peer-hover:ring-opacity-40
          ${disabled ? "pointer-events-none" : ""}`}
            />
        </label>
    );
}