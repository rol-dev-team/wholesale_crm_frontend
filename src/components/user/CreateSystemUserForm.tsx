"use client";

import * as React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { FloatingInput } from "@/components/ui/FloatingInput";

/* ---------------- Types ---------------- */
export type UserRole = "Admin" | "Supervisor" | "KAM" | "Management";

export type SystemUser = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  password: string;
  active: boolean;
  role: UserRole;
};

/* ---------------- Validation ---------------- */
const UserValidationSchema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  userName: Yup.string().required("User Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm password is required"),
  role: Yup.string().required("Role is required"),
});

/* ---------------- Props ---------------- */
interface CreateSystemUserFormProps {
  initialValues?: Partial<SystemUser>;
  editingUserId: string | null;
  onSave: (values: any) => void;
}

/* ---------------- Component ---------------- */
export function CreateSystemUserForm({
  initialValues,
  editingUserId,
  onSave,
}: CreateSystemUserFormProps) {
  const defaultValues = {
    fullName: "",
    userName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    active: true,
    role: "",
  };

  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      enableReinitialize
      validationSchema={UserValidationSchema}
      onSubmit={(values, { resetForm }) => {
        onSave(values);
        resetForm();
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
      }) => (
        <Form className="space-y-4 rounded-lg border bg-muted/50 p-4">
          {/* Full Name */}
          <FloatingInput
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.fullName ? errors.fullName : undefined}
          />

          {/* User Name */}
          <FloatingInput
            label="User Name"
            name="userName"
            value={values.userName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.userName ? errors.userName : undefined}
          />

          {/* Email */}
          <FloatingInput
            label="Email"
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.email ? errors.email : undefined}
          />

          {/* Phone */}
          <FloatingInput
            label="Phone Number"
            name="phone"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.phone ? errors.phone : undefined}
          />

          {/* Password */}
          <FloatingInput
            label="Password"
            type="password"
            name="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : undefined}
          />

          {/* Confirm Password */}
          <FloatingInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.confirmPassword ? errors.confirmPassword : undefined}
          />

          {/* Role */}
          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              value={values.role}
              onValueChange={(v) => setFieldValue("role", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {["Admin", "Supervisor", "KAM", "Management"].map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {touched.role && errors.role && (
              <p className="text-xs text-destructive">{errors.role}</p>
            )}
          </div>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Label>Active</Label>
            <Switch
              checked={values.active}
              onCheckedChange={(v) => setFieldValue("active", v)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              {editingUserId ? "Update User" : "Create User"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
