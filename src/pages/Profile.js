import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  Check,
  ArrowLeft,
  Settings,
  Shield,
  Bell,
  Activity
} from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState({
    firstName: 'Quantum',
    lastName: 'User',
    email: 'user@quantumapp.com',
    phone: '+1 (555) 123-4567',
    bio: 'Quantum computing enthusiast exploring the future of technology.',
    location: 'Silicon Valley, CA',
    joinDate: 'January 2024',
    role: 'Quantum Developer',
    skills: ['Quantum Computing', 'Qiskit', 'Quantum Algorithms', 'Python', 'JavaScript']
  });
  const [tempData, setTempData] = useState(userData);
  const [avatar, setAvatar] = useState(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing) {
      setTempData(userData);
    }
  }, [isEditing, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTempData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUserData(tempData);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
    setIsAvatarMenuOpen(false);
  };

  const renderAvatar = () => (
    <div className="avatar-container">
      <div
        className="avatar-wrapper"
        onClick={() => setIsAvatarMenuOpen((open) => !open)}
      >
        {avatar ? (
          <img src={avatar} alt="Profile" className="avatar-image" />
        ) : (
          <div className="avatar-initials">
            {userData.firstName.charAt(0)}
            {userData.lastName.charAt(0)}
          </div>
        )}
        <div className="avatar-edit-icon">
          <Camera size={16} />
        </div>
        <div className="online-status" />
      </div>

      {isAvatarMenuOpen && (
        <div className="avatar-menu">
          <label className="avatar-menu-item">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <Camera size={16} /> Upload Photo
          </label>
          <button
            type="button"
            className="avatar-menu-item avatar-menu-close"
            onClick={() => setIsAvatarMenuOpen(false)}
          >
            <X size={16} /> Cancel
          </button>
        </div>
      )}
    </div>
  );

  const renderProfileHeader = () => (
    <div className="profile-header">
      <div className="profile-banner" />
      <div className="profile-info-header">
        {renderAvatar()}
        <div className="profile-titles">
          <h1>
            {userData.firstName} {userData.lastName}
          </h1>
          <p className="profile-role">{userData.role}</p>
          <div className="profile-stats">
            <span>Joined {userData.joinDate}</span>
            <span>•</span>
            <span>{userData.location}</span>
          </div>
        </div>
        <div className="profile-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsEditing(false)}
              >
                <X size={16} /> Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
              >
                <Save size={16} /> Save Changes
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            userData={userData}
            isEditing={isEditing}
            onChange={handleInputChange}
            tempData={tempData}
          />
        );
      case 'details':
        return (
          <DetailsTab
            userData={userData}
            isEditing={isEditing}
            onChange={handleInputChange}
            tempData={tempData}
          />
        );
      case 'security':
        return <SecurityTab />;
      case 'preferences':
        return <PreferencesTab />;
      case 'activity':
        return <ActivityTab />;
      default:
        return (
          <OverviewTab
            userData={userData}
            isEditing={isEditing}
            onChange={handleInputChange}
            tempData={tempData}
          />
        );
    }
  };

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="sidebar-header">
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} /> Back
          </button>
        </div>
        <nav className="sidebar-nav">
          <button
            type="button"
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={18} /> Overview
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <User size={18} /> Personal Info
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <Shield size={18} /> Security
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Settings size={18} /> Preferences
          </button>
          <button
            type="button"
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={18} /> Activity
          </button>
        </nav>
      </aside>

      <main className="profile-content">
        {renderProfileHeader()}

        <div className="tabs-container">
          <div className="tabs">
            {['overview', 'details', 'security', 'preferences', 'activity'].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        <section className="tab-content">{renderTabContent()}</section>
      </main>
    </div>
  );
};

const OverviewTab = ({ userData, isEditing, onChange, tempData }) => {
  const data = isEditing ? tempData : userData;

  return (
    <div className="overview-tab">
      <div className="card">
        <h3>About</h3>
        {isEditing ? (
          <textarea
            name="bio"
            value={data.bio || ''}
            onChange={onChange}
            className="bio-input"
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="bio-text">{userData.bio}</p>
        )}
      </div>

      <div className="two-column-grid">
        <div className="card">
          <h3>Personal Information</h3>
          <InfoItem icon={<User size={16} />} label="Full Name">
            {isEditing ? (
              <div className="inline-inputs">
                <input
                  type="text"
                  name="firstName"
                  value={data.firstName || ''}
                  onChange={onChange}
                  className="input-field"
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={data.lastName || ''}
                  onChange={onChange}
                  className="input-field"
                  placeholder="Last Name"
                />
              </div>
            ) : (
              `${userData.firstName} ${userData.lastName}`
            )}
          </InfoItem>

          <InfoItem icon={<Mail size={16} />} label="Email">
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={data.email || ''}
                onChange={onChange}
                className="input-field"
                placeholder="Email"
              />
            ) : (
              userData.email
            )}
          </InfoItem>

          <InfoItem icon={<Phone size={16} />} label="Phone">
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={data.phone || ''}
                onChange={onChange}
                className="input-field"
                placeholder="Phone"
              />
            ) : (
              userData.phone
            )}
          </InfoItem>

          <InfoItem icon={<MapPin size={16} />} label="Location">
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={data.location || ''}
                onChange={onChange}
                className="input-field"
                placeholder="Location"
              />
            ) : (
              userData.location
            )}
          </InfoItem>
        </div>

        <div className="card">
          <h3>Skills &amp; Expertise</h3>
          <div className="skills-container">
            {userData.skills.map((skill) => (
              <span key={skill} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>

          <div className="activity-section">
            <h3>Recent Activity</h3>
            <div className="activity-item">
              <div className="activity-icon">
                <Check size={16} />
              </div>
              <div>
                <p>Profile updated</p>
                <small>2 days ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Check size={16} />
              </div>
              <div>
                <p>Completed Quantum Basics course</p>
                <small>1 week ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsTab = ({ userData, isEditing, onChange, tempData }) => {
  const data = isEditing ? tempData : userData;

  return (
    <div className="details-tab">
      <div className="card">
        <h3>Personal Details</h3>
        <div className="details-grid">
          <div className="details-field">
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={data.firstName || ''}
                onChange={onChange}
                className="input-field"
              />
            ) : (
              <div className="info-value">{userData.firstName}</div>
            )}
          </div>

          <div className="details-field">
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={data.lastName || ''}
                onChange={onChange}
                className="input-field"
              />
            ) : (
              <div className="info-value">{userData.lastName}</div>
            )}
          </div>

          <div className="details-field">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={data.email || ''}
                onChange={onChange}
                className="input-field"
              />
            ) : (
              <div className="info-value">{userData.email}</div>
            )}
          </div>

          <div className="details-field">
            <label>Phone</label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={data.phone || ''}
                onChange={onChange}
                className="input-field"
              />
            ) : (
              <div className="info-value">{userData.phone}</div>
            )}
          </div>

          <div className="details-field details-field-full">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={data.bio || ''}
                onChange={onChange}
                className="input-field"
                rows={4}
              />
            ) : (
              <div className="info-value">
                {userData.bio || 'No bio provided'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SecurityTab = () => (
  <div className="security-tab">
    <div className="card">
      <h3>Security Settings</h3>

      <div className="security-item">
        <div>
          <h4>Password</h4>
          <p>Last changed 3 months ago</p>
        </div>
        <button type="button" className="btn btn-outline">
          Change Password
        </button>
      </div>

      <div className="security-item">
        <div>
          <h4>Two-Factor Authentication</h4>
          <p>Add an extra layer of security to your account.</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" />
          <span className="slider round" />
        </label>
      </div>

      <div className="security-item">
        <div>
          <h4>Active Sessions</h4>
          <p>Manage your active sessions across devices.</p>
        </div>
        <button type="button" className="btn btn-outline">
          View Sessions
        </button>
      </div>
    </div>
  </div>
);

const PreferencesTab = () => (
  <div className="preferences-tab">
    <div className="card">
      <h3>Display Preferences</h3>

      <div className="preference-item">
        <div>
          <h4>Theme</h4>
          <p>Choose between light and dark themes.</p>
        </div>
        <select className="select-field">
          <option>System Default</option>
          <option>Light</option>
          <option>Dark</option>
        </select>
      </div>

      <div className="preference-item">
        <div>
          <h4>Language</h4>
          <p>Select your preferred language.</p>
        </div>
        <select className="select-field">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
        </select>
      </div>
    </div>

    <div className="card preferences-card">
      <h3>Notification Preferences</h3>

      <div className="preference-item">
        <div>
          <h4>Email Notifications</h4>
          <p>Receive email notifications.</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="slider round" />
        </label>
      </div>

      <div className="preference-item">
        <div>
          <h4>Push Notifications</h4>
          <p>Receive browser notifications.</p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" defaultChecked />
          <span className="slider round" />
        </label>
      </div>
    </div>
  </div>
);

const ActivityTab = () => {
  const activities = [
    {
      id: 1,
      type: 'login',
      title: 'Logged in from new device',
      date: '2 minutes ago',
      icon: <Check size={16} />
    },
    {
      id: 2,
      type: 'update',
      title: 'Updated profile information',
      date: '2 hours ago',
      icon: <Edit2 size={16} />
    },
    {
      id: 3,
      type: 'login',
      title: 'Logged in from Chrome on Windows',
      date: '1 day ago',
      icon: <Check size={16} />
    },
    {
      id: 4,
      type: 'security',
      title: 'Changed password',
      date: '1 week ago',
      icon: <Lock size={16} />
    },
    {
      id: 5,
      type: 'update',
      title: 'Updated email preferences',
      date: '2 weeks ago',
      icon: <Bell size={16} />
    }
  ];

  return (
    <div className="activity-tab">
      <div className="card">
        <h3>Recent Activity</h3>

        <div className="activity-feed">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div>
                <p>{activity.title}</p>
                <small>{activity.date}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, children }) => (
  <div className="info-item">
    <div className="info-label">
      {icon}
      <span>{label}</span>
    </div>
    <div className="info-value">{children}</div>
  </div>
);

export default Profile;
