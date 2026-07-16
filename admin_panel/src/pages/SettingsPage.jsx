import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { ContentCard } from '@/components/ui';
import PasswordField from '@/components/common/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants';

export function SettingsPage() {
  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 3, md: 5 },
        overflow: 'hidden',
        // Soft orange glows to fill the empty space, on-theme
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.16), rgba(249,115,22,0) 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-140px',
          left: '-120px',
          width: 420,
          height: 420,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251,146,60,0.14), rgba(251,146,60,0) 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Faint dotted texture layer */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          maskImage: 'radial-gradient(ellipse at center, #000 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, #000 0%, transparent 72%)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <ChangePasswordCard />
      </Box>
    </Box>
  );
}

/** Change the signed-in admin's password. */
function ChangePasswordCard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  // Social / passwordless accounts have no current password to confirm — they
  // set one for the first time instead.
  const requiresCurrentPassword = (user?.provider ?? 'local') === 'local';
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: async () => {
      reset();
      toast.success('Password changed — please sign in again.');
      // The server revokes existing sessions, so send them back to login.
      await logout();
      navigate(ROUTES.login, { replace: true });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <ContentCard
      sx={{
        width: '100%',
        maxWidth: 480,
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(17,24,39,0.10)',
      }}
    >
      {/* Header band */}
      <Box
        sx={{
          px: 4,
          pt: 4,
          pb: 3.5,
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(249,115,22,0.08), rgba(251,146,60,0.04))',
          borderBottom: '1px solid #EEEFF2',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            mx: 'auto',
            mb: 2,
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F97316, #FB923C)',
            boxShadow: '0 8px 22px rgba(249,115,22,0.32)',
          }}
        >
          <LockOutlinedIcon sx={{ color: '#fff', fontSize: 30 }} />
        </Box>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#111827', letterSpacing: '-0.01em' }}>
          {requiresCurrentPassword ? 'Change Password' : 'Set Password'}
        </Typography>
        <Typography sx={{ mt: 0.75, fontSize: '0.92rem', color: '#6B7280', maxWidth: 340, mx: 'auto', lineHeight: 1.5 }}>
          {"You'll be signed out and need to log in again with your new password."}
        </Typography>
      </Box>

      {/* Form */}
      <Box
        component="form"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        sx={{ px: 4, py: 3.5 }}
      >
        <Stack spacing={2.25}>
          {requiresCurrentPassword && (
            <PasswordField
              fullWidth
              label="Current password"
              autoComplete="current-password"
              error={Boolean(errors.currentPassword)}
              helperText={errors.currentPassword?.message}
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
            />
          )}
          <PasswordField
            fullWidth
            label="New password"
            autoComplete="new-password"
            error={Boolean(errors.newPassword)}
            helperText={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'New password is required',
              minLength: { value: 8, message: 'At least 8 characters' },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                message: 'Include at least one letter and one number',
              },
            })}
          />
          <PasswordField
            fullWidth
            label="Confirm new password"
            autoComplete="new-password"
            error={Boolean(errors.confirm)}
            helperText={errors.confirm?.message}
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (v) =>
                v === watch('newPassword') || 'Passwords do not match',
            })}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            startIcon={<LockResetIcon />}
            disabled={mutation.isPending}
            sx={{
              mt: 0.5,
              py: 1.25,
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '1rem',
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              boxShadow: '0 4px 14px rgba(249,115,22,0.30)',
              '&:hover': {
                background: 'linear-gradient(135deg, #EA6C0A, #F97316)',
                boxShadow: '0 6px 20px rgba(249,115,22,0.38)',
              },
            }}
          >
            {mutation.isPending
              ? 'Updating…'
              : requiresCurrentPassword
              ? 'Update password'
              : 'Set password'}
          </Button>
        </Stack>
      </Box>
    </ContentCard>
  );
}

export default SettingsPage;
