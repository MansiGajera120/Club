import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

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
              background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8469 100%)',
              boxShadow: '0 12px 28px rgba(255, 90, 95, 0.32)',
            }}
          >
            <MarkEmailReadOutlinedIcon sx={{ fontSize: 48, color: '#FFFFFF' }} />
          </Box>
        </Box>

        <Stack spacing={1}>
          <Typography
            variant="h3"
            fontWeight={850}
            sx={{ color: '#111827', fontSize: '2.5rem', letterSpacing: '-0.02em' }}
          >
            Check your email
          </Typography>
          <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
            If an admin account exists for{' '}
            <b style={{ color: '#111827' }}>{getValues('email')}</b>, we&apos;ve sent a
            6-digit code to reset your password. The code expires shortly.
          </Typography>
        </Stack>

        <Button
          component={RouterLink}
          to={`${ROUTES.resetPassword}?email=${encodeURIComponent(getValues('email'))}`}
          variant="contained"
          size="large"
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
      <Stack spacing={1} sx={{ mb: 6, textAlign: 'center' }}>
        <Typography
          variant="h3"
          fontWeight={850}
          sx={{ color: '#111827', fontSize: '2.5rem', letterSpacing: '-0.02em' }}
        >
          Forgot password?
        </Typography>
        <Typography variant="h6" sx={{ color: '#6B7280', fontWeight: 500 }}>
          Enter your admin email and we&apos;ll send you a 6-digit reset code.
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <TextField
          placeholder="Enter email"
          type="email"
          autoComplete="email"
          autoFocus
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
                fontSize: '1.2rem',
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

export default ForgotPasswordPage;
