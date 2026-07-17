import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack, Typography, TextField } from '@mui/material';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';

/**
 * Step two of the password-reset flow: confirm the 6-digit code from the email
 * before the new-password form is shown. The server checks the code without
 * consuming it, so [ResetPasswordPage] can spend the same code moments later.
 *
 * The verified email/code are handed on via router state rather than the URL,
 * keeping the OTP out of browser history.
 */
export function VerifyResetCodePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: emailFromQuery, code: '' },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const payload = { email: values.email.trim(), code: values.code.trim() };
      await authService.verifyResetCode(payload);
      return payload;
    },
    onSuccess: (payload) => {
      toast.success('OTP verified successfully');
      navigate(ROUTES.resetPassword, { replace: true, state: payload });
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
          Verify your code
        </Typography>
        <Typography variant="h6" sx={{ color: '#566072', fontWeight: 500 }}>
          {emailFromQuery
            ? `Enter the 6-digit code we sent to ${emailFromQuery}.`
            : 'Enter your email and the 6-digit code we sent you.'}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        {!emailFromQuery && (
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
        )}
        <TextField
          label="6-digit code"
          autoFocus
          inputMode="numeric"
          error={Boolean(errors.code)}
          helperText={errors.code?.message}
          slotProps={{
            // Style the <input> itself, not the OutlinedInput root: the root also
            // contains the <legend> that notches the border, and letter-spacing
            // there widens the notch past the label, breaking the outline.
            htmlInput: { maxLength: 6, sx: { letterSpacing: '0.3em', fontWeight: 700 } },
          }}
          {...register('code', {
            required: 'Please enter the 6-digit code',
            pattern: {
              value: /^\d{6}$/,
              message: 'Enter the 6-digit code from your email',
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
          {mutation.isPending ? 'Verifying…' : 'Verify code'}
        </Button>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
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
            Didn&apos;t get a code? Request a new one
          </Link>
        </Box>
      </Stack>
    </Box>
  );
}

export default VerifyResetCodePage;
