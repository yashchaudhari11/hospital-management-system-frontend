import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { Pill, CheckSquare, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PharmacyPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Dispense Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState(null);
  const [dispensing, setDispensing] = useState(false);
  const [dispenseQuantities, setDispenseQuantities] = useState({});

  const fetchPrescriptions = async () => {
    try {
      const res = await axiosInstance.get('/prescriptions');
      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load prescriptions queue');
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get('/medicines/inventory');
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load clinic stock data');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPrescriptions(), fetchInventory()]);
      setLoading(false);
    };
    init();
  }, []);

  const openDispenseModal = (rx) => {
    setSelectedRx(rx);
    // Initialize default quantity per medicine (duration or default 1)
    const initialQtyMap = {};
    rx.medicines.forEach((med, idx) => {
      let defaultQty = 1;
      if (med.duration) {
        const parsed = parseInt(med.duration, 10);
        if (!isNaN(parsed) && parsed > 0) defaultQty = parsed;
      }
      initialQtyMap[idx] = defaultQty;
    });
    setDispenseQuantities(initialQtyMap);
    setModalOpen(true);
  };

  const handleQuantityChange = (idx, value) => {
    const qty = parseInt(value, 10);
    setDispenseQuantities(prev => ({
      ...prev,
      [idx]: isNaN(qty) ? 0 : Math.max(0, qty)
    }));
  };

  const checkStockAvailability = (medName) => {
    const item = inventory.find(i => i.name.toLowerCase() === medName.toLowerCase());
    if (!item) return { status: 'not_found', qty: 0 };
    if (item.stockQuantity < 10) return { status: 'low_stock', qty: item.stockQuantity, unit: item.unit };
    return { status: 'in_stock', qty: item.stockQuantity, unit: item.unit };
  };

  const handleDispenseSubmit = async () => {
    setDispensing(true);
    const toastId = toast.loading('Dispensing medicine items...');
    try {
      // Build quantities array matching rx.medicines index
      const quantitiesArray = selectedRx.medicines.map((_, idx) => dispenseQuantities[idx] ?? 1);
      const res = await axiosInstance.post(`/prescriptions/${selectedRx._id}/dispense`, {
        quantities: quantitiesArray
      });
      if (res.data.success) {
        toast.success('Prescription dispensed and stock updated successfully!', { id: toastId });
        setModalOpen(false);
        // Refresh queues
        await Promise.all([fetchPrescriptions(), fetchInventory()]);
      } else {
        toast.error(res.data.message || 'Dispensing failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred during dispensing', { id: toastId });
    } finally {
      setDispensing(false);
    }
  };

  const filtered = prescriptions.filter(rx => {
    if (filterStatus === 'all') return true;
    return rx.status === filterStatus;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Incoming', value: 'all' },
              { label: 'Pending Dispensing', value: 'pending' },
              { label: 'Dispensed Logs', value: 'dispensed' }
            ].map(btn => (
              <button
                key={btn.value}
                onClick={() => setFilterStatus(btn.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                  filterStatus === btn.value
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <Button variant="secondary" onClick={fetchPrescriptions} className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Queue
          </Button>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Incoming Prescriptions Dispensing Board</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Review physician prescriptions, verify clinic stock availability, and dispense medicines.</p>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Date Prescribed</TH>
                  <TH>Patient Details</TH>
                  <TH>Prescribing Doctor</TH>
                  <TH>Medicines Ordered</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((rx) => (
                  <TR key={rx._id}>
                    <TD className="font-medium text-slate-800 text-xs">
                      {new Date(rx.createdAt).toLocaleString()}
                    </TD>
                    <TD>
                      <p className="font-semibold text-slate-900 text-xs">{rx.patient?.name}</p>
                      <p className="text-[10px] text-slate-400">Phone: {rx.patient?.phone}</p>
                    </TD>
                    <TD className="text-xs text-slate-650">{rx.doctor?.name}</TD>
                    <TD className="text-xs">
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {rx.medicines.map((m, i) => (
                          <li key={i}>
                            <span className="font-semibold">{m.name}</span> - {m.dosage} ({m.duration})
                          </li>
                        ))}
                      </ul>
                    </TD>
                    <TD>
                      <Badge status={rx.status === 'dispensed' ? 'dispensed' : 'pending'}>
                        {rx.status.toUpperCase()}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      {rx.status === 'pending' ? (
                        <Button
                          variant="primary"
                          onClick={() => openDispenseModal(rx)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <CheckSquare className="h-3.5 w-3.5 mr-1" />
                          Verify & Dispense
                        </Button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-semibold">Dispensed</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="No prescriptions in queue"
              description="New prescriptions will appear here automatically when created by doctors."
              icon={Pill}
            />
          )}
        </CardContent>
      </Card>

      {/* Verify & Dispense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Verify Prescription Stock & Dispense"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={dispensing} className="cursor-pointer">
              Close
            </Button>
            <Button variant="primary" onClick={handleDispenseSubmit} disabled={dispensing} className="cursor-pointer">
              {dispensing ? 'Dispensing...' : 'Confirm Dispensing'}
            </Button>
          </>
        }
      >
        {selectedRx && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-md text-xs space-y-1">
              <p><span className="font-semibold text-slate-600">Patient Chart:</span> {selectedRx.patient?.name}</p>
              <p><span className="font-semibold text-slate-600">Ordering Doctor:</span> {selectedRx.doctor?.name}</p>
              <p><span className="font-semibold text-slate-600">Prescription Date:</span> {new Date(selectedRx.createdAt).toLocaleString()}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider">Medicines Verification Log</h4>
              <div className="space-y-3">
                {selectedRx.medicines.map((med, idx) => {
                  const check = checkStockAvailability(med.name);
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-slate-150 rounded-md text-xs bg-white gap-3">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                        <p className="text-slate-500 mt-1">Dosage: {med.dosage} | Frequency: {med.frequency} | Duration: {med.duration}</p>
                        <p className="text-slate-500 italic mt-0.5">Instructions: "{med.instructions || 'None'}"</p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          {check.status === 'in_stock' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                              In Stock: {check.qty} {check.unit}
                            </span>
                          )}
                          {check.status === 'low_stock' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock: {check.qty} {check.unit}
                            </span>
                          )}
                          {check.status === 'not_found' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 gap-1">
                              <AlertTriangle className="h-3 w-3" /> Not in Stock
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end">
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Quantity to Deduct</label>
                          <input
                            type="number"
                            min="0"
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-right font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
                            value={dispenseQuantities[idx] ?? 1}
                            onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PharmacyPrescriptions;
