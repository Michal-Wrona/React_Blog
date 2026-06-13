import { Link } from "react-router-dom";

function ChoosePostType() {
  return (
    <div className="min-h-screen bg-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Dodaj post
        </h1>
        <p className="text-gray-600 mb-8">
          Wybierz sposób tworzenia posta. Po zapisaniu nie będzie można zmienić trybu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/post/new/simple"
            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 p-6 transition-colors"
          >
            <div className="text-3xl mb-3">📝</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700">
              Prosty post
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Klasyczny układ: tytuł, treść i zdjęcia na dole. Szybki i przejrzysty sposób publikacji.
            </p>
          </Link>

          <Link
            to="/post/new/visual"
            className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 p-6 transition-colors"
          >
            <div className="text-3xl mb-3">🎨</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-700">
              Post z własnym układem
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Wybierz tło, czcionkę i kolory. Podgląd na żywo pokazuje, jak post zobaczy czytelnik.
            </p>
          </Link>
        </div>

        <div className="mt-8">
          <Link
            to="/blog"
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            Anuluj
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ChoosePostType;
