import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Box, Button, Link, Stack, TextField } from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';
import AuthHeading from '@/components/ui/AuthHeading';

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
      <Stack spacing={3} sx={{ textAlign: 'center' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #2563EB 0%, #38BDF8 100%)',
              boxShadow: '0 12px 28px rgba(37,99,235, 0.32)',
            }}
          >
            <MarkEmailReadOutlinedIcon sx={{ fontSize: 48, color: '#FFFFFF' }} />
          </Box>
        </Box>

        <AuthHeading
          title="Check your"
          accent="email"
          subtitle={
            <>
              If an admin account exists for{' '}
              <b style={{ color: '#111827' }}>{getValues('email')}</b>, we&apos;ve sent a
              6-digit code to reset your password. The code expires shortly.
            </>
          }
        />

        <Button
          component={RouterLink}
          to={`${ROUTES.verifyResetCode}?email=${encodeURIComponent(getValues('email'))}`}
          variant="contained"
          size="large"
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
            mt: 1,
          }}
        >
          Enter reset code
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit((values) => mutation.mutate(values.email))}
    >
      <AuthHeading
        title="Forgot your"
        accent="password?"
        subtitle="Enter your admin email and we'll send you a 6-digit reset code."
      />

      <Stack spacing={2}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
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
          {mutation.isPending ? 'Sending…' : 'Send reset code'}
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Link
            component={RouterLink}
            to={ROUTES.login}
            variant="body2"
            underline="none"
            sx={{
              fontWeight: 600,
              color: '#8A93A3',
              '&:hover': { color: '#2563EB' },
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

export default ForgotPasswordPage;
