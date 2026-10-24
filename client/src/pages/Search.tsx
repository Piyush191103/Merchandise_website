import { useEffect,useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import ProductCard from "../components/ProductCard";
import SkeletonLoader from "../components/SkeletonLoader";
import {
  useCategoriesQuery,
  useSearchedproductsQuery,
} from "../redux/api/ProductApi";
import { addToCart } from "../redux/reducer/CartReducer";
import { server } from "../redux/store";
import { CartItemType, CustomError } from "../types/Types";

const Search = () => {
  const {
    data: categoriesRes,
    isLoading: categoryLoading,
    isError:isCategoryError,
    error:categoryError,
  } = useCategoriesQuery("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);


const dispatch = useDispatch();
  
  const {
    data:searchedData,
    isLoading:isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useSearchedproductsQuery({
    search,
    sort,
    category,
    page,
    price: maxPrice,
  });
  
  console.log(searchedData);

  const prevHandler = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };
  const nextHandler = () => {
    if (page < searchedData?.totalPage!) {
      setPage((prev) => prev + 1);
    }
  };
  useEffect(() => {
  if (isCategoryError) {
    toast.error(
      (categoryError as CustomError).data?.message || "Failed to load categories"
    );
  }
}, [isCategoryError, categoryError]);

useEffect(() => {
  if (isSearchError) {
    toast.error(
      (searchError as CustomError).data?.message || "Failed to fetch products"
    );
  }
}, [isSearchError, searchError]);


  const addToCartHandler = (cartItem: CartItemType) => {
    if (cartItem.stock < 1) {
      return toast.error("Product Out Of Stock :(");
    }
    dispatch(addToCart(cartItem));
    toast.success("Added to Cart");
  };
  return (
    <div className="search">
      <aside>
        <h2>FILTERS</h2>
        <div>
          <h4>Sort</h4>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="">None</option>
            <option value="asc">Price(Low to High)</option>
            <option value="dsc">Price(High to Low)</option>
          </select>
        </div>

        <div>
          <h4>Max Price:{maxPrice || ""}</h4>
          <input
            className="range"
            type="range"
            min={100}
            max={100000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </div>

        <div>
          <h4>Category</h4>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            {categoryLoading === false &&
              categoriesRes?.categories.map((i) => (
                <option key={i} value={i}>
                  {i.toUpperCase()}
                </option>
              ))}
          </select>
        </div>
      </aside>
      <main>
        <h1>PRODUCTS</h1>
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="searched-product">
          {isSearchLoading ? (
            <SkeletonLoader></SkeletonLoader>
          ) : (
            <>
              {searchedData?.products.map((i) => (
                <ProductCard
                  key={i._id}
                  productId={i._id}
                  name={i.name}
                  photo={`${server}/${i.photo}`}
                  price={i.price}
                  stock={i.stock}
                  handler={addToCartHandler}
                />
              ))}
            </>
          )}

          {/* {searchedData?.products.map((i) => (
            <ProductCard
              key={i._id}
              productId={i._id}
              name={i.name}
              photo={`${server}/${i.photo}`}
              price={i.price}
              stock={i.stock}
              handler={addToCartHandler}
            />
          ))} */}
        </div>

        <article>
          <button onClick={prevHandler}>Prev</button>
          <p>
            {page} of {searchedData?.totalPage}
          </p>
          <button onClick={nextHandler}>Next</button>
        </article>
      </main>
    </div>
  );
};

export default Search;
