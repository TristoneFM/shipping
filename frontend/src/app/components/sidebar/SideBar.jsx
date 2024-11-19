'use client';
import { useState, useEffect, createElement } from 'react';
import { useRouter } from 'next/navigation';
import { useMediaQuery } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Link from 'next/link';
// import styles from '../../styles/page.module.css';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import SendToMobileIcon from '@mui/icons-material/SendToMobile';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import { useDelivery } from '@/app/context/DeliveryContext';

const drawerWidth = 240;

export default function SideBar({ children }) {
  const [open, setOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState('');
  const router = useRouter();
  const isSmallScreen = useMediaQuery('(max-width: 800px)');

  const handleDrawerToggle = () => setOpen(!open);

  const handleLogOut = async () => {
    sessionStorage.clear();
    router.push('/');
  };

  useEffect(() => {
    const screenWidth = window.screen.width;
    setOpen(screenWidth > 800);
    setSelectedPage(window.location.pathname);
    const handleResize = () => setOpen(window.screen.width > 800);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const { role } = useDelivery();

  const sideBarOptions = ['Shipments', ...(role === 'admin' ? ['Program', 'Captured'] : [])];
  const icons = [DocumentScannerIcon, ...(role === 'admin' ? [SendToMobileIcon, FolderCopyIcon] : [])];
  const hrefs = ['/dashboard', ...(role === 'admin' ? ['/program', '/captured'] : [])];



  return (
    <>
      <AppBar
        position="fixed"
        style={{
          width: isSmallScreen ? '100%' : open ? `calc(100% - ${drawerWidth}px)` : '100%',
        }}
      >
        <Toolbar>
          <IconButton color="inherit" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap style={{ marginLeft: '10px' }}>
            {!isSmallScreen ? '' : (
              <img src="/forklift.png" alt="Shipping" style={{ width: '40px' }} />
            )}
          </Typography>
          <ExitToAppIcon
            onClick={handleLogOut}
            style={{ position: 'absolute', right: '20px', cursor: 'pointer' }}
          />
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isSmallScreen ? 'temporary' : 'persistent'}
        open={open}
        onClose={handleDrawerToggle}
        sx={{ width: drawerWidth }}
      >
        <Divider />
        <div style={{ display: 'grid', placeContent: 'center', height: '80px' }}>
          <img src="/forkliftt.png" alt="Logo" style={{ width: '50px', borderRadius: '20%' }} />
        </div>
        <List style={{ width: drawerWidth }}>
          {sideBarOptions.map((option, index) => (
             <Link key={index} href={hrefs[index]} style={{color:'black', textDecoration:'none'}}>
            <ListItem key={index} disablePadding>
                <ListItemButton>
                    <ListItemIcon>
                        {createElement(icons[index])}
                    </ListItemIcon>
                <ListItemText primary={option} />
                </ListItemButton>
            </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>

      <main
        style={{
          marginLeft: isSmallScreen ? '0' : open ? `${drawerWidth}px` : '0',
          marginTop: '85px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </>
  );
}
