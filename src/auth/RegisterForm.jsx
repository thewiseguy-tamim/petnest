// src/components/auth/RegisterForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const RegisterForm = ({ onSubmit, loading }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Username"
        {...register('username', { 
          required: 'Username is required',
          minLength: {
            value: 3,
            message: 'Username must be at least 3 characters'
          }
        })}
        error={errors.username?.message}
      />
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
      <Input
        label="Password"
        type="password"
        {...register('password', { 
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters'
          }
        })}
        error={errors.password?.message}
      />
      <Input
        label="Confirm Password"
        type="password"
        {...register('confirmPassword', { 
          required: 'Please confirm your password',
          validate: value => value === password || 'Passwords do not match'
        })}
        error={errors.confirmPassword?.message}
      />
      <Select
        label="I want to"
        {...register('role')}
        options={[
          { value: 'client', label: 'Adopt or buy a pet' },
          { value: 'moderator', label: 'Help moderate listings' }
        ]}
      />
      <Button type="submit" loading={loading} className="w-full">
        Create Account
      </Button>
    </form>
  );
};

export default RegisterForm;