import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import { TestTube, Play, FileUp, Plus, Trash, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const LabDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Report Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [resultSummary, setResultSummary] = useState('');
  const [structuredKeys, setStructuredKeys] = useState([{ key: '', value: '' }]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await axiosInstance.get('/lab-requests');
      if (res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load laboratory requests queue');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchRequests();
      setLoading(false);
    };
    init();
  }, []);

  const handleStartTest = async (reqId) => {
    const toastId = toast.loading('Starting test process...');
    try {
      const res = await axiosInstance.put(`/lab-requests/${reqId}/status`, { status: 'in_progress' });
      if (res.data.success) {
        toast.success('Test status updated to In Progress', { id: toastId });
        fetchRequests();
      } else {
        toast.error(res.data.message || 'Failed to start test', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to update status', { id: toastId });
    }
  };

  const openReportModal = (req) => {
    setSelectedReq(req);
    setResultSummary('');
    setStructuredKeys([{ key: '', value: '' }]);
    setSelectedFile(null);
    setReportModalOpen(true);
  };

  const addKeyRow = () => {
    setStructuredKeys(prev => [...prev, { key: '', value: '' }]);
  };

  const removeKeyRow = (index) => {
    setStructuredKeys(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleKeyChange = (index, field, value) => {
    setStructuredKeys(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!resultSummary.trim()) {
      toast.error('Please specify a result summary');
      return;
    }

    setUploading(true);
    const toastId = toast.loading('Uploading diagnostic report...');

    // Convert key-value rows to object
    const resultsObj = {};
    structuredKeys.forEach(row => {
      if (row.key.trim() && row.value.trim()) {
        resultsObj[row.key.trim()] = row.value.trim();
      }
    });

    // Create Multipart Form
    const formData = new FormData();
    formData.append('labTestRequestId', selectedReq._id);
    formData.append('resultSummary', resultSummary.trim());
    formData.append('structuredResults', JSON.stringify(resultsObj));
    if (selectedFile) {
      formData.append('reportFile', selectedFile);
    }

    try {
      const res = await axiosInstance.post('/lab-reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.data.success) {
        toast.success('Lab report submitted successfully!', { id: toastId });
        setReportModalOpen(false);
        fetchRequests();
      } else {
        toast.error(res.data.message || 'Report upload failed', { id: toastId });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading report documents', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const filtered = requests.filter(req => {
    if (filterStatus === 'all') return true;
    return req.status === filterStatus;
  });

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      <Card>
        <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All Requests', value: 'all' },
              { label: 'Requested Tests', value: 'requested' },
              { label: 'In Progress Queue', value: 'in_progress' },
              { label: 'Completed Reports', value: 'completed' }
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

          <Button variant="secondary" onClick={fetchRequests} className="cursor-pointer">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Queue
          </Button>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lab Diagnostics Requests Board</CardTitle>
          <p className="text-xs text-slate-500 mt-1">Review pending physician requests, perform diagnostics, and submit reports.</p>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <Table>
              <THead>
                <TR>
                  <TH>Date Requested</TH>
                  <TH>Patient Details</TH>
                  <TH>Recommended Test Type</TH>
                  <TH>Attending Doctor</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((req) => (
                  <TR key={req._id}>
                    <TD className="font-medium text-slate-800 text-xs">
                      {new Date(req.requestedAt).toLocaleString()}
                    </TD>
                    <TD>
                      <p className="font-semibold text-slate-900 text-xs">{req.patient?.name}</p>
                      <p className="text-[10px] text-slate-400">Phone: {req.patient?.phone}</p>
                    </TD>
                    <TD className="font-semibold text-slate-850 text-xs">{req.testType}</TD>
                    <TD className="text-xs text-slate-650">{req.doctor?.name}</TD>
                    <TD>
                      <Badge status={req.status}>{req.status.replace('_', ' ')}</Badge>
                    </TD>
                    <TD className="text-right">
                      {req.status === 'requested' && (
                        <Button
                          variant="secondary"
                          onClick={() => handleStartTest(req._id)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <Play className="h-3.5 w-3.5 mr-1" />
                          Start Test
                        </Button>
                      )}

                      {req.status === 'in_progress' && (
                        <Button
                          variant="primary"
                          onClick={() => openReportModal(req)}
                          className="px-2.5 py-1.5 text-xs font-semibold cursor-pointer"
                        >
                          <FileUp className="h-3.5 w-3.5 mr-1" />
                          Upload Report
                        </Button>
                      )}
                      
                      {req.status === 'completed' && (
                        <span className="text-emerald-700 text-xs font-semibold">Report Submitted</span>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState
              message="No diagnostics tests found"
              description="New lab recommendations will appear here automatically when requested by doctors."
              icon={TestTube}
            />
          )}
        </CardContent>
      </Card>

      {/* Lab Report Upload Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Compile Laboratory Diagnostic Findings"
        footerActions={
          <>
            <Button variant="outline" onClick={() => setReportModalOpen(false)} disabled={uploading} className="cursor-pointer">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleReportSubmit} disabled={uploading} className="cursor-pointer">
              {uploading ? 'Submitting Report...' : 'Submit Diagnostics Report'}
            </Button>
          </>
        }
      >
        {selectedReq && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-md text-xs space-y-1">
              <p><span className="font-semibold text-slate-600">Patient:</span> {selectedReq.patient?.name}</p>
              <p><span className="font-semibold text-slate-600">Attending Doctor:</span> {selectedReq.doctor?.name}</p>
              <p><span className="font-semibold text-slate-600">Test Ordered:</span> {selectedReq.testType}</p>
            </div>

            <form className="space-y-4">
              <Input
                label="Result Diagnostic Summary"
                id="resultSummary"
                type="text"
                placeholder="e.g. Hemoglobin levels normal at 14.5 g/dL. No anomalies."
                value={resultSummary}
                onChange={(e) => setResultSummary(e.target.value)}
                disabled={uploading}
                required
              />

              {/* Structured Key Values */}
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Structured Result Data</span>
                  <button
                    type="button"
                    onClick={addKeyRow}
                    disabled={uploading}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Metric Row
                  </button>
                </div>

                <div className="space-y-2">
                  {structuredKeys.map((row, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <Input
                        placeholder="Metric e.g. Hemoglobin"
                        id={`key-${idx}`}
                        value={row.key}
                        onChange={(e) => handleKeyChange(idx, 'key', e.target.value)}
                        disabled={uploading}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Value e.g. 14.5 g/dL"
                        id={`val-${idx}`}
                        value={row.value}
                        onChange={(e) => handleKeyChange(idx, 'value', e.target.value)}
                        disabled={uploading}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeKeyRow(idx)}
                        className="text-slate-450 hover:text-red-600 font-bold p-1 cursor-pointer"
                        disabled={uploading}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Attachment Upload */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Attach Lab PDF / Report File (Optional)</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-xs text-slate-500 border border-slate-300 rounded bg-white py-2 px-3 shadow-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LabDashboard;
