import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserPlus, 
  UserMinus, 
  Edit, 
  Save, 
  X, 
  Users, 
  AlertCircle,
  CheckCircle,
  User
} from 'lucide-react';

interface Server {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServerManagement = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState<Server | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, serverId: string | null, serverName: string}>({
    show: false,
    serverId: null,
    serverName: ''
  });
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Load servers from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'servers'), orderBy('name'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const serversData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            isActive: data.isActive !== false,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
        });
        setServers(serversData);
        setLoading(false);
      }, (err) => {
        console.error("Firebase fetch error:", err);
        setError("Failed to load servers. Is Firebase configured correctly?");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error(err);
      setError("Firebase not configured properly.");
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: ''
    });
    setShowAddForm(false);
    setEditingServer(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Server name is required');
      return false;
    }
    return true;
  };

  const handleAddServer = async () => {
    if (!validateForm()) return;

    try {
      const serverData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'servers'), serverData);
      setSuccess(`Server "${formData.name}" added successfully!`);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error("Add server error:", err);
      setError(`Failed to add server: ${err.message}`);
    }
  };

  const handleEditServer = async () => {
    if (!editingServer || !validateForm()) return;

    try {
      const serverRef = doc(db, 'servers', editingServer.id);
      await updateDoc(serverRef, {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        updatedAt: new Date()
      });

      setSuccess(`Server "${formData.name}" updated successfully!`);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error("Edit server error:", err);
      setError(`Failed to update server: ${err.message}`);
    }
  };

  const handleDeleteClick = (serverId: string, serverName: string) => {
    setDeleteConfirm({
      show: true,
      serverId,
      serverName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.serverId) return;

    try {
      await deleteDoc(doc(db, 'servers', deleteConfirm.serverId));
      setSuccess(`Server "${deleteConfirm.serverName}" deleted successfully!`);
      setDeleteConfirm({ show: false, serverId: null, serverName: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(`Failed to delete server: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, serverId: null, serverName: '' });
  };

  const handleEditClick = (server: Server) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      email: server.email || '',
      phone: server.phone || ''
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (server: Server) => {
    try {
      const serverRef = doc(db, 'servers', server.id);
      await updateDoc(serverRef, {
        isActive: !server.isActive,
        updatedAt: new Date()
      });
      setSuccess(`Server "${server.name}" ${!server.isActive ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error("Toggle active error:", err);
      setError(`Failed to update server status: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-center py-6">Loading servers...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <Users className="h-6 w-6 text-gray-700 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Server Management</h2>
          <span className="ml-3 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            {servers.length} {servers.length === 1 ? 'server' : 'servers'}
          </span>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Server
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <p className="text-sm text-red-700">{error}</p>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 flex items-center">
          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-sm text-green-700">{success}</p>
          <button 
            onClick={() => setSuccess('')}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingServer ? 'Edit Server' : 'Add New Server'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Server Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="Enter server name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="server@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={editingServer ? handleEditServer : handleAddServer}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
              >
                {editingServer ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Server
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Server
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Servers List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {servers.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
            <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No servers added yet</p>
            <p className="text-xs text-gray-400 mt-1">Add your first server to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Server
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {servers.map((server) => (
                  <tr key={server.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{server.name}</div>
                          <div className="text-xs text-gray-500">
                            Added {server.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {server.email && (
                          <div className="mb-1">
                            <span className="text-gray-500">Email: </span>
                            {server.email}
                          </div>
                        )}
                        {server.phone && (
                          <div>
                            <span className="text-gray-500">Phone: </span>
                            {server.phone}
                          </div>
                        )}
                        {!server.email && !server.phone && (
                          <span className="text-gray-400 italic">No contact info</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(server)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          server.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {server.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(server)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(server.id, server.name)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                          <UserMinus className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Server</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the server <span className="font-bold">{deleteConfirm.serverName}</span>?
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Delete Server
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerManagement;