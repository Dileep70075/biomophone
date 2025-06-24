import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "./register.scss";
import { registerSchema } from "../../client-validations/authSchema";
import { registerUser } from "../../services/authService/auth-service";
// const API_URL = import.meta.env.VITE_APP_MY_API_URL;
// console.log("API_URL : ", API_URL);
const Register = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data) => {
    try {
      setServerError(null);
      const response = await registerUser(data);  
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
             if (err.field) {
               setError(err.field, { type: "server", message: err.error });
             } else {
               setServerError(err.error);
             }
           }
  };

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <h1>Biomophone.</h1>
          <p className="">
            Welcome to the world of Social Media, where you can connect with
            family, friends, relatives and more.
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>

        <div className="right">
          <h1 className="">Register</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                type="email"
                placeholder="Email"
                {...register("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-600"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
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

            <div>
              <input
                type="text"
                placeholder="Name"
                {...register("name")}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 ${
                  errors.name
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-600"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
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
              disabled={isSubmitting}
              className={`w-full px-6 py-2 font-semibold rounded-lg transition ${
                isSubmitting
                  ? "bg-indigo-400 cursor-not-allowed opacity-75"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {isSubmitting ? "Processing..." : "Register"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
