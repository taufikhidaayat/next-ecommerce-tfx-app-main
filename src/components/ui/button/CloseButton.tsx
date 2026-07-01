import { FaTimes } from 'react-icons/fa';

type CloseButtonProps = {
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
};

export default function CloseButton({
    onClick,
    className = "",
    disabled,
}: CloseButtonProps) {
    return (
        <button
            onClick={!disabled ? onClick : undefined}
            aria-label="Close"
            disabled={disabled}
            className={`p-2 rounded-full bg-transparent focus:outline-none focus:ring-0 transition ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-red-50"
                } ${className}`}
        >
            <FaTimes
                size={25}
                className={`transition duration-200 ${disabled
                    ? "text-gray-400"
                    : "text-red-700 hover:text-red-500 transform hover:scale-110"
                    }`}
            />
        </button>
    );
}
