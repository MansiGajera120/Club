import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack, TextField, Typography, InputAdornment } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/useAuth';
import { getApiErrorMessage } from '@/services/apiClient';
import PasswordField from '@/components/common/PasswordField';

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
      {/* Circle Icon Badge */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Box
          sx={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            border: '2px solid rgba(229, 231, 235, 0.6)',
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
              border: '2px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(249, 250, 251, 0.8)',
            }}
          >
            <GroupsIcon sx={{ color: '#374151', fontSize: 48 }} />
          </Box>
        </Box>
      </Box>

      {/* Header */}
      <Stack spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={850} sx={{ color: '#111827', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          Welcome!
        </Typography>
        <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
          Please sign in to continue
        </Typography>
      </Stack>

      {/* Fields */}
      <Stack spacing={2.5}>
        <TextField
          placeholder="Enter email"
          type="email"
          autoComplete="email"
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  <EmailOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '16px',
                height: 64,
                fontSize: '1.05rem',
                border: '1px solid rgba(229, 231, 235, 0.9)',
                '& fieldset': { border: 'none' },
                bgcolor: '#FFFFFF',
              },
            },
          }}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email',
            },
          })}
        />

        <Box sx={{ position: 'relative' }}>
          <PasswordField
            placeholder="Enter password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ mr: 2 }}>
                    <LockOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 26 }} />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '16px',
                  height: 64,
                  fontSize: '1.05rem',
                  border: '1px solid rgba(229, 231, 235, 0.9)',
                  '& fieldset': { border: 'none' },
                  bgcolor: '#FFFFFF',
                },
              },
            }}
            {...register('password', { required: 'Password is required' })}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Link
              component={RouterLink}
              to={ROUTES.forgotPassword}
              variant="body2"
              underline="none"
              sx={{
                fontWeight: 600,
                color: '#9CA3AF',
                '&:hover': { color: '#FF5A5F' },
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
            background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8469 100%)',
            boxShadow: '0 6px 20px rgba(255, 90, 95, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #E04E53 0%, #E8745E 100%)',
              boxShadow: '0 8px 24px rgba(255, 90, 95, 0.4)',
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
