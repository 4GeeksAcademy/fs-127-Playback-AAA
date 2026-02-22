import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURED_CATEGORIES = [
  { id: 1, name: "Vinilos", image: "https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 2, name: "Consolas", image: "https://images.pexels.com/photos/275033/pexels-photo-275033.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 3, name: "Libros", image: "https://images.pexels.com/photos/256450/pexels-photo-256450.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 4, name: "Cámaras", image: "https://images.pexels.com/photos/1983038/pexels-photo-1983038.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 5, name: "Cassettes", image: "https://images.pexels.com/photos/3811082/pexels-photo-3811082.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 6, name: "Arcade", image: "https://images.pexels.com/photos/1174746/pexels-photo-1174746.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 7, name: "Guitarras", image: "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 8, name: "Relojes", image: "https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 9, name: "Posters", image: "https://images.pexels.com/photos/1070345/pexels-photo-1070345.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 10, name: "Radios", image: "https://images.pexels.com/photos/4495755/pexels-photo-4495755.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 11, name: "Juguetes", image: "https://images.pexels.com/photos/163036/mario-luigi-yoshi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=400" },
  { id: 12, name: "Monedas", image: "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=400" },
];

export const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [randomCategories] = useState(() =>
    [...FEATURED_CATEGORIES].sort(() => Math.random() - 0.5).slice(0, 5)
  );

  return (
    <section>
      <h2 className="text-lg font-semibold my-4">Categorías Destacadas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {randomCategories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/products?category=${cat.name.toLowerCase()}`)}
            className="cursor-pointer group hover:shadow-md transition-all duration-200"
          >
            <img src={cat.image} alt={cat.name} className="w-full h-40 sm:h-44 md:h-48 object-cover" />
            <p className="text-center text-xs font-semibold uppercase py-2">{cat.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};