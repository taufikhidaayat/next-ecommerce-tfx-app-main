import { AiOutlineReload } from 'react-icons/ai';
import { useTranslations } from "next-intl";

function ErrorComponent() {
    const t = useTranslations("feedback.errorPage");

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="bg-white p-4 sm:p-6 border border-gray-300 rounded-lg shadow-xl text-center max-w-lg">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">{t("title")}</h2>
                <p className="text-gray-600 mb-6 text-base">{t("desc")}</p>
                <div className="flex justify-center">
                    <button
                        className="bg-emerald-400 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg shadow-md flex items-center transition duration-300 ease-in-out transform hover:scale-105"
                        onClick={() => window.location.reload()}
                    >
                        <AiOutlineReload size={18} className="mr-2" />
                        <span className="font-medium">{t("reload")}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ErrorComponent;
