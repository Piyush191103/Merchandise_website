import { ChangeEvent, FormEvent, useState } from "react";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { useNewProductMutation } from "../../../redux/api/ProductApi";
import {useNavigate } from "react-router-dom";
import { UserReducerType } from "../../../types/ReducerTypes";

const NewProduct = () => {
const navigate=useNavigate();
  const { user } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [price, setPrice] = useState<number>(1000);
  const [stock, setStock] = useState<number>(1);
  const [photoPrev, setPhotoPrev] = useState<string>("");
  const [photo, setPhoto] = useState<File>();

  const [newProduct] = useNewProductMutation();
  const changeImageHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const file: File | undefined = e.target.files?.[0];

    const reader: FileReader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPhotoPrev(reader.result);
          setPhoto(file);
        }
      };
    }
  };

  const submitHandler=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
if(!name || !category||!price||stock<0||!photo){
  toast.error("All fields are not filled");
  return;
}

const formData=new FormData();
formData.set("name", name);
formData.set("category", category);

formData.set("price", price.toString());

formData.set("stock", stock.toString());

formData.set("photo", photo!);


const res= await newProduct({
  id:user?._id!,
  formData

});

if("data" in res){
toast.success(res.data.message)
navigate("/admin/product");
}

if ("error" in res) {
  console.error("Create product error:", res.error);

  const message =
    "data" in res.error &&
    res.error.data &&
    typeof res.error.data === "object" &&
    "message" in res.error.data
      ? String(res.error.data.message)
      : "Unable to create Product";

  toast.error(message);
}

  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <main className="product-management">
        <article>
          <form onSubmit={submitHandler}>
            <h2>New Product</h2>
            <div>
              <label>Name</label>
              <input
                required
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>Price</label>
              <input
                required
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                required
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>

            <div>
              <label>Category</label>
              <input
                required
                type="text"
                placeholder="eg. laptop, camera etc"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label>Photo</label>
              <input type="file" onChange={changeImageHandler} />
            </div>

            {photoPrev && <img src={photoPrev} alt="New Image" />}
            <button type="submit">Create</button>
          </form>
        </article>
      </main>
    </div>
  );
};

export default NewProduct;
