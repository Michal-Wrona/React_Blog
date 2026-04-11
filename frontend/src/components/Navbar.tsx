import { NavLink } from "react-router-dom"; // Importujemy Link, żeby nawigacja nie odświeżała całej strony


function Navbar() {
  return (
    // 'nav' to semantyczny tag dla nawigacji
    // bg-white = białe tło | border-b = dolna ramka | border-gray-100 = bardzo jasny kolor ramki
    // shadow-sm = delikatny cień pod spodem | sticky top-0 = pasek zostaje na górze przy przewijaniu
    <nav className="bg-green-100 border-b border-gray-100 shadow-sm sticky top-0 z-50">

      {/* Container: max-w-5xl (ogranicza szerokość) | mx-auto (centruje kontener na środku) */}
      {/* px-4 (odstęp wewnętrzny po bokach) | h-16 (sztywna wysokość paska: 64px) */}
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* LOGO SECTION */}
        {/* text-xl (większy tekst) | font-bold (pogrubienie) | tracking-tighter (zacieśnienie liter) */}
        <div className="text-xl font-bold tracking-tighter text-gray-900">
          Moja<span className="text-blue-600">Apka</span>
        </div>

        {/* MENU LINKS */}
        {/* flex (układ liniowy) | gap-2 (odstęp między linkami) */}
        <div className="flex gap-2">

          {/* LINK: HOME */}
          {/* hover:bg-gray-50 (tło zmienia się po najechaniu) | px-3 py-2 (wielkość klikalnego obszaru) */}
          {/* rounded-md (lekko zaokrąglone rogi) | transition-all (płynna animacja zmian) */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-4 py-2 rounded-xl"
                : "bg-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500"
            }
          >
            Home
          </NavLink>

          {/* LINK: BLOG */}
          {/* bg-blue-600 (niebieskie tło) | text-white (biały napis) */}
          {/* shadow-md (mocniejszy cień dla przycisku) | hover:scale-105 (lekko rośnie po najechaniu) */}
          <NavLink
            to="/blog"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-4 py-2 rounded-xl"
                : "bg-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500"
            }
          >
            Blog
          </NavLink>

          <NavLink
            to="/blogcard"
            className={({ isActive }) =>
              isActive
                ? "bg-blue-600 px-4 py-2 rounded-xl"
                : "bg-blue-200 px-4 py-2 rounded-xl hover:bg-blue-500"
            }
          >
            BlogCard
          </NavLink>

        </div>
      </div>
    </nav >
  );
}

export default Navbar;