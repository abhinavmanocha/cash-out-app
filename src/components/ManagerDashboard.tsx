import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Download, 
  AlertCircle, 
  Users, 
  Utensils, 
  DollarSign, 
  Trash2,
  FileText,
  UserCog,
  BarChart3
} from 'lucide-react';
import ServerManagement from './ServerManagement';

type TabType = 'reports' | 'servers';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, reportId: string | null, reportName: string}>({
    show: false,
    reportId: null,
    reportName: ''
  });
  const [deleting, setDeleting] = useState(false);

  // Load reports from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, 'cashOutReports'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reportsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(reportsData);
        setLoading(false);
      }, (err) => {
        console.error("Firebase fetch error:", err);
        setError("Failed to load reports. Is Firebase configured correctly?");
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error(err);
      setError("Firebase not configured properly.");
      setLoading(false);
    }
  }, []);

  const totals = reports.reduce((acc, report) => {
    acc.kitchenTipOut += report.kitchenTipOut || 0;
    acc.totalTipOut += report.totalTipOut || 0;
    acc.netCashOwing += report.serverCalculations?.netCashOwing || 0;
    const finalBalance = (report.serverCalculations?.netCashOwing || 0) + (report.totalTipOut || 0);
    acc.totalBalance += finalBalance;
    return acc;
  }, { kitchenTipOut: 0, totalTipOut: 0, netCashOwing: 0, totalBalance: 0 });

  const handleDownloadCSV = () => {
    if (reports.length === 0) return;

    const headers = [
      'Date', 'Name', 'Total Sales', 'Food Sales', 'Liquor Sales',
      'Kitchen Tip Out', 'Total Tip Out',
      'Net Cash Owing (Base)', 'Final Balance (Owing House)'
    ];

    const csvRows = [headers.join(',')];

    reports.forEach(report => {
      const finalBalance = (report.serverCalculations?.netCashOwing || 0) + (report.totalTipOut || 0);
      const row = [
        report.date,
        `"${report.name}"`,
        report.totalSales?.toFixed(2) || 0,
        report.foodSales?.toFixed(2) || 0,
        report.liquorSales?.toFixed(2) || 0,
        report.kitchenTipOut?.toFixed(2) || 0,
        report.totalTipOut?.toFixed(2) || 0,
        report.serverCalculations?.netCashOwing?.toFixed(2) || 0,
        finalBalance.toFixed(2)
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cash-out-summary-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (reportId: string, reportName: string) => {
    setDeleteConfirm({
      show: true,
      reportId,
      reportName
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.reportId) return;
    
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'cashOutReports', deleteConfirm.reportId));
      setDeleteConfirm({ show: false, reportId: null, reportName: '' });
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(`Failed to delete submission: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, reportId: null, reportName: '' });
  };

  if (loading && activeTab === 'reports') {
    return <div className="text-center py-10">Loading reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Only show on reports tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Kitchen Tip-Out</p>
                <p className="text-2xl font-bold text-gray-900">${totals.kitchenTipOut.toFixed(2)}</p>
              </div>
              <Utensils className="h-8 w-8 text-blue-100" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Tip-Out</p>
                <p className="text-2xl font-bold text-gray-900">${totals.totalTipOut.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-red-100" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Net Cash Owing</p>
                <p className={`text-2xl font-bold ${totals.netCashOwing >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {totals.netCashOwing < 0 ? '-' : ''}${Math.abs(totals.netCashOwing).toFixed(2)}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-100" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase">Total Amount Owing</p>
                <p className="text-2xl font-bold text-gray-900">${totals.totalBalance.toFixed(2)}</p>
              </div>
              <Users className="h-8 w-8 text-green-100" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('reports')}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'reports'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Staff Submissions
              <span className="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-800">
                {reports.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('servers')}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'servers'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <UserCog className="h-5 w-5 mr-2" />
              Server Management
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Reports Tab Content */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">Staff Submissions</h2>
                <button
                  onClick={handleDownloadCSV}
                  disabled={reports.length === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Summary
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 flex">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="overflow-x-auto">
                {reports.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No submissions received yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Once staff submit their cash out sheets, they will appear here.</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3 text-left">Date/Name</th>
                        <th className="px-4 py-3 text-right">Kitchen Tip</th>
                        <th className="px-4 py-3 text-right">Total Tip</th>
                        <th className="px-4 py-3 text-right">Net Cash Owing</th>
                        <th className="px-4 py-3 text-right">Final Balance</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reports.map((report) => {
                        const finalBalance = (report.serverCalculations?.netCashOwing || 0) + (report.totalTipOut || 0);
                        const netCashOwing = report.serverCalculations?.netCashOwing || 0;
                        return (
                          <tr key={report.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{report.name}</div>
                              <div className="text-xs text-gray-500">{report.date}</div>
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-gray-900 font-medium">
                              ${Number(report.kitchenTipOut || 0).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-right text-sm text-gray-900 font-medium">
                              ${Number(report.totalTipOut || 0).toFixed(2)}
                            </td>
                            <td className={`px-4 py-4 text-right text-sm font-bold ${netCashOwing >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {netCashOwing < 0 ? '-' : ''}${Math.abs(netCashOwing).toFixed(2)}
                            </td>
                            <td className={`px-4 py-4 text-right text-sm font-bold ${finalBalance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {finalBalance < 0 ? '-' : ''}${Math.abs(finalBalance).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => handleDeleteClick(report.id, report.name)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                                disabled={deleting}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* Servers Tab Content */}
          {activeTab === 'servers' && <ServerManagement />}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Submission</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the submission for <span className="font-bold">{deleteConfirm.reportName}</span>?
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none flex items-center"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="mr-2">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;