import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Edit3,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const InventoryDashboard = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState({});

  useEffect(() => {
    fetchInventoryData();
    fetchLowStockAlerts();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/inventory/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const result = await response.json();
      setInventoryData(result.data);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load inventory data');
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }

      const result = await response.json();
      setLowStockAlerts(result.data.alerts);
    } catch (error) {
      console.error('Alerts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, newStock, lowStockThreshold) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/inventory/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          stock: parseInt(newStock), 
          lowStockThreshold: parseInt(lowStockThreshold),
          reason: 'Manual admin update'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      toast.success('Stock updated successfully');
      setEditingStock({});
      fetchInventoryData();
      fetchLowStockAlerts();
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update stock');
    } finally {
      setUpdating(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await fetch('/api/inventory/report?format=csv', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    }
  };

  const handleStockEdit = (productId, currentStock, currentThreshold) => {
    setEditingStock({
      [productId]: {
        stock: currentStock,
        threshold: currentThreshold
      }
    });
  };

  const handleStockSave = (productId) => {
    const editData = editingStock[productId];
    if (editData) {
      updateStock(productId, editData.stock, editData.threshold);
    }
  };

  const handleStockCancel = (productId) => {
    const newEditing = { ...editingStock };
    delete newEditing[productId];
    setEditingStock(newEditing);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const filteredCriticalAlerts = lowStockAlerts.critical?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredWarningAlerts = lowStockAlerts.warning?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Monitor stock levels and manage inventory</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => { fetchInventoryData(); fetchLowStockAlerts(); }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {inventoryData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryData.overview.totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryData.overview.inStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryData.overview.lowStockCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{inventoryData.overview.totalInventoryValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Critical Stock Alerts */}
      {filteredCriticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-red-800">Critical Stock Alerts</h2>
          </div>
          
          <div className="space-y-3">
            {filteredCriticalAlerts.map(product => (
              <div key={product._id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category?.name}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {editingStock[product._id] ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editingStock[product._id].stock}
                        onChange={(e) => setEditingStock({
                          ...editingStock,
                          [product._id]: {
                            ...editingStock[product._id],
                            stock: e.target.value
                          }
                        })}
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockSave(product._id)}
                        disabled={updating}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleStockCancel(product._id)}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-red-600 font-bold">Stock: {product.inventory.stock}</span>
                      <button
                        onClick={() => handleStockEdit(product._id, product.inventory.stock, product.inventory.lowStockThreshold)}
                        className="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning Stock Alerts */}
      {filteredWarningAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-lg font-semibold text-yellow-800">Low Stock Warnings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWarningAlerts.map(product => (
              <div key={product._id} className="flex items-center justify-between bg-white p-4 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.category?.name}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  {editingStock[product._id] ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editingStock[product._id].stock}
                        onChange={(e) => setEditingStock({
                          ...editingStock,
                          [product._id]: {
                            ...editingStock[product._id],
                            stock: e.target.value
                          }
                        })}
                        className="w-20 px-2 py-1 border rounded text-center"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockSave(product._id)}
                        disabled={updating}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => handleStockCancel(product._id)}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-yellow-600 font-bold">Stock: {product.inventory.stock}</span>
                      <button
                        onClick={() => handleStockEdit(product._id, product.inventory.stock, product.inventory.lowStockThreshold)}
                        className="p-2 text-gray-600 hover:text-gray-900"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {filteredCriticalAlerts.length === 0 && filteredWarningAlerts.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <Package className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-800 mb-2">All Stock Levels Good!</h3>
          <p className="text-green-600">No low stock alerts at this time.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;