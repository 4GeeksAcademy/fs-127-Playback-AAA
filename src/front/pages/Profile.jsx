import { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";

import ProfileSidebar from '../components/ProfileSidebar';
import ProfileTopbar from '../components/ProfileTopbar';
import ProfileDashboard from '../components/ProfileDashboard';
import ProfileInfo from '../components/ProfileInfo';
import ProfileSecurity from '../components/ProfileSecurity';
import ProfileOrders from '../components/ProfileOrders';
import ProfileAddresses from '../components/ProfileAddresses';
import ProfileRole from '../components/Profile/ProfileRole/ProfileRole';
import ProfileSellerIncidents from '../components/ProfileSellerIncidents';
import ProfileIncidents from '../components/ProfileIncidents';

const Profile = () => {

  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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
      case 'seller':
        return <ProfileRole />;
      case 'seller-incidents':
        return <ProfileSellerIncidents />;
      case 'incidents':
        return <ProfileIncidents />;
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