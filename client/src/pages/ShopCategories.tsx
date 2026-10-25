
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Men",
    value: "men",
    image:
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600",
  },
  {
    name: "Women",
    value: "women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
  },
  {
    name: "Jewellery",
    value: "jewellery",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600",
  },
  {
    name: "Footwear",
    value: "footwear",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
  },
];

const Categories = () => {
  return (
    <div style={{ padding: "30px", textAlign: "center" }}>
      <h1>Shop by Category</h1>
      <p>Explore our collections</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "24px",
          marginTop: "30px",
        }}
      >
        {categories.map((category) => (
          <Link
            key={category.value}
            to={`/search?category=${encodeURIComponent(category.value)}`}
            style={{
              color: "black",
              textDecoration: "none",
              border: "1px solid #ddd",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <img
              src={category.image}
              alt={category.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
              }}
            />
            <h2>{category.name}</h2>
            <p>Explore Collection</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
