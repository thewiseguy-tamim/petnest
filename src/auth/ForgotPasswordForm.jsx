// src/components/auth/ForgotPasswordForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';

const ForgotPasswordForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        {...register('email', { 
          required: 'Email is required',
          pattern: {
            value: /\S+@\S+\.\S+/,
            message: 'Invalid email address'
          }
        })}
        error={errors.email?.message}
      />
      <Button type="submit" loading={loading} className="w-full">
        Send Reset Link
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;