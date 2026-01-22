"use client";

import * as React from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { UserAPI } from "@/api/User.api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingSelect } from "@/components/ui/FloatingSelect";
import { SelectItem } from "@/components/ui/select";

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
  kamId?: string;
  supervisorIds?: string[] | "all";
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
  kamOptions: { id: string; name: string }[];
  supervisorOptions: { id: string; name: string }[];
}

/* ---------------- Component ---------------- */
export function CreateSystemUserForm({
  initialValues,
  editingUserId,
  onSave,
  kamOptions,
  supervisorOptions,
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
    kamId: "",
    supervisorIds: [] as string[],
  };

  const roleMap: Record<string, string> = {
    Admin: "admin",
    Supervisor: "supervisor",
    KAM: "kam",
    Management: "management",
  };

  return (
    <Formik
      initialValues={{ ...defaultValues, ...initialValues }}
      enableReinitialize
      validationSchema={UserValidationSchema}
      onSubmit={async (values, { resetForm, setSubmitting }) => {
        try {
          setSubmitting(true);

          // Prepare backend payload
          const payload: any = {
            fullname: values.fullName,
            username: values.userName,
            email: values.email,
            phone: values.phone,
            password: values.password,
            role: roleMap[values.role],
            default_kam_id: values.kamId || null,
            supervisor_ids:
              values.supervisorIds.length === 0 ? "all" : values.supervisorIds,
            status: values.active ? "active" : "inactive",
          };

          if (editingUserId) {
            await UserAPI.updateUser(editingUserId, payload);
          } else {
            await UserAPI.createUser(payload);
          }

          resetForm();
          alert("User saved successfully!");
          onSave(payload); // optional callback
        } catch (err: any) {
          console.error(err);
          alert("Failed to save user. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldTouched,
        isSubmitting,
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
          <FloatingSelect
            label="Role"
            value={values.role}
            onValueChange={(v) => setFieldValue("role", v)}
            onTouched={() => setFieldTouched("role", true)}
            error={touched.role ? errors.role : undefined}
          >
            {["Admin", "Supervisor", "KAM", "Management"].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* KAM */}
          <FloatingSelect
            label="KAM"
            value={values.kamId}
            onValueChange={(v) => setFieldValue("kamId", v)}
            onTouched={() => setFieldTouched("kamId", true)}
          >
            {(kamOptions || []).map((k) => (
              <SelectItem key={k.id} value={k.id}>
                {k.name}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Supervisors (multi-select) */}
          <FloatingSelect
            label="Supervisors"
            value={values.supervisorIds.join(",")}
            onValueChange={(v) => {
              const ids = v.split(",").filter(Boolean);
              setFieldValue("supervisorIds", ids);
            }}
            onTouched={() => setFieldTouched("supervisorIds", true)}
          >
            {(supervisorOptions || []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Label>Active</Label>
            <Switch
              checked={values.active}
              onCheckedChange={(v) => setFieldValue("active", v)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {editingUserId ? "Update User" : "Create User"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
