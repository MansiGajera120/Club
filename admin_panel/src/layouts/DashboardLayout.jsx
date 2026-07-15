import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Box,
  Avatar,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Badge,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { ROUTES } from '@/constants';
import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';

const DRAWER_WIDTH = 265;

const NAV_ITEMS = [
  { label: 'Overview', path: ROUTES.dashboard, icon: SpaceDashboardOutlinedIcon },
  { label: 'Analytics', path: ROUTES.analytics, icon: TimelineOutlinedIcon },
  { label: 'Clubs', path: ROUTES.clubs, icon: GroupsOutlinedIcon },
  { label: 'Users', path: ROUTES.users, icon: PeopleOutlineIcon },
  { label: 'Events', path: ROUTES.events, icon: EventOutlinedIcon },
  { label: 'Change Password', path: ROUTES.settings, icon: SettingsOutlinedIcon },
];

const PAGE_TITLES = {
  [ROUTES.dashboard]: 'Overview',
  [ROUTES.analytics]: 'Analytics',
  [ROUTES.clubs]: 'Clubs',
  [ROUTES.users]: 'User Management',
  [ROUTES.events]: 'Events',
  [ROUTES.settings]: 'Change Password',
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
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
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

  const handleLogout = () => setLogoutDialogOpen(true);

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
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#FFFFFF',
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid #F1F1F1',
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 14px rgba(249,115,22,0.32)',
          }}
        >
          <GroupsOutlinedIcon sx={{ color: '#fff', fontSize: 24 }} />
        </Box>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '1.2rem',
            color: '#262525',
            letterSpacing: '-0.01em',
          }}
        >
          ClubHub
        </Typography>
      </Box>

      {/* Nav items */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 2 }}>
        <List disablePadding>
          {NAV_ITEMS.map((item) => {
            const selected =
              item.path === ROUTES.dashboard
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
            const IconComp = item.icon;

            return (
              <ListItemButton
                key={item.label}
                selected={selected}
                onClick={() => go(item.path)}
                sx={{
                  borderRadius: '12px',
                  mb: 0.75,
                  py: 1.4,
                  px: 2,
                  transition: 'all 0.18s ease',
                  bgcolor: selected ? '#F97316' : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: '#F97316',
                    '&:hover': { bgcolor: '#EA6C0A' },
                  },
                  '&:hover': {
                    bgcolor: selected ? '#EA6C0A' : 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: selected ? '#FFFFFF' : '#8A8A9A',
                  }}
                >
                  <IconComp sx={{ fontSize: 22, color: selected ? '#FFFFFF' : '#8A8A9A' }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: selected ? 700 : 500,
                    fontSize: '0.96rem',
                    color: selected ? '#FFFFFF' : '#3D3D4E',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Sign Out at bottom */}
      <Box sx={{ px: 2, pb: 3 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: '12px',
            py: 1.4,
            px: 2,
            transition: 'all 0.18s ease',
            '&:hover': { bgcolor: 'rgba(239,68,68,0.06)' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: '#8A8A9A' }}>
            <LogoutOutlinedIcon sx={{ fontSize: 22 }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              fontWeight: 500,
              fontSize: '0.96rem',
              color: '#6B7280',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    border: 'none',
    bgcolor: '#FFFFFF',
    boxShadow: '2px 0 20px rgba(0,0,0,0.06)',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#F7F8FA',
      }}
    >
      {/* Sidebar */}
      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': paperSx }}
        >
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

      {/* Main content area */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: { xs: 2, sm: 3.5 },
            py: 0,
            minHeight: 68,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #EEEFF2',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Mobile menu toggle */}
          {!isDesktop && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 2, color: '#374151' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Page title */}
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: '#262525', flex: 1, fontSize: '1.3rem', letterSpacing: '-0.01em' }}
          >
            {pageTitle}
          </Typography>

          {/* Right actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Notification */}
            <Tooltip title="Notifications">
              <IconButton
                id="notification-btn"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  border: '1px solid #EEEFF2',
                  bgcolor: '#F7F8FA',
                  color: '#6B7280',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#fff',
                    borderColor: '#F97316',
                    color: '#F97316',
                    boxShadow: '0 2px 8px rgba(249,115,22,0.15)',
                  },
                }}
              >
                <Badge badgeContent={3} color="error" variant="dot">
                  <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Profile icon */}
            <Tooltip title="Admin profile">
              <IconButton
                id="profile-icon-btn"
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  border: '1px solid #EEEFF2',
                  bgcolor: '#F7F8FA',
                  color: '#6B7280',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#fff',
                    borderColor: '#F97316',
                    color: '#F97316',
                  },
                }}
              >
                <PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Name + role chip */}
            <Box
              sx={{
                display: { xs: 'none', sm: 'flex' },
                alignItems: 'center',
                gap: 1.5,
                pl: 1.5,
                pr: 2,
                py: 0.75,
                borderRadius: '10px',
                border: '1px solid #EEEFF2',
                bgcolor: '#FFFFFF',
                cursor: 'default',
                ml: 0.5,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #F97316, #FB923C)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                }}
              >
                {initials}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: '#262525',
                    lineHeight: 1.25,
                  }}
                >
                  {user?.name ?? 'Admin'}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#8A8A9A', lineHeight: 1 }}>
                  Admin
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Page content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2.5, sm: 3.5 },
            pb: { xs: 4, lg: 6 },
            pt: 3,
            width: '100%',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: 340 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: '#262525' }}>Sign Out?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#6B7280', fontWeight: 500 }}>
            Are you sure you want to sign out of the Admin Portal?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              px: 2.5,
              '&:hover': { bgcolor: '#F7F8FA' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #F97316, #FB923C)',
              fontWeight: 700,
              borderRadius: '8px',
              boxShadow: 'none',
              px: 2.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #EA6C0A, #F97316)',
                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              },
            }}
          >
            Sign Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DashboardLayout;
