import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/SpaceDashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import { ROUTES } from '@/constants';
import { env } from '@/config/env';
import { useAuth } from '@/hooks/useAuth';
import { brand, gradients } from '@/theme/tokens';

const DRAWER_WIDTH = 228;

const NAV_ITEMS = [
  { label: 'Dashboard', path: ROUTES.dashboard, icon: <DashboardIcon /> },
  { label: 'Clubs', path: ROUTES.clubs, icon: <GroupsIcon /> },
  { label: 'Users', path: ROUTES.users, icon: <PeopleIcon /> },
  { label: 'Events', path: ROUTES.events, icon: <EventIcon /> },
];

const PAGE_TITLES = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.clubs]: 'Clubs',
  [ROUTES.users]: 'Users',
  [ROUTES.events]: 'Events',
};

function getPageTitle(pathname) {
  if (pathname === ROUTES.dashboard) return PAGE_TITLES[ROUTES.dashboard];
  const match = Object.entries(PAGE_TITLES).find(
    ([path]) => path !== ROUTES.dashboard && pathname.startsWith(path)
  );
  return match?.[1] ?? env.appName;
}

/**
 * Persistent-sidebar shell for the admin area.
 */
export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const pageTitle = getPageTitle(location.pathname);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'AD';

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <>
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                background: gradients.brand,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 18,
                boxShadow: '0 8px 20px rgba(255,90,95,0.28)',
              }}
            >
              SC
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
                Sports Club
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Admin console
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={700}
          sx={{ px: 3.5, mb: 1, letterSpacing: '0.08em' }}
        >
          MANAGEMENT
        </Typography>

        <Box sx={{ px: 1.5, flex: 1 }}>
          <List disablePadding>
            {NAV_ITEMS.map((item) => {
              const selected =
                item.path === ROUTES.dashboard
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path);
              return (
                <ListItemButton
                  key={item.path}
                  selected={selected}
                  onClick={() => go(item.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1.1,
                    '&.Mui-selected': {
                      bgcolor: 'rgba(255,90,95,0.10)',
                      color: brand.primary,
                      '& .MuiListItemIcon-root': { color: brand.primary },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: selected ? 700 : 600 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        <Divider sx={{ mx: 2 }} />

        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              mb: 1,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'rgba(255,90,95,0.14)',
                color: brand.primary,
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {user?.name ?? 'Admin'}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.email ?? 'Administrator'}
              </Typography>
            </Box>
          </Box>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Box>
    </>
  );

  const paperSx = {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
    borderRight: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
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

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 60 }, px: { xs: 2, sm: 3 } }}>
            {!isDesktop && (
              <IconButton
                edge="start"
                aria-label="Open navigation menu"
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Admin / {pageTitle}
              </Typography>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                {pageTitle}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 2.5, sm: 3, lg: 4 },
            py: { xs: 2.5, lg: 2 },
            width: '100%',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default DashboardLayout;
