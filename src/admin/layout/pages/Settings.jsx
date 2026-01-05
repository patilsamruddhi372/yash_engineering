// import { 
//   Settings as SettingsIcon,
//   User,
//   Lock,
//   Bell,
//   Palette,
//   Globe,
//   Shield,
//   Database,
//   Mail,
//   Save,
//   CheckCircle,
//   AlertCircle,
//   Eye,
//   EyeOff,
//   Upload,
//   X
// } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { authAPI } from '../../../api/axios';

// export default function Settings() {
//   const [activeTab, setActiveTab] = useState('profile');
//   const [isSaving, setIsSaving] = useState(false);
//   const [saveSuccess, setSaveSuccess] = useState(false);
//   const [saveError, setSaveError] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);

//   const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

//   const [profileData, setProfileData] = useState({
//     name: adminUser.name || '',
//     email: adminUser.email || '',
//     phone: '',
//     avatar: '',
//   });

//   const [passwordData, setPasswordData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: '',
//   });

//   const [notificationSettings, setNotificationSettings] = useState({
//     emailNotifications: true,
//     enquiryAlerts: true,
//     weeklyReports: false,
//     newClientAlerts: true,
//   });

//   const tabs = [
//     { id: 'profile', label: 'Profile', icon: User },
//     { id: 'security', label: 'Security', icon: Lock },
//     { id: 'notifications', label: 'Notifications', icon: Bell },
//     { id: 'appearance', label: 'Appearance', icon: Palette },
//     { id: 'system', label: 'System', icon: Database },
//   ];

//   const handleProfileUpdate = async (e) => {
//     e.preventDefault();
//     setIsSaving(true);
//     setSaveError('');
//     setSaveSuccess(false);

//     try {
//       const response = await authAPI.updateProfile(profileData);

//       if (response.success) {
//         // Update localStorage
//         const updatedUser = { ...adminUser, ...profileData };
//         localStorage.setItem('adminUser', JSON.stringify(updatedUser));

//         setSaveSuccess(true);
//         setTimeout(() => setSaveSuccess(false), 3000);
//       } else {
//         setSaveError(response.message || 'Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Profile update error:', error);
//       setSaveError(error.message || 'Failed to update profile');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();

//     if (passwordData.newPassword !== passwordData.confirmPassword) {
//       setSaveError('Passwords do not match');
//       return;
//     }

//     if (passwordData.newPassword.length < 8) {
//       setSaveError('Password must be at least 8 characters');
//       return;
//     }

//     setIsSaving(true);
//     setSaveError('');
//     setSaveSuccess(false);

//     try {
//       const response = await authAPI.changePassword(
//         passwordData.currentPassword,
//         passwordData.newPassword
//       );

//       if (response.success) {
//         setSaveSuccess(true);
//         setPasswordData({
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: '',
//         });
//         setTimeout(() => setSaveSuccess(false), 3000);
//       } else {
//         setSaveError(response.message || 'Failed to change password');
//       }
//     } catch (error) {
//       console.error('Password change error:', error);
//       setSaveError(error.message || 'Failed to change password');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleNotificationSave = () => {
//     setIsSaving(true);
//     setTimeout(() => {
//       setSaveSuccess(true);
//       setIsSaving(false);
//       setTimeout(() => setSaveSuccess(false), 3000);
//     }, 1000);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//         <div>
//           <div className="flex items-center gap-3 mb-2">
//             <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
//               <SettingsIcon className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
//           </div>
//           <p className="text-gray-600">Manage your account and preferences</p>
//         </div>
//       </div>

//       {/* Success/Error Messages */}
//       {saveSuccess && (
//         <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-3 animate-slideDown">
//           <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="text-sm font-semibold text-green-900">Changes Saved!</p>
//             <p className="text-sm text-green-700">Your settings have been updated successfully.</p>
//           </div>
//         </div>
//       )}

//       {saveError && (
//         <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-shake">
//           <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <p className="text-sm font-semibold text-red-900">Error</p>
//             <p className="text-sm text-red-700">{saveError}</p>
//           </div>
//         </div>
//       )}

//       {/* Tabs */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="border-b border-gray-200 overflow-x-auto">
//           <div className="flex min-w-max">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all relative ${
//                     activeTab === tab.id
//                       ? 'text-blue-600 bg-blue-50'
//                       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span>{tab.label}</span>
//                   {activeTab === tab.id && (
//                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         <div className="p-6">
//           {/* Profile Tab */}
//           {activeTab === 'profile' && (
//             <form onSubmit={handleProfileUpdate} className="space-y-6">
//               <h3 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Full Name
//                   </label>
//                   <input
//                     type="text"
//                     value={profileData.name}
//                     onChange={(e) =>
//                       setProfileData({ ...profileData, name: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Enter your name"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     value={profileData.email}
//                     onChange={(e) =>
//                       setProfileData({ ...profileData, email: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="your@email.com"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Phone Number
//                   </label>
//                   <input
//                     type="tel"
//                     value={profileData.phone}
//                     onChange={(e) =>
//                       setProfileData({ ...profileData, phone: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="+1 (555) 000-0000"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={isSaving}
//                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
//                 >
//                   {isSaving ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Saving...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-5 h-5" />
//                       <span>Save Changes</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* Security Tab */}
//           {activeTab === 'security' && (
//             <form onSubmit={handlePasswordChange} className="space-y-6">
//               <h3 className="text-xl font-bold text-gray-900 mb-4">Change Password</h3>

//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Current Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showCurrentPassword ? 'text' : 'password'}
//                       value={passwordData.currentPassword}
//                       onChange={(e) =>
//                         setPasswordData({
//                           ...passwordData,
//                           currentPassword: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter current password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showCurrentPassword ? (
//                         <EyeOff className="w-5 h-5" />
//                       ) : (
//                         <Eye className="w-5 h-5" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     New Password
//                   </label>
//                   <div className="relative">
//                     <input
//                       type={showNewPassword ? 'text' : 'password'}
//                       value={passwordData.newPassword}
//                       onChange={(e) =>
//                         setPasswordData({
//                           ...passwordData,
//                           newPassword: e.target.value,
//                         })
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="Enter new password"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowNewPassword(!showNewPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showNewPassword ? (
//                         <EyeOff className="w-5 h-5" />
//                       ) : (
//                         <Eye className="w-5 h-5" />
//                       )}
//                     </button>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">
//                     Confirm New Password
//                   </label>
//                   <input
//                     type="password"
//                     value={passwordData.confirmPassword}
//                     onChange={(e) =>
//                       setPasswordData({
//                         ...passwordData,
//                         confirmPassword: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     placeholder="Confirm new password"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={isSaving}
//                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
//                 >
//                   {isSaving ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Updating...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Lock className="w-5 h-5" />
//                       <span>Update Password</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* Notifications Tab */}
//           {activeTab === 'notifications' && (
//             <div className="space-y-6">
//               <h3 className="text-xl font-bold text-gray-900 mb-4">
//                 Notification Preferences
//               </h3>

//               <div className="space-y-4">
//                 {Object.entries(notificationSettings).map(([key, value]) => (
//                   <div
//                     key={key}
//                     className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
//                   >
//                     <div>
//                       <p className="font-semibold text-gray-900">
//                         {key
//                           .replace(/([A-Z])/g, ' $1')
//                           .replace(/^./, (str) => str.toUpperCase())}
//                       </p>
//                       <p className="text-sm text-gray-600">
//                         Receive notifications for this activity
//                       </p>
//                     </div>
//                     <label className="relative inline-flex items-center cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={value}
//                         onChange={(e) =>
//                           setNotificationSettings({
//                             ...notificationSettings,
//                             [key]: e.target.checked,
//                           })
//                         }
//                         className="sr-only peer"
//                       />
//                       <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//                     </label>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex justify-end">
//                 <button
//                   onClick={handleNotificationSave}
//                   disabled={isSaving}
//                   className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
//                 >
//                   {isSaving ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       <span>Saving...</span>
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-5 h-5" />
//                       <span>Save Preferences</span>
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Appearance Tab */}
//           {activeTab === 'appearance' && (
//             <div className="text-center py-12">
//               <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 Appearance Settings
//               </h3>
//               <p className="text-gray-600">
//                 Theme customization coming soon!
//               </p>
//             </div>
//           )}

//           {/* System Tab */}
//           {activeTab === 'system' && (
//             <div className="text-center py-12">
//               <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 System Settings
//               </h3>
//               <p className="text-gray-600">
//                 Advanced system configuration coming soon!
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }