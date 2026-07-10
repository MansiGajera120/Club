import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, Link, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';

/**
 * Request a password-reset link. The API always responds the same way to avoid
 * leaking which emails have accounts, so on success we show a generic
 * confirmation regardless.
 */
export function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const mutation = useMutation({
    mutationFn: (email) => authService.forgotPassword(email),
  });

  if (mutation.isSuccess) {
    return (
      <Stack spacing={2} sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <MarkEmailReadOutlinedIcon color="primary" sx={{ fontSize: 48 }} />
        </Box>
        <Typography variant="h6" fontWeight={800}>
          Check your email
        </Typography>
        <Typography variant="body2" color="text.secondary">
          If an admin account exists for <b>{getValues('email')}</b>, we&apos;ve sent a
          link to reset your password. The link expires shortly.
        </Typography>
        <Button
          component={RouterLink}
          to={ROUTES.login}
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 1 }}
        >
          Back to sign in
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => mutation.mutate(values.email))}
    >
      <Stack spacing={1} sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800} color="primary">
          Forgot password?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your admin email and we&apos;ll send you a reset link.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
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
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Sending…' : 'Send reset link'}
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

export default ForgotPasswordPage;
