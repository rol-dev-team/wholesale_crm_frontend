// Login.tsx
'use client';

import React, { useState } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import { FloatingInput } from '@/components/ui/FloatingInput';
import toast, { Toaster } from 'react-hot-toast';
import AuthAPI from '@/api/authAPI'; // নিশ্চিত করুন আপনার API ফাইলে default export আছে কিনা
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // useNavigate ইমপোর্ট করা হয়েছে

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate(); // হুকটি ইনিশিয়ালাইজ করা হয়েছে
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is required')
        .matches(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, underscores allowed'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters'),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        const response = await AuthAPI.login({
          username: values.username,
          password: values.password,
        });

        // ✅ Check if user exists
        if (response.user) {
          // ✅ Check if user is active
          if (response.user.status !== 'active') {
            toast.error('Your account is inactive. Please contact admin.');
            return; // stop login
          }

          // Active user → login
          toast.success(response.message || 'Login successful! 🎉');

          // Store full user object in AuthContext
          login(response.user);

          // Store access token if present
          if (response.token) localStorage.setItem('access_token', response.token);

          // Navigate to dashboard without page reload
          navigate('/dashboard');
        } else {
          toast.error('Login failed, please try again.');
        }
      } catch (error: any) {
        toast.error(error?.message || 'Invalid username or password');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center mt-32 gap-4 w-full relative">
      <Toaster position="top-right" reverseOrder={false} />

      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="px-8 py-14 bg-white shadow-xl rounded-2xl w-full max-w-md relative space-y-6"
          noValidate
        >
          <h2 className="text-3xl font-bold text-center">Login</h2>

          {/* Username */}
          <FloatingInput
            name="username"
            type="text"
            label="Username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.username ? formik.errors.username : undefined}
            disabled={isSubmitting}
            autoComplete="username"
          />

          {/* Password */}
          <FloatingInput
            name="password"
            type="password"
            label="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password ? formik.errors.password : undefined}
            disabled={isSubmitting}
            autoComplete="current-password"
          />

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : (
              'Log In'
            )}
          </button>
        </form>
      </FormikProvider>
    </div>
  );
};

export default Login;
