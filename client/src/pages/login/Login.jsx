import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "../../client-validations/authSchema";
import "./login.scss";
import React from "react";
import {
  checkAuthentication,
  loginUser,
} from "../../services/authService/auth-service";
import {
  checkUserLoggedIn
} from "../../services/authService/auth-service";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  useEffect(() => {
    if (checkAuthentication()) {
      navigate("/", { replace: true });
    }
    setInitialCheckDone(true);
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setServerError(null);
      await loginUser(data);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialCheckDone) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login">
      <div className="card">
        <div className="left">
          <h1>Biomophone</h1>
          <p>
            Welcome to the world of Social Media, where you can connect with
            family, friends, relatives and more.
          </p>
          <span>Don't have an account?</span>
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
        <div className="right">
          <h1>Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <input
                type="text"
                placeholder="Username"
                {...register("username")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  errors.username
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-600"
                }`}
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                {...register("password")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-600"
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm text-center">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full px-6 py-2 font-semibold rounded-lg transition ${
                isSubmitting || isLoading
                  ? "bg-indigo-400 cursor-not-allowed opacity-75"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSubmitting || isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
