import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

import { env } from '@/config/env';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/services/apiClient';

/**
 * Admin sign-in. Email/password form (React Hook Form) that authenticates via
 * the auth context. Non-admin accounts are rejected by the context.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

  // If already signed in, don't show the login form.
  useEffect(() => {
    if (isAuthenticated) navigate(ROUTES.dashboard, { replace: true });
  }, [isAuthenticated, navigate]);

  const mutation = useMutation({
    mutationFn: (values) => signIn(values),
    onSuccess: (user) => {
      toast.success(`Welcome back, ${user.name}`);
      navigate(ROUTES.dashboard, { replace: true });
    },
    onError: (error) => {
      // Non-admin rejection throws a plain Error; API failures are Axios errors.
      toast.error(error?.message ? error.message : getApiErrorMessage(error));
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          {env.appName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your admin account
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
        />
        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password', { required: 'Password is required' })}
        />
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Signing in…' : 'Sign In'}
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginPage;
