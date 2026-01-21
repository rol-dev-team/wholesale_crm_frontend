// "use client";

// import React, { useState } from "react";
// import { useFormik, FormikProvider } from "formik";
// import * as Yup from "yup";
// import { FloatingInput } from "@/components/ui/FloatingInput";
// import { User, Lock, X } from "lucide-react";

// const Login = () => {
//   const [apiError, setApiError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const formik = useFormik({
//     initialValues: { username: "", password: "" },
//     validationSchema: Yup.object({
//       username: Yup.string()
//         .required("Username is required")
//         .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores allowed"),
//       password: Yup.string().required("Password is required"),
//     }),
//     onSubmit: (values) => {
//       setIsSubmitting(true);
//       setApiError("");
//       // just simulate submit delay
//       setTimeout(() => {
//         alert(`Username: ${values.username}\nPassword: ${values.password}`);
//         setIsSubmitting(false);
//       }, 1000);
//     },
//   });

//   return (
//     <div className="flex flex-col items-center justify-center mt-32 gap-4 w-full relative">
//       {/* Toast Notification */}
//       {apiError && (
//         <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
//           <span>{apiError}</span>
//           <button onClick={() => setApiError("")}>
//             <X className="w-4 h-4" />
//           </button>
//         </div>
//       )}

//       <FormikProvider value={formik}>
//         <form
//           onSubmit={formik.handleSubmit}
//           className="px-8 py-14 bg-white shadow-xl rounded-2xl w-full max-w-md relative space-y-6"
//           noValidate
//         >
//           <h2 className="text-3xl font-bold text-center">CRM Login</h2>

//           <FloatingInput
//             name="username"
//             type="text"
//             label="Username"
//             icon={<User className="h-4 w-4" />}
//             value={formik.values.username}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             error={formik.touched.username ? formik.errors.username : undefined}
//             disabled={isSubmitting}
//             autoComplete="username"
//           />

//           <FloatingInput
//             name="password"
//             type="password"
//             label="Password"
//             icon={<Lock className="h-4 w-4" />}
//             value={formik.values.password}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             error={formik.touched.password ? formik.errors.password : undefined}
//             disabled={isSubmitting}
//             autoComplete="current-password"
//           />

//           <button
//             type="submit"
//             disabled={isSubmitting || !formik.isValid}
//             className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isSubmitting ? (
//               <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
//             ) : (
//               "Log In"
//             )}
//           </button>
//         </form>
//       </FormikProvider>
//     </div>
//   );
// };

// export default Login;


"use client";

import React, { useState } from "react";
import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { X } from "lucide-react";

const Login = () => {
  const [apiError, setApiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Username is required")
        .matches(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, underscores allowed"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      setIsSubmitting(true);
      setApiError("");
      // just simulate submit delay
      setTimeout(() => {
        alert(`Username: ${values.username}\nPassword: ${values.password}`);
        setIsSubmitting(false);
      }, 1000);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center mt-32 gap-4 w-full relative">
      {/* Toast Notification */}
      {apiError && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 mt-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span>{apiError}</span>
          <button onClick={() => setApiError("")}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <FormikProvider value={formik}>
        <form
          onSubmit={formik.handleSubmit}
          className="px-8 py-14 bg-white shadow-xl rounded-2xl w-full max-w-md relative space-y-6"
          noValidate
        >
          <h2 className="text-3xl font-bold text-center">Login</h2>

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

          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className="w-full rounded-lg bg-blue-600 text-white py-3 font-medium shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : (
              "Log In"
            )}
          </button>
        </form>
      </FormikProvider>
    </div>
  );
};

export default Login;
