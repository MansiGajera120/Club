import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Link,
  Stack,
  Typography,
  InputAdornment,
  TextField,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PinOutlinedIcon from '@mui/icons-material/PinOutlined';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import PasswordField from '@/components/common/PasswordField';

const fieldInputSx = {
  borderRadius: '16px',
  height: 64,
  fontSize: '1.2rem',
  border: '1px solid rgba(229, 231, 235, 0.9)',
  '& fieldset': { border: 'none' },
  bgcolor: '#FFFFFF',
};

/**
 * Complete a password reset with the 6-digit code emailed by the forgot-password
 * flow. The email is prefilled from the `?email=` query param when present.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: emailFromQuery,
      code: '',
      password: '',
      confirm: '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      authService.resetPassword({
        email: values.email.trim(),
        code: values.code.trim(),
        password: values.password,
      }),
    onSuccess: () => {
      toast.success('Password updated — please sign in with your new password.');
      navigate(ROUTES.login, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <Box component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <Stack spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          fontWeight={850}
          sx={{ color: '#111827', fontSize: '2.5rem', letterSpacing: '-0.02em' }}
        >
          Set a new password
        </Typography>
        <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
          Enter the 6-digit code from your email and choose a new password.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {!emailFromQuery && (
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
                sx: fieldInputSx,
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
        )}
        <TextField
          placeholder="6-digit code"
          autoFocus
          inputMode="numeric"
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  <PinOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </InputAdornment>
              ),
              sx: { ...fieldInputSx, letterSpacing: '0.3em', fontWeight: 700 },
            },
            htmlInput: { maxLength: 6 },
          }}
          {...register('code', {
            required: 'Enter the 6-digit code',
            pattern: {
              value: /^\d{6}$/,
              message: 'Enter the 6-digit code from your email',
            },
          })}
        />
        <PasswordField
          placeholder="New password"
          autoComplete="new-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  <LockOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </InputAdornment>
              ),
              sx: fieldInputSx,
            },
          }}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'At least 8 characters' },
            pattern: {
              value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
              message: 'Include at least one letter and one number',
            },
          })}
        />
        <PasswordField
          placeholder="Confirm password"
          autoComplete="new-password"
          error={Boolean(errors.confirm)}
          helperText={errors.confirm?.message}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 2 }}>
                  <LockOutlinedIcon sx={{ color: '#9CA3AF', fontSize: 26 }} />
                </InputAdornment>
              ),
              sx: fieldInputSx,
            },
          }}
          {...register('confirm', {
            required: 'Please confirm your password',
            validate: (v) => v === watch('password') || 'Passwords do not match',
          })}
        />
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
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component={RouterLink}
            to={ROUTES.login}
            variant="body2"
            underline="none"
            sx={{
              fontWeight: 600,
              color: '#9CA3AF',
              '&:hover': { color: '#FF5A5F' },
              transition: 'color 0.2s',
            }}
          >
            Back to sign in
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

export default ResetPasswordPage;
