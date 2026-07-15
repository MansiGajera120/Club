import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';

import { PageHeader, ContentCard, SectionHeading } from '@/components/ui';
import PasswordField from '@/components/common/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants';

export function SettingsPage() {
  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your password."
      />
      <Stack spacing={2.5}>
        <ChangePasswordCard />
      </Stack>
    </Box>
  );
}

/** Change the signed-in admin's password. */
function ChangePasswordCard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
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
    <ContentCard sx={{ p: 3 }}>
      <SectionHeading
        title="Change password"
        subtitle="You'll be signed out and need to log in again with your new password."
      />
      <Box
        component="form"
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        sx={{ mt: 2.5, maxWidth: 420 }}
      >
        <Stack spacing={2}>
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={Boolean(errors.currentPassword)}
            helperText={errors.currentPassword?.message}
            {...register('currentPassword', {
              required: 'Current password is required',
            })}
          />
          <PasswordField
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
          <Box>
            <Button
              type="submit"
              variant="contained"
              startIcon={<LockResetIcon />}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </Box>
        </Stack>
      </Box>
    </ContentCard>
  );
}

export default SettingsPage;
