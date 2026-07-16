import { useForm } from 'react-hook-form';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack, Typography, InputAdornment } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import PasswordField from '@/components/common/PasswordField';

/**
 * Complete a password reset. The one-time token arrives in the URL (the emailed
 * link points to `/reset-password?token=…`). Without a token the page shows an
 * invalid-link message.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { password: '', confirm: '' } });

  const mutation = useMutation({
    mutationFn: (password) => authService.resetPassword({ token, password }),
    onSuccess: () => {
      toast.success('Password updated — please sign in with your new password.');
      navigate(ROUTES.login, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!token) {
    return (
      <Stack spacing={2} sx={{ textAlign: 'center' }}>
        <Typography variant="h6" fontWeight={800}>
          Invalid reset link
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This password-reset link is missing or malformed. Request a new one to
          continue.
        </Typography>
        <Button component={RouterLink} to={ROUTES.forgotPassword} variant="contained">
          Request a new link
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => mutation.mutate(values.password))}
    >
      <Stack spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={850} sx={{ color: '#111827', fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
          Set a new password
        </Typography>
        <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
          Choose a strong password for your admin account.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <PasswordField
          placeholder="New password"
          autoComplete="new-password"
          autoFocus
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
                fontSize: '1.2rem',
                border: '1px solid rgba(229, 231, 235, 0.9)',
                '& fieldset': { border: 'none' },
                bgcolor: '#FFFFFF',
              },
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
              sx: {
                borderRadius: '16px',
                height: 64,
                fontSize: '1.2rem',
                border: '1px solid rgba(229, 231, 235, 0.9)',
                '& fieldset': { border: 'none' },
                bgcolor: '#FFFFFF',
              },
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
