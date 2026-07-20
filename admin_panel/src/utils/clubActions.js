import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Menu actions available for a club based on its current moderation status.
 * Only shows transitions that make sense for that state.
 */
export function getClubMenuActions(status) {
  switch (status) {
    case 'pending':
      return [
        {
          key: 'approve',
          label: 'Approve',
          status: 'approved',
          icon: CheckIcon,
          toast: 'Club approved — it is now live on the platform',
        },
        {
          key: 'reject',
          label: 'Reject',
          dialog: 'reject',
          icon: BlockIcon,
          toast: 'Club rejected',
        },
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];

    case 'approved':
      return [
        {
          key: 'suspend',
          label: 'Suspend',
          // Opens a dialog to pick the auto-lift date instead of suspending on
          // the spot — see the suspend dialog in ClubsPage.
          dialog: 'suspend',
          icon: PauseCircleIcon,
        },
        {
          key: 'hide',
          label: 'Hide',
          status: 'hidden',
          icon: VisibilityOffIcon,
          toast: 'Club hidden from public discovery',
        },
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];

    case 'rejected':
      return [
        {
          key: 'approve',
          label: 'Approve',
          status: 'approved',
          icon: CheckIcon,
          toast: 'Club approved — it is now live on the platform',
        },
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];

    case 'suspended':
      return [
        {
          key: 'reactivate',
          label: 'Remove suspension',
          status: 'approved',
          icon: CheckIcon,
          toast: 'Suspension removed — club is live again',
        },
        {
          key: 'hide',
          label: 'Hide',
          status: 'hidden',
          icon: VisibilityOffIcon,
          toast: 'Club hidden from public discovery',
        },
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];

    case 'hidden':
      return [
        {
          key: 'unhide',
          label: 'Unhide & approve',
          status: 'approved',
          icon: VisibilityIcon,
          toast: 'Club unhidden — it is live on the platform again',
        },
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];

    default:
      return [
        {
          key: 'delete',
          label: 'Delete',
          dialog: 'delete',
          icon: DeleteIcon,
          destructive: true,
        },
      ];
  }
}
