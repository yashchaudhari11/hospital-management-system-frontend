import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Warehouse, Plus, Edit, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PharmacyInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Modal States
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    unit: 'Tablets',
    stockQuantity: '',
    lowStockThreshold: '10'
  });

  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [editStockQty, setEditStockQty] = useState('');
  const [editThreshold, setEditThreshold] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get('/medicines/inventory');
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load medicine stock inventory');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchInventory();
      setLoading(false);
    };
    init();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.stockQuantity) {
      toast.error('Please fill out all required fields');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Adding medicine to inventory...');
    try {
      const res = await axiosInstance.post('/medicines/inventory', {
        name: newMed.name.trim(),
        unit: newMed.unit,
        stockQuantity: parseInt(newMed.stockQuantity),
        lowStockThreshold: parseInt(newMed.lowStockThreshold) || 10
      });
      if (res.data.success) {
        toast.success('Medicine added successfully!', { id: toastId });
        setAddModalOpen(false);
        setNewMed({ name: '', unit: 'Tablets', stockQuantity: '', lowStockThreshold: '10' });
        fetchInventory();
      } else {
        toast.error(res.data.message || 'Action failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (med) => {
    setSelectedMed(med);
    setEditStockQty(med.stockQuantity.toString());
    setEditThreshold(med.lowStockThreshold.toString());
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editStockQty === '' || editThreshold === '') {
      toast.error('Please enter valid numerical quantities');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Updating inventory levels...');
    try {
      const res = await axiosInstance.put(`/medicines/inventory/${selectedMed._id}`, {
        stockQuantity: parseInt(editStockQty),
        lowStockThreshold: parseInt(editThreshold)
      });
      if (res.data.success) {
        toast.success('Inventory updated successfully!', { id: toastId });
        setEditModalOpen(false);
        fetchInventory();
      } else {
        toast.error(res.data.message || 'Action failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inventory Status Overview</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">Flagged items have stock levels below low-stock thresholds.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={fetchInventory} className="cursor-pointer">
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
            <Button variant="primary" onClick={() => setAddModalOpen(true)} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" /> Add Medicine
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medicine Stock Control Directory</CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Medicine Name</TH>
                  <TH>Dispensing Unit</TH>
                  <TH>Stock Quantity</TH>
                  <TH>Low Stock Alert Limit</TH>
                  <TH>Stock Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {inventory.map((med) => {
                  const isLow = med.stockQuantity <= med.lowStockThreshold;
                  return (
                    <TR key={med._id} className={isLow ? 'bg-amber-50/20' : ''}>
                      <TD className="font-semibold text-slate-900 text-xs">{med.name}</TD>
                      <TD className="text-xs text-slate-650">{med.unit}</TD>
                      <TD className={`text-xs font-semibold ${isLow ? 'text-amber-700' : 'text-slate-800'}`}>
                        {med.stockQuantity}
                      </TD>
                      <TD className="text-xs text-slate-500">{med.lowStockThreshold}</TD>
                      <TD>
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-250">
                            <AlertCircle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                            In Stock
                          </span>
                        )}
                      </TD>
                      <TD className="text-right">
                        <Button
                          variant="secondary"
                          onClick={() => openEditModal(med)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Update Stock
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="No medicines in inventory"
              description="Click Add Medicine to initialize your stock catalog."
              icon={Warehouse}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Medicine Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Medicine to Inventory"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={submitting} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddSubmit} disabled={submitting} className="cursor-pointer">
              {submitting ? 'Adding...' : 'Add Medicine'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <Input
            label="Medicine Brand/Generic Name"
            id="name"
            type="text"
            placeholder="e.g. Paracetamol 500mg"
            value={newMed.name}
            onChange={(e) => setNewMed(prev => ({ ...prev, name: e.target.value }))}
            disabled={submitting}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Dispensing Unit"
              id="unit"
              value={newMed.unit}
              onChange={(e) => setNewMed(prev => ({ ...prev, unit: e.target.value }))}
              disabled={submitting}
            >
              <option value="Tablets">Tablets</option>
              <option value="Capsules">Capsules</option>
              <option value="Bottle">Bottle</option>
              <option value="Vial">Vial</option>
              <option value="Ointment">Ointment (g)</option>
              <option value="Syrup">Syrup (ml)</option>
            </Select>

            <Input
              label="Initial Stock Quantity"
              id="stockQuantity"
              type="number"
              placeholder="e.g. 100"
              value={newMed.stockQuantity}
              onChange={(e) => setNewMed(prev => ({ ...prev, stockQuantity: e.target.value }))}
              disabled={submitting}
              required
            />

            <Input
              label="Low Stock Threshold"
              id="lowStockThreshold"
              type="number"
              placeholder="e.g. 15"
              value={newMed.lowStockThreshold}
              onChange={(e) => setNewMed(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
              disabled={submitting}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Stock Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Update Medicine Stock Level"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={submitting} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditSubmit} disabled={submitting} className="cursor-pointer">
              {submitting ? 'Saving...' : 'Save Stock Levels'}
            </Button>
          </>
        }
      >
        {selectedMed && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded text-xs">
              <p><span className="font-semibold text-slate-600">Medicine:</span> {selectedMed.name}</p>
              <p><span className="font-semibold text-slate-600">Dispensing Unit:</span> {selectedMed.unit}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Set Stock Quantity"
                id="editStockQty"
                type="number"
                value={editStockQty}
                onChange={(e) => setEditStockQty(e.target.value)}
                disabled={submitting}
                required
              />

              <Input
                label="Set Low Stock Threshold"
                id="editThreshold"
                type="number"
                value={editThreshold}
                onChange={(e) => setEditThreshold(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyInventory;
