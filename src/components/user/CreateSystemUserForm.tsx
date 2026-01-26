// src/components/user/CreateSystemUserForm.tsx
'use client';

import * as React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { UserAPI } from '@/api/user';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { SelectItem } from '@/components/ui/select';

/* ---------------- Types ---------------- */
export type UserRole = 'Admin' | 'Supervisor' | 'KAM' | 'Management';
export type UserStatus = 'active' | 'inactive';

export type SystemUser = {
  id: string;
  fullName: string;
  userName: string;
  email: string;
  phone: string;
  password: string;
  status: UserStatus;
  role: UserRole;
  kamId?: string;
  supervisorIds?: string[];
};

type SelectOption = {
  label: string;
  value: string;
};

/* ---------------- Validation ---------------- */
const UserValidationSchema = (isEditing: boolean) =>
  Yup.object({
    fullName: Yup.string().required('Full name is required'),
    userName: Yup.string().required('User Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string()
      .matches(/^01[3-9]\d{8}$/, 'Phone number must be a valid Bangladesh number (01XXXXXXXXX)')
      .required('Phone number is required'),
    role: Yup.string().required('Role is required'),

    password: isEditing
      ? Yup.string().min(6, 'Minimum 6 characters').notRequired()
      : Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),

    confirmPassword: isEditing
      ? Yup.string().when('password', {
          is: (val: string) => val && val.length > 0,
          then: (schema) =>
            schema
              .oneOf([Yup.ref('password')], 'Passwords must match')
              .required('Confirm password is required'),
          otherwise: (schema) => schema.notRequired(),
        })
      : Yup.string()
          .oneOf([Yup.ref('password')], 'Passwords must match')
          .required('Confirm password is required'),
  });

/* ---------------- Props ---------------- */
interface CreateSystemUserFormProps {
  initialValues?: Partial<SystemUser>;
  editingUserId: string | null;
  onSave: (values: any) => void;
  kamOptions: SelectOption[];
  supervisorOptions: SelectOption[];
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
    fullName: '',
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    status: 'active' as UserStatus,
    role: '',
    kamId: '',
    supervisorIds: [] as string[],
  };

  const roleMap: Record<string, string> = {
    Admin: 'super_admin',
    Supervisor: 'supervisor',
    KAM: 'kam',
    Management: 'management',
  };

  const mappedInitialValues = editingUserId
    ? {
        fullName: initialValues?.fullName ?? '',
        userName: initialValues?.userName ?? '',
        email: initialValues?.email ?? '',
        phone: initialValues?.phone ?? '',
        role: initialValues?.role ?? '',
        status: initialValues?.status ?? 'active',
        kamId: initialValues?.kamId ?? '',
        supervisorIds: initialValues?.supervisorIds ?? [],
        password: '',
        confirmPassword: '',
      }
    : defaultValues;

  return (
    <Formik
      initialValues={mappedInitialValues}
      enableReinitialize
      validationSchema={UserValidationSchema(!!editingUserId)}
      onSubmit={async (values, { resetForm, setSubmitting, setFieldError }) => {
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
            supervisor_ids: values.supervisorIds.length === 0 ? 'all' : values.supervisorIds,
            status: values.status,
          };

          if (editingUserId) {
            payload.password = values.password;
            await UserAPI.updateUser(editingUserId, payload);
          } else {
            await UserAPI.createUser(payload);
          }

          resetForm();
          alert('User saved successfully!');
          onSave(payload); // optional callback
        } catch (err: any) {
          console.error(err);
          alert('Failed to save user. Please try again.');
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
            onValueChange={(v) => setFieldValue('role', v)}
            onTouched={() => setFieldTouched('role', true)}
            error={touched.role ? errors.role : undefined}
          >
            {['Admin', 'Supervisor', 'KAM', 'Management'].map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* KAM */}
          <FloatingSelect
            label="KAM"
            value={values.kamId}
            onValueChange={(v) => setFieldValue('kamId', v)}
            onTouched={() => setFieldTouched('kamId', true)}
          >
            {(kamOptions || []).map((k) => (
              <SelectItem key={k.value} value={k.value}>
                {k.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Supervisors (multi-select) */}
          <FloatingSelect
            label="Supervisors"
            value={values.supervisorIds.join(',')}
            onValueChange={(v) => {
              const ids = v.split(',').filter(Boolean);
              setFieldValue('supervisorIds', ids);
            }}
            onTouched={() => setFieldTouched('supervisorIds', true)}
          >
            {(supervisorOptions || []).map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Active */}
          <div className="flex items-center gap-3">
            <Label>Status</Label>
            <Switch
              checked={values.status === 'active'}
              onCheckedChange={(checked) =>
                setFieldValue('status', checked ? 'active' : 'inactive')
              }
            />
            <span className="text-sm text-muted-foreground">
              {values.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {editingUserId ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
