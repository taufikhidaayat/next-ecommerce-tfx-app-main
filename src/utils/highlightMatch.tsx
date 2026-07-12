type HighlightMatchProps = {
    text: string;
    query: string;
};

// Menyorot (highlight) bagian teks yang cocok dengan kata pencarian, mis. di hasil
// pencarian, huruf yang diketik user ditandai warna hijau. Caranya: pecah teks di
// sekitar kecocokan, lalu bungkus bagian yang cocok dengan <span> berwarna.
export default function HighlightMatch({ text, query }: HighlightMatchProps) {
    if (!query) return <>{text}</>;
    const regex = new RegExp(`(${query})`, "ig");
    const parts = text.split(regex);

    return (
        <>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <span
                        key={i}
                        className="font-semibold text-emerald-600 bg-emerald-50 rounded px-0.5"
                    >
                        {part}
                    </span>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </>
    );
}