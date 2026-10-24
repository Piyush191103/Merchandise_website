import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import Loader from "../../../components/admin/Loader";
import {
  useDeleteProductMutation,
  useProductDetailQuery,
  useUpdateProductMutation,
} from "../../../redux/api/ProductApi";
import { server } from "../../../redux/store";
import { UserReducerType } from "../../../types/ReducerTypes";


const Productmanagement = () => {
  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );
  const params = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useProductDetailQuery(params.id!);

  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  console.log(data)
 

  const [product, setProduct] = useState({
    price: 0,
    stock: 0,
    name: "",
    photo: "",
    category: "",
    _id: "",
  });

  const { price, stock, name, photo, category } = product;
  const [priceUpdate, setPriceUpdate] = useState<number>(price);
  const [stockUpdate, setStockUpdate] = useState<number>(stock);
  const [nameUpdate, setNameUpdate] = useState<string>(name);
  const [categoryUpdate, setCategoryUpdate] = useState<string>(category);
  const [photoUpdate, setPhotoUpdate] = useState<string>(photo);
  const [photoFile, setPhotoFile] = useState<File>();

  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];

    const reader: FileReader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoUpdate(reader.result);
          setPhotoFile(file);
        }
      };
    }
  };

  const submitHandler = async (
    e: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const formData = new FormData();

    if (nameUpdate) {
      formData.set("name", nameUpdate);
    }
    if (categoryUpdate) {
      formData.set("category", categoryUpdate);
    }
    if (priceUpdate) {
      formData.set("price", priceUpdate.toString());
    }
    if (stockUpdate !== undefined) {
      formData.set("stock", stockUpdate.toString());
    }
    if (photoFile) {
      formData.set("photo", photoFile);
    }

    const res = await updateProduct({
      formData,
      userId: user?._id!,
      productId: product._id,
    });
    
    if("data" in res){
      toast.success(res.data.message);
    }
    if("error" in res){
      toast.error("Some Error!")
    }

    navigate("/admin/product");
  };

  const deleteHandler=async()=>{
    const res=await deleteProduct({userId:user?._id!,productId:product._id!});

    if("data" in res){
      toast.success(res.data.message);
    }
    if ("error" in res) {
      toast.error("Some Error!");
    }
     navigate("/admin/product");
  };
  useEffect(() => {
    if (data) {
      setProduct(data.product);
      console.log(data.product);
      setNameUpdate(data.product.name);
      setPriceUpdate(data.product.price);
      setStockUpdate(data.product.stock);
      setPhotoUpdate(data.product.photo);
      setCategoryUpdate(data.product.category);
    }
  }, [data]);

  return (
    <div className="admin-container">
      <AdminSidebar />
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <main className="product-management">
            <section>
              <strong>ID - {data?.product._id}</strong>
              <img src={`${server}/${photo}`} alt="Product" />
              <p>{name}</p>
              {stock > 0 ? (
                <span className="green">{data?.product.stock} Available</span>
              ) : (
                <span className="red"> Not Available</span>
              )}
              <h3>₹{price}</h3>
            </section>
            <article>
              <button  className="product-delete-btn"
              onClick={deleteHandler}>
                <FaTrash />
              </button>
              <form onSubmit={submitHandler}>
                <h2>Manage</h2>
                <div>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Name"
                    value={nameUpdate}
                    onChange={(e) => setNameUpdate(e.target.value)}
                  />
                </div>
                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    placeholder="Price"
                    value={priceUpdate}
                    onChange={(e) => setPriceUpdate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="Stock"
                    value={stockUpdate}
                    onChange={(e) => setStockUpdate(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="eg. laptop, camera etc"
                    value={categoryUpdate}
                    onChange={(e) => setCategoryUpdate(e.target.value)}
                  />
                </div>

                <div>
                  <label>Photo</label>
                  <input type="file" onChange={changeImageHandler} />
                </div>

                {photoUpdate && <img src={photoUpdate} alt="New Image" />}
                <button type="submit">Update</button>
              </form>
            </article>
          </main>
        </>
      )}
    </div>
  );
};

export default Productmanagement;
