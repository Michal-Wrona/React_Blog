// components/BlogCard.tsx

// Definiujemy "przepis" na to, jakie dane musi dostać nasza karta
interface BlogCardProps {
  title: string;      // Tytuł musi być tekstem
  description: string; // Opis musi być tekstem
}

// Komponent przyjmuje 'props' (argumenty)
function BlogCard({ title, description }: BlogCardProps) {
  return (
    // shadow-md = cień | hover:shadow-xl = większy cień po najechaniu
    // border = ramka | p-6 = odstęp wewnątrz karty
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow cursor-pointer">
      
      {/* Tytuł wpisu */}
      <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
      
      {/* Opis wpisu */}
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      
      {/* Przycisk "Czytaj więcej" */}
      <div className="mt-4 text-blue-600 font-semibold text-sm hover:underline">
        Czytaj więcej →
      </div>
    </div>
  );
}

export default BlogCard;