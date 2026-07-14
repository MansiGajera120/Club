import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';

import { ROUTES } from '@/constants';
import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';

const DRAWER_WIDTH = 290;

const NAV_ITEMS = [
  { label: 'Overview', path: ROUTES.dashboard, icon: <DashboardIcon /> },
  { label: 'Analytics', path: ROUTES.analytics, icon: <TimelineIcon /> },
  { label: 'Clubs', path: ROUTES.clubs, icon: <GroupsIcon /> },
  { label: 'Users', path: ROUTES.users, icon: <PeopleIcon /> },
  { label: 'Events', path: ROUTES.events, icon: <EventIcon /> },
  { label: 'Settings', path: ROUTES.settings, icon: <SettingsIcon /> },
];

const PAGE_TITLES = {
  [ROUTES.dashboard]: 'Overview',
  [ROUTES.analytics]: 'Analytics',
  [ROUTES.clubs]: 'Clubs',
  [ROUTES.users]: 'Users',
  [ROUTES.events]: 'Events',
  [ROUTES.settings]: 'Settings',
};

function getPageTitle(pathname) {
  if (pathname === ROUTES.dashboard) return PAGE_TITLES[ROUTES.dashboard];
  const match = Object.entries(PAGE_TITLES).find(
    ([path]) => path !== ROUTES.dashboard && pathname.startsWith(path)
  );
  return match?.[1] ?? env.appName;
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const pageTitle = getPageTitle(location.pathname);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD';

  const go = (path) => {
    if (path.startsWith('#')) return;
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    try {
      setLogoutDialogOpen(false);
      await logout();
      toast.success('Signed out successfully');
    } catch {
      toast.error('Could not sign out. Please try again.');
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <Box sx={{
        px: 3, pt: 3, pb: 3,
        background: 'linear-gradient(135deg, #FF5A5F 0%, #FF8469 100%)',
        display: 'flex', alignItems: 'center', gap: 1.5,
      }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '12px',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <GroupsIcon sx={{ color: '#fff', fontSize: 26 }} />
        </Box>
        <Box>
          <Typography fontWeight={800} letterSpacing="0.12em" sx={{ color: '#fff', fontSize: '1.2rem', lineHeight: 1 }}>
            CLUBHUB
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em', mt: 0.2 }}>
            Admin Portal
          </Typography>
        </Box>
      </Box>

      {/* Nav Section label */}
      <Box sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Main Menu
        </Typography>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5 }}>
        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const selected =
              item.path === ROUTES.dashboard
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

            return (
              <ListItemButton
                key={item.label}
                selected={selected}
                onClick={() => go(item.path)}
                sx={{
                  borderRadius: '12px',
                  mb: 1,
                  py: 1.5,
                  px: 2.5,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(255,90,95,0.12) 0%, rgba(255,132,105,0.08) 100%)',
                    boxShadow: '0 2px 8px rgba(255,90,95,0.10)',
                    '& .MuiListItemIcon-root': { color: '#FF5A5F' },
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(255,90,95,0.16) 0%, rgba(255,132,105,0.12) 100%)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44, color: selected ? '#FF5A5F' : '#9CA3AF' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selected ? 800 : 600,
                    fontSize: '1.05rem',
                    color: selected ? '#111827' : '#6B7280',
                  }}
                />
                {selected && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FF5A5F' }} />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* User card + logout */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2, borderColor: 'rgba(0,0,0,0.06)' }} />
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 2,
          p: 1.5, borderRadius: '12px',
          background: 'rgba(0,0,0,0.025)',
          cursor: 'pointer',
          transition: 'background 0.2s',
          '&:hover': { background: 'rgba(0,0,0,0.05)' },
        }}
          onClick={handleLogout}
        >
          <Avatar sx={{ width: 44, height: 44, bgcolor: '#FF5A5F', fontSize: '1rem', fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827', display: 'block', lineHeight: 1.2, fontSize: '0.95rem' }} noWrap>
              {user?.name ?? 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.8rem' }} noWrap>
              Sign out
            </Typography>
          </Box>
          <LogoutIcon sx={{ fontSize: 20, color: '#9CA3AF' }} />
        </Box>
      </Box>
    </Box>
  );

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    border: 'none',
    bgcolor: '#FFFFFF',
    boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
  };

  return (
    <Box sx={{
      display: 'flex', minHeight: '100vh',
      bgcolor: '#F4F6FA',
      background: 'linear-gradient(135deg, #F8F9FC 0%, #F1F4F9 100%)',
    }}>
      {isDesktop ? (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': paperSx }}>
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': paperSx }}
        >
          {drawerContent}
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top AppBar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(244,246,250,0.88)',
            backdropFilter: 'saturate(160%) blur(20px)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 1px 12px rgba(0,0,0,0.04)',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 64, sm: 72 }, px: { xs: 2, sm: 3.5 } }}>
            {!isDesktop && (
              <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, color: '#374151' }}>
                <MenuIcon />
              </IconButton>
            )}

            {/* Page title with badge */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#111827', letterSpacing: '-0.01em', lineHeight: 1 }}>
                {pageTitle}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Notification bell */}
              <Tooltip title="Notifications">
                <IconButton sx={{
                  width: 40, height: 40,
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.08)',
                  bgcolor: '#fff',
                  color: '#6B7280',
                  '&:hover': { bgcolor: '#f9fafb', borderColor: '#FF5A5F', color: '#FF5A5F' },
                  transition: 'all 0.2s',
                }}>
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>

              {/* Profile */}
              <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                bgcolor: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '12px',
                px: 1.5, py: 0.75,
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <Avatar sx={{
                  width: 32, height: 32,
                  background: 'linear-gradient(135deg, #FF5A5F, #FF8469)',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                }}>
                  {initials}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827', display: 'block', lineHeight: 1.2 }}>
                    {user?.name ?? 'Admin'}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#9CA3AF' }}>
                    {user?.role ?? 'Administrator'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2.5, sm: 4 },
            pb: { xs: 4, lg: 6 },
            pt: 3,
            width: '100%',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#111827' }}>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6B7280', fontWeight: 500 }}>
            Are you sure you want to sign out of the Admin Portal?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutDialogOpen(false)} sx={{ color: '#6B7280', fontWeight: 700, borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button onClick={confirmLogout} variant="contained" sx={{ bgcolor: '#FF5A5F', '&:hover': { bgcolor: '#E04E53' }, fontWeight: 700, borderRadius: '8px', boxShadow: 'none' }}>
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardLayout;
