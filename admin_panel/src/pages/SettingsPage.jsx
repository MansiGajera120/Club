import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import LockResetIcon from '@mui/icons-material/LockReset';

import { PageHeader, ContentCard, SectionHeading } from '@/components/ui';
import PasswordField from '@/components/common/PasswordField';
import { useAuth } from '@/hooks/useAuth';
import { useAdminUsers, useCreateAdmin } from '@/hooks/useAdmin';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/services/apiClient';
import { ROUTES } from '@/constants';

export function SettingsPage() {
  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your password and control who can access the admin panel."
      />
      <Stack spacing={2.5}>
        <ChangePasswordCard />
        <AddAdminCard />
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

/** Invite a new admin by email + list existing admins. */
function AddAdminCard() {
  const createAdmin = useCreateAdmin();
  const { data } = useAdminUsers({ role: 'admin', page: 1, limit: 100 });
  const admins = data?.items ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = (values) => {
    createAdmin.mutate(values.email, { onSuccess: () => reset() });
  };

  return (
    <ContentCard sx={{ p: 3 }}>
      <SectionHeading
        title="Admin access"
        subtitle="Add a new admin by email. They'll receive a link to set their own password, then can sign in."
      />

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ mt: 2.5 }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ sm: 'flex-start' }}
        >
          <TextField
            label="New admin email"
            type="email"
            fullWidth
            sx={{ maxWidth: 420 }}
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
            startIcon={<PersonAddAlt1Icon />}
            disabled={createAdmin.isPending}
            sx={{ height: 56, flexShrink: 0 }}
          >
            {createAdmin.isPending ? 'Adding…' : 'Add admin'}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Current admins ({admins.length})
      </Typography>
      <List disablePadding>
        {admins.map((a) => (
          <ListItem key={a.id} disableGutters
            secondaryAction={
              <Chip
                size="small"
                label={a.status === 'disabled' ? 'Disabled' : 'Active'}
                color={a.status === 'disabled' ? 'default' : 'success'}
                variant={a.status === 'disabled' ? 'outlined' : 'filled'}
              />
            }
          >
            <ListItemText
              primary={a.name}
              secondary={a.email}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        ))}
        {admins.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No admins found.
          </Typography>
        )}
      </List>
    </ContentCard>
  );
}

export default SettingsPage;
