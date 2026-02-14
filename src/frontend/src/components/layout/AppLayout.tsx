import { Outlet } from '@tanstack/react-router';
import HeaderBar from './HeaderBar';
import Footer from './Footer';
import ProfileSetupDialog from '../auth/ProfileSetupDialog';
import MobileCartShortcut from '../cart/MobileCartShortcut';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ProfileSetupDialog />
      <MobileCartShortcut />
    </div>
  );
}
