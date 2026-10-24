
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import {
  useLoginMutation,
  useEmailSignupMutation,
  useEmailSigninMutation,
} from "../redux/api/UserApi";
import { useDispatch } from "react-redux";
import { userExist } from "../redux/reducer/UserReducer";
import type {
  EmailAuthResponse,
} from "../redux/api/UserApi";

type AuthMode = "signin" | "signup";

const Login = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [date, setDate] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [googleLogin, { isLoading: googleLoading }] = useLoginMutation();
  const [signup, { isLoading: signupLoading }] = useEmailSignupMutation();
  const [signin, { isLoading: signinLoading }] = useEmailSigninMutation();

  const saveUserAndRedirect = (data: EmailAuthResponse) => {
    if (!data.success || !data.user) {
      toast.error(data.message || "Authentication failed");
      return;
    } if (data.token) {
      localStorage.setItem("authToken", data.token);
    }

    dispatch(userExist({
      ...data.user,
      dob: String(data.user.dob)
    } as any));

    toast.success(data.message);
    navigate("/");
  };

  const emailAuthHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password");
      return;
    }

    try {
      if (mode === "signup") {
        if (!name.trim() || !gender || !date) {
          toast.error("Please fill all fields");
          return;
        }

        if (password.length < 8) {
          toast.error("Password must be at least 8 characters");
          return;
        }

        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }

        const result = await signup({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          gender: gender as "male" | "female",
          dob: date,
        }).unwrap();

        saveUserAndRedirect(result);
      } else {
        const result = await signin({
          email: email.trim().toLowerCase(),
          password,
        }).unwrap();

        saveUserAndRedirect(result);
      }
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || "Authentication failed";
      toast.error(message);
    }
  };

  
const googleLoginHandler = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const { user } = await signInWithPopup(auth, provider);

    if (!user.displayName || !user.email || !user.photoURL) {
      toast.error("Google account profile details are incomplete");
      return;
    }

    const result = await googleLogin({
      name: user.displayName,
      _id: user.uid,
      email: user.email,
      photo: user.photoURL,
      role: "user",
      gender: "male",
      dob: "2000-01-01",
    }).unwrap();

    toast.success(result.message);
    navigate("/");
  } catch (error: any) {
    console.error("Google login error:", error);
    toast.error(
      error?.data?.message || error?.message || "Google sign-in failed"
    );
  }
};


  const isLoading = googleLoading || signupLoading || signinLoading;

  return (
    <div className="login">
      <main>
        <h1>{mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}</h1>

        <div>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setMode("signin")}
          >
            Sign In
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={emailAuthHandler}>
          {mode === "signup" && (
            <>
              <div>
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="dob">Date of Birth</label>
                <input
                  id="dob"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {mode === "signup" && (
            <div>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          )}

          <button type="submit" disabled={isLoading}>
            {isLoading
              ? "Please wait..."
              : mode === "signup"
                ? "Create Account"
                : "Sign In"}
          </button>
        </form>

        <p>Or continue with Google</p>

        <div className="google-but">
          <button type="button" onClick={googleLoginHandler} disabled={isLoading}>
            <FcGoogle />
            <span>Sign in with Google</span>
          </button>
        </div>

        <p>
          {mode === "signup"
            ? "Already have an account?"
            : "New to this store?"}{" "}
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              setMode((current) =>
                current === "signup" ? "signin" : "signup"
              )
            }
          >
            {mode === "signup" ? "Sign In" : "Create an account"}
          </button>
        </p>
      </main>
    </div>
  );
};

export default Login;
