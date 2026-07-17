import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack, TextField } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/services/apiClient';
import PasswordField from '@/components/common/PasswordField';
import AuthHeading from '@/components/ui/AuthHeading';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } });

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
      toast.error(error?.message ? error.message : getApiErrorMessage(error));
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      sx={{
        width: '100%',
        py: 4,
        px: { xs: 2, sm: 0 },
      }}
    >
      {/* Circle Icon Badge — left-aligned to sit over the headline's column. */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            border: '2px solid rgba(228,234,242, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: '5px',
          }}
        >
          <Box
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(37,99,235, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(248,251,254, 0.8)',
            }}
          >
            <GroupsIcon sx={{ color: '#566072', fontSize: 38 }} />
          </Box>
        </Box>
      </Box>

      <AuthHeading
        title="Welcome"
        accent="back"
        subtitle="Sign in to manage clubs, events and members."
      />

      {/* Fields */}
      <Stack spacing={2.5}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          {...register('email', {
            required: 'Please enter your email',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
        />

        <Box sx={{ position: 'relative' }}>
          <PasswordField
            label="Password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', { required: 'Please enter your password' })}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Link
              component={RouterLink}
              to={ROUTES.forgotPassword}
              variant="body2"
              underline="none"
              sx={{
                fontWeight: 600,
                color: '#8A93A3',
                '&:hover': { color: '#2563EB' },
                transition: 'color 0.2s',
              }}
            >
              Forgot Password?
            </Link>
          </Box>
        </Box>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={mutation.isPending}
          sx={{
            height: 64,
            borderRadius: '16px',
            textTransform: 'none',
            fontSize: '1.15rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
            boxShadow: '0 6px 20px rgba(37,99,235, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)',
              boxShadow: '0 8px 24px rgba(37,99,235, 0.4)',
            },
            mt: 3,
          }}
        >
          {mutation.isPending ? 'Signing in…' : 'Sign In'}
        </Button>
      </Stack>
    </Box>
  );
}

export default LoginPage;
