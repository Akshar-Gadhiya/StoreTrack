import React, { useState } from 'react';
import axios from 'axios';
import { User, Bell, Shield, Store, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple shadcn/ui-like card components
const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-border bg-card card-shadow card-hover transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-8 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-semibold leading-none tracking-tight text-xl ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-8 pt-0 ${className}`}>
    {children}
  </div>
);

// Sidebar Component
const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'store', label: 'Store Config', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <nav className="flex flex-col space-y-2 w-full md:w-64 shrink-0">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

// Profile Section
const ProfileSection = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/api/user/settings', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <p className="text-sm text-muted-foreground">Manage your personal information and avatar.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center border border-border overflow-hidden relative group">
              <User className="h-8 w-8 text-muted-foreground" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Upload className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Avatar</span>
              <span className="text-xs text-muted-foreground">Click to upload a new avatar</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

// Store Config Section
const StoreConfigSection = () => {
  const [formData, setFormData] = useState({ storeName: '', location: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/api/store/settings', formData);
      toast.success('Store configuration updated');
    } catch (error) {
      toast.error('Failed to update store config');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Configuration</CardTitle>
        <p className="text-sm text-muted-foreground">Manage details for your Rajkot and Jamnagar branches.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Name</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. StoreTrack HQ"
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Location Branch</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-background border border-input rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
              >
                <option value="">Select a branch</option>
                <option value="rajkot">Rajkot Branch</option>
                <option value="jamnagar">Jamnagar Branch</option>
              </select>
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            <Save className="h-4 w-4" /> Update Store
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

// Notifications Section
const NotificationsSection = () => {
  const [toggles, setToggles] = useState({
    lowStock: true,
    securityAlerts: false,
    roleChanges: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch('/api/user/settings', { notifications: toggles });
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
      console.error(error);
    }
  };

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
      <div className="space-y-0.5">
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${checked ? 'bg-primary' : 'bg-muted-foreground/30'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform transform absolute ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <p className="text-sm text-muted-foreground">Configure how you receive alerts and updates.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Toggle
              label="Low Stock Alerts"
              description="Receive notifications when an item drops below its threshold."
              checked={toggles.lowStock}
              onChange={() => setToggles({ ...toggles, lowStock: !toggles.lowStock })}
            />
            <Toggle
              label="Security Alerts"
              description="Get notified of unusual login attempts or security events."
              checked={toggles.securityAlerts}
              onChange={() => setToggles({ ...toggles, securityAlerts: !toggles.securityAlerts })}
            />
            <Toggle
              label="Role Changes"
              description="Alerts when an employee's permissions or role is updated."
              checked={toggles.roleChanges}
              onChange={() => setToggles({ ...toggles, roleChanges: !toggles.roleChanges })}
            />
          </div>

          <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all">
            <Save className="h-4 w-4" /> Save Preferences
          </button>
        </form>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <div className="bg-border h-px w-full my-6"></div>

      <div className="flex flex-col md:flex-row gap-8">
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1">
          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'store' && <StoreConfigSection />}
          {activeTab === 'notifications' && <NotificationsSection />}
        </div>
      </div>
    </div>
  );
}
