import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import MainLoader from "./components/MainLoader";
import Header from "./components/Header";
import { Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useDispatch, useSelector } from "react-redux";
import { userExist, userNotExist } from "./redux/reducer/UserReducer";
import { getUser } from "./redux/api/UserApi";
import Loader from "./components/admin/Loader";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import { UserReducerType } from "./types/ReducerTypes";
import ErrorPage from "./components/ErrorPage";

const Profile = lazy(() => import("./pages/Profile"));
const Home = lazy(() => import("./pages/Home"));
const Categories = lazy(() => import("./pages/ShopCategories"));
const Search = lazy(() => import("./pages/Search"));
const Cart = lazy(() => import("./pages/Cart"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Login = lazy(() => import("./pages/Login"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

// Admin dashboards
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));

const NewProduct = lazy(
  () => import("./pages/admin/management/newproduct")
);

const Checkout = lazy(() => import("./components/Checkout"));

const ProductManagement = lazy(
  () => import("./pages/admin/management/productmanagement")
);

const TransactionManagement = lazy(
  () => import("./pages/admin/management/transactionmanagement")
);

const App = () => {
  const { user, loading } = useSelector(
    (state: { UserReducer: UserReducerType }) => state.UserReducer
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const data = await getUser(firebaseUser.uid);

          if (data.success && data.user) {
            dispatch(userExist(data.user));
          } else {
            dispatch(userNotExist());
          }

          return;
        }

        const token = localStorage.getItem("authToken");

        if (!token) {
          dispatch(userNotExist());
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_SERVER}/api/v1/user/session`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          localStorage.removeItem("authToken");
          dispatch(userNotExist());
          return;
        }

        const data = await response.json();

        if (data.success && data.user) {
          dispatch(userExist(data.user));
        } else {
          localStorage.removeItem("authToken");
          dispatch(userNotExist());
        }
      } catch (error) {
        console.error("Session restore failed:", error);
        dispatch(userNotExist());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return loading ? (
    <Loader />
  ) : (
    <Router>
      <Header user={user} />

      <Suspense fallback={<MainLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/404" element={<ErrorPage />} />

          {/* Login */}
          <Route
            path="/login"
            element={
              <ProtectedRoute isAuthenticated={!user}>
                <Login />
              </ProtectedRoute>
            }
          />

          {/* Authenticated user routes */}
          <Route element={<ProtectedRoute isAuthenticated={!!user} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/pay" element={<Checkout />} />
          </Route>

          {/* Admin routes */}
          <Route
            element={
              <ProtectedRoute
                isAuthenticated={true}
                adminRoute={true}
                isAdmin={user?.role === "admin"}
              />
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/product" element={<Products />} />
            <Route path="/admin/customer" element={<Customers />} />
            <Route path="/admin/transaction" element={<Transaction />} />

            {/* Charts */}
            <Route path="/admin/chart/bar" element={<Barcharts />} />
            <Route path="/admin/chart/pie" element={<Piecharts />} />
            <Route path="/admin/chart/line" element={<Linecharts />} />

            {/* Apps */}
            <Route path="/admin/app/coupon" element={<Coupon />} />
            <Route path="/admin/app/stopwatch" element={<Stopwatch />} />
            <Route path="/admin/app/toss" element={<Toss />} />

            {/* Management */}
            <Route path="/admin/product/new" element={<NewProduct />} />
            <Route
              path="/admin/product/:id"
              element={<ProductManagement />}
            />
            <Route
              path="/admin/transaction/:id"
              element={<TransactionManagement />}
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>

      <Toaster position="bottom-left" />
    </Router>
  );
};

export default App;