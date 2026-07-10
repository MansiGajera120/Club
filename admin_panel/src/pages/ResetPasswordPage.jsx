import { useForm } from 'react-hook-form';
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack, Typography } from '@mui/material';

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
      <Stack spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          Set a new password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a strong password for your admin account.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <PasswordField
          label="New password"
          autoComplete="new-password"
          autoFocus
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
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
          label="Confirm password"
          autoComplete="new-password"
          error={Boolean(errors.confirm)}
          helperText={errors.confirm?.message}
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
        >
          {mutation.isPending ? 'Updating…' : 'Update password'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to={ROUTES.login} variant="body2" underline="hover">
            Back to sign in
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

export default ResetPasswordPage;
