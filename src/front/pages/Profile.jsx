import { useState } from 'react';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileTopbar from '../components/ProfileTopbar';
import ProfileDashboard from '../components/ProfileDashboard';
import ProfileInfo from '../components/ProfileInfo';
import ProfileSecurity from '../components/ProfileSecurity';
import ProfileOrders from '../components/ProfileOrders';
import ProfileAddresses from '../components/ProfileAddresses';
import ProfileIncidents from '../components/ProfileIncidents';
import ProfileRole from '../components/Profile/ProfileRole/ProfileRole';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfo />;
      case 'security':
        return <ProfileSecurity />;
      case 'orders':
        return <ProfileOrders />;
      case 'addresses':
        return <ProfileAddresses />;
      case 'incidents':
        return <ProfileIncidents />;
      case 'seller':
        return <ProfileRole />;
      default:
        return <ProfileDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <ProfileSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="flex-1 flex flex-col">
        <ProfileTopbar setIsOpen={setIsOpen} />

        <main className="p-6 md:p-10">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Profile;
