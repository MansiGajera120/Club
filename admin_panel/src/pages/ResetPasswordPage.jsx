import { useForm } from 'react-hook-form';
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Box, Button, Link, Stack } from '@mui/material';

import { ROUTES } from '@/constants';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import PasswordField from '@/components/common/PasswordField';
import AuthHeading from '@/components/ui/AuthHeading';

/**
 * Final step of the password-reset flow. Reachable only with the email/code that
 * [VerifyResetCodePage] already checked, handed over in router state — a direct
 * visit or a refresh (which drops that state) bounces back to the start.
 */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const code = state?.code;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '', confirm: '' },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      authService.resetPassword({ email, code, password: values.password }),
    onSuccess: () => {
      toast.success('Password updated — please sign in with your new password.');
      navigate(ROUTES.login, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!email || !code) {
    return <Navigate to={ROUTES.forgotPassword} replace />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <AuthHeading
        title="Set a new"
        accent="password"
        subtitle={`Choose a new password for ${email}.`}
      />

      <Stack spacing={2}>
        <PasswordField
          label="New password"
          autoFocus
          autoComplete="new-password"
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          {...register('password', {
            required: 'Please enter your password',
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

export default ResetPasswordPage;
