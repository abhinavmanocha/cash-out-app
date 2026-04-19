import { useState, useMemo, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Calculator, Save, AlertCircle, Info, History, Edit2, X, User, Loader2 } from 'lucide-react';

interface Server {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CashOutForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<{id: string, name: string, date: string}[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);

  // Core Details
  const [name, setName] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('Select your name');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Sales
  const [totalSales, setTotalSales] = useState<number | ''>('');

  // Payments / Tenders (from the image)
  const [giftCards, setGiftCards] = useState<number | ''>('');
  const [paidOuts, setPaidOuts] = useState<number | ''>('');
  const [debit, setDebit] = useState<number | ''>('');
  const [visa, setVisa] = useState<number | ''>('');
  const [mastercard, setMastercard] = useState<number | ''>('');
  const [amex, setAmex] = useState<number | ''>('');
  const [onAccount, setOnAccount] = useState<number | ''>('');
  const [rndAdjst, setRndAdjst] = useState<number | ''>('');
  const [skip, setSkip] = useState<number | ''>('');
  const [uber, setUber] = useState<number | ''>('');
  const [doordash, setDoordash] = useState<number | ''>('');
  const [oVisa, setOVisa] = useState<number | ''>('');
  const [oDebit, setODebit] = useState<number | ''>('');
  const [oMastercard, setOMastercard] = useState<number | ''>('');
  const [oAmex, setOAmex] = useState<number | ''>('');

  // Server Specific Section
  const [cashPayments, setCashPayments] = useState<number | ''>('');
  const [nonCashTips, setNonCashTips] = useState<number | ''>('');
  const [autoGratuity, setAutoGratuity] = useState<number | ''>('');
  const [serverTipCharges, setServerTipCharges] = useState<number | ''>('');

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
        setServers(serversData.filter(server => server.isActive));
        setLoadingServers(false);
      }, (err) => {
        console.error("Firebase fetch error:", err);
        setLoadingServers(false);
      });

      return () => unsubscribe();
    } catch (err: any) {
      console.error(err);
      setLoadingServers(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('my_cashouts');
    if (saved) {
      setRecentSubmissions(JSON.parse(saved));
    }
  }, []);

  const loadSubmission = async (id: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const docRef = doc(db, 'cashOutReports', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEditingId(id);
        const loadedName = data.name || '';
        setName(loadedName);
        
        // Set selectedStaff dropdown based on loaded name
        const matchingServer = servers.find(server => server.name === loadedName);
        if (matchingServer) {
          setSelectedStaff(loadedName);
        } else {
          setSelectedStaff('Other (Enter manually)');
        }
        
        setDate(data.date || '');
        setTotalSales(data.totalSales ?? '');
        
        // Server Section
        setCashPayments(data.serverCalculations?.cashPayments ?? '');
        setNonCashTips(data.serverCalculations?.nonCashTips ?? '');
        setAutoGratuity(data.serverCalculations?.autoGratuity ?? '');
        setServerTipCharges(data.serverCalculations?.serverTipCharges ?? '');

        // Tenders (reordered to match new UI)
        setAmex(data.tenders?.amex ?? '');
        setMastercard(data.tenders?.mastercard ?? '');
        setVisa(data.tenders?.visa ?? '');
        setDebit(data.tenders?.debit ?? '');
        setRndAdjst(data.tenders?.rndAdjst ?? '');
        setGiftCards(data.tenders?.giftCards ?? '');
        setPaidOuts(data.tenders?.paidOuts ?? '');
        setOnAccount(data.tenders?.onAccount ?? '');
        setSkip(data.tenders?.skip ?? '');
        setUber(data.tenders?.uber ?? '');
        setDoordash(data.tenders?.doordash ?? '');
        setOVisa(data.tenders?.oVisa ?? '');
        setODebit(data.tenders?.oDebit ?? '');
        setOMastercard(data.tenders?.oMastercard ?? '');
        setOAmex(data.tenders?.oAmex ?? '');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg('Could not find that submission.');
      }
    } catch (err: any) {
      setErrorMsg('Failed to load. Is Firebase setup?');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setSelectedStaff('Select your name');
    setTotalSales('');
    setCashPayments('');
    setNonCashTips('');
    setAutoGratuity('');
    setServerTipCharges('');
    setGiftCards('');
    setPaidOuts('');
    setDebit('');
    setVisa('');
    setMastercard('');
    setAmex('');
    setOnAccount('');
    setRndAdjst('');
    setSkip('');
    setUber('');
    setDoordash('');
    setOVisa('');
    setODebit('');
    setOMastercard('');
    setOAmex('');
  };

  // Calculations
  const tSales = Number(totalSales) || 0;
  const foodSales = 0; // Removed from form
  const liquorSales = Math.max(0, tSales - foodSales);

  const kitchenTipOut = foodSales > 250 ? foodSales * 0.04 : 0;
  const totalTipOut = kitchenTipOut;

  const serverNetCashOwing = useMemo(() => {
    const cp = Number(cashPayments) || 0;
    const nct = Number(nonCashTips) || 0;
    const ag = Number(autoGratuity) || 0;
    const stc = Number(serverTipCharges) || 0;
    return cp - nct - ag + stc;
  }, [cashPayments, nonCashTips, autoGratuity, serverTipCharges]);

  const finalOwed = useMemo(() => {
    return serverNetCashOwing + totalTipOut;
  }, [serverNetCashOwing, totalTipOut]);

  const creditTotal = useMemo(() => {
    return [debit, visa, mastercard, amex, oVisa, oDebit, oMastercard, oAmex, skip, uber, doordash, giftCards, onAccount, rndAdjst, cashPayments]
      .reduce((sum: number, val) => sum + (Number(val) || 0), 0);
  }, [debit, visa, mastercard, amex, oVisa, oDebit, oMastercard, oAmex, skip, uber, doordash, giftCards, onAccount, rndAdjst, cashPayments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name === 'Select your name' || !date) {
      setErrorMsg('Please select your name from the dropdown and provide a date.');
      return;
    }
    if (selectedStaff === 'Select your name') {
      setErrorMsg('Please select your name from the dropdown.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const reportData: any = {
        name,
        date,
        totalSales: tSales,
        foodSales,
        liquorSales,
        kitchenTipOut,
        totalTipOut,
        serverCalculations: {
          cashPayments: Number(cashPayments) || 0,
          nonCashTips: Number(nonCashTips) || 0,
          autoGratuity: Number(autoGratuity) || 0,
          serverTipCharges: Number(serverTipCharges) || 0,
          netCashOwing: serverNetCashOwing
        },
        tenders: {
          amex: Number(amex) || 0,
          mastercard: Number(mastercard) || 0,
          visa: Number(visa) || 0,
          debit: Number(debit) || 0,
          rndAdjst: Number(rndAdjst) || 0,
          giftCards: Number(giftCards) || 0,
          paidOuts: Number(paidOuts) || 0,
          onAccount: Number(onAccount) || 0,
          skip: Number(skip) || 0,
          uber: Number(uber) || 0,
          doordash: Number(doordash) || 0,
          oVisa: Number(oVisa) || 0,
          oDebit: Number(oDebit) || 0,
          oMastercard: Number(oMastercard) || 0,
          oAmex: Number(oAmex) || 0,
        },
        creditTotal: creditTotal, // Includes cash payments now
        updatedAt: serverTimestamp()
      };

      let docId = editingId;
      if (editingId) {
        await updateDoc(doc(db, 'cashOutReports', editingId), reportData);
        setSuccessMsg('Cash out sheet updated successfully!');
      } else {
        reportData.timestamp = serverTimestamp();
        const docRef = await addDoc(collection(db, 'cashOutReports'), reportData);
        docId = docRef.id;
        
        // Save to local history
        const newHistory = [{id: docId, name, date}, ...recentSubmissions].slice(0, 5);
        setRecentSubmissions(newHistory);
        localStorage.setItem('my_cashouts', JSON.stringify(newHistory));
        
        setSuccessMsg('Cash out sheet submitted successfully!');
        resetForm();
      }
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to submit report. Have you configured Firebase?');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prepare staff names from servers
  const staffNames = [
    'Select your name',
    ...servers.map(server => server.name),
    'Other (Enter manually)'
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white shadow rounded-lg px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div className="flex-1"></div>
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide text-center flex-1">
            {editingId ? 'Edit Cash Out Sheet' : 'Server Cash Out Sheet'}
          </h2>
          <div className="flex-1 flex justify-end">
            {editingId && (
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 flex items-center text-sm font-medium">
                <X className="h-4 w-4 mr-1" /> Cancel Edit
              </button>
            )}
          </div>
        </div>
        
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-sm text-red-700">{errorMsg}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
            <p className="text-sm text-green-700">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
            e.preventDefault();
            // Let the InputField handle moving to next field
          }
        }}>
          {/* Header section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col mb-4">
              <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Staff Name</label>
              <div className="relative">
                <select
                  value={selectedStaff}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedStaff(value);
                    if (value !== 'Other (Enter manually)' && value !== 'Select your name') {
                      setName(value);
                    } else if (value === 'Select your name') {
                      setName('');
                    } else {
                      setName('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // Find the next input field
                      const inputs = Array.from(document.querySelectorAll('input:not([disabled]), select'));
                      const currentIndex = inputs.indexOf(e.target as HTMLElement);
                      if (currentIndex < inputs.length - 1) {
                        const nextInput = inputs[currentIndex + 1] as HTMLElement;
                        nextInput.focus();
                        if (nextInput.tagName === 'SELECT') {
                          setTimeout(() => {
                            (nextInput as HTMLSelectElement).focus();
                          }, 0);
                        }
                      }
                    }
                  }}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500 appearance-none"
                  disabled={loadingServers}
                >
                  {loadingServers ? (
                    <option value="Select your name">Loading servers...</option>
                  ) : (
                    staffNames.map((staffName) => (
                      <option key={staffName} value={staffName}>
                        {staffName}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  {loadingServers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
              </div>
              {selectedStaff === 'Other (Enter manually)' && (
                <div className="mt-3">
                  <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Enter Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        // Find the next input field
                        const inputs = Array.from(document.querySelectorAll('input:not([disabled]), select'));
                        const currentIndex = inputs.indexOf(e.target as HTMLElement);
                        if (currentIndex < inputs.length - 1) {
                          const nextInput = inputs[currentIndex + 1] as HTMLElement;
                          nextInput.focus();
                          if (nextInput.tagName === 'SELECT') {
                            setTimeout(() => {
                              (nextInput as HTMLSelectElement).focus();
                            }, 0);
                          }
                        }
                      }
                    }}
                    className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}
              {servers.length === 0 && !loadingServers && (
                <p className="mt-2 text-xs text-gray-500 italic">
                  No servers found. Managers can add servers in the Manager Dashboard.
                </p>
              )}
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const inputs = Array.from(document.querySelectorAll('input:not([disabled]), select'));
                    const currentIndex = inputs.indexOf(e.target as HTMLElement);
                    if (currentIndex < inputs.length - 1) {
                      const nextInput = inputs[currentIndex + 1] as HTMLElement;
                      nextInput.focus();
                    }
                  }
                }}
                className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Sales & Tip Out Calculation Section */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales & Tip Out Calculation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Sales Input */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Total Sales ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalSales}
                  onChange={(e) => setTotalSales(e.target.value === '' ? '' : Number(e.target.value))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const inputs = Array.from(document.querySelectorAll('input:not([disabled]), select'));
                      const currentIndex = inputs.indexOf(e.target as HTMLElement);
                      if (currentIndex < inputs.length - 1) {
                        const nextInput = inputs[currentIndex + 1] as HTMLElement;
                        nextInput.focus();
                      }
                    }
                  }}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Calculated Values Display */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Food Sales:</span>
                  <span className="text-sm font-bold text-gray-900">${foodSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Liquor Sales:</span>
                  <span className="text-sm font-bold text-gray-900">${liquorSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Kitchen Tip Out (4%):</span>
                  <span className="text-sm font-bold text-red-600">${kitchenTipOut.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="text-sm font-bold text-gray-900">Total Tip Out:</span>
                  <span className="text-sm font-bold text-red-600">${totalTipOut.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment/Tender Section */}
          <div className="bg-white p-6 rounded-lg shadow border mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payments / Tenders</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Gift Cards */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Gift Cards</label>
                <input
                  type="number"
                  step="0.01"
                  value={giftCards}
                  onChange={(e) => setGiftCards(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Paid Outs */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Paid Outs</label>
                <input
                  type="number"
                  step="0.01"
                  value={paidOuts}
                  onChange={(e) => setPaidOuts(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Debit */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Debit</label>
                <input
                  type="number"
                  step="0.01"
                  value={debit}
                  onChange={(e) => setDebit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Visa */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Visa</label>
                <input
                  type="number"
                  step="0.01"
                  value={visa}
                  onChange={(e) => setVisa(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Mastercard */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Mastercard</label>
                <input
                  type="number"
                  step="0.01"
                  value={mastercard}
                  onChange={(e) => setMastercard(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Amex */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Amex</label>
                <input
                  type="number"
                  step="0.01"
                  value={amex}
                  onChange={(e) => setAmex(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* On Account */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">On Account</label>
                <input
                  type="number"
                  step="0.01"
                  value={onAccount}
                  onChange={(e) => setOnAccount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Rnd Adjst */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Rnd Adjst</label>
                <input
                  type="number"
                  step="0.01"
                  value={rndAdjst}
                  onChange={(e) => setRndAdjst(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Skip */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Skip</label>
                <input
                  type="number"
                  step="0.01"
                  value={skip}
                  onChange={(e) => setSkip(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Uber */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Uber</label>
                <input
                  type="number"
                  step="0.01"
                  value={uber}
                  onChange={(e) => setUber(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* DoorDash */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">DoorDash</label>
                <input
                  type="number"
                  step="0.01"
                  value={doordash}
                  onChange={(e) => setDoordash(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* O Visa */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">O Visa</label>
                <input
                  type="number"
                  step="0.01"
                  value={oVisa}
                  onChange={(e) => setOVisa(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* O Debit */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">O Debit</label>
                <input
                  type="number"
                  step="0.01"
                  value={oDebit}
                  onChange={(e) => setODebit(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* O Mastercard */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">O Mastercard</label>
                <input
                  type="number"
                  step="0.01"
                  value={oMastercard}
                  onChange={(e) => setOMastercard(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* O Amex */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">O Amex</label>
                <input
                  type="number"
                  step="0.01"
                  value={oAmex}
                  onChange={(e) => setOAmex(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Server Calculations Section */}
          <div className="bg-white p-6 rounded-lg shadow border mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Server Calculations</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cash Payments */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Cash Payments</label>
                <input
                  type="number"
                  step="0.01"
                  value={cashPayments}
                  onChange={(e) => setCashPayments(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Non-Cash Tips */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Non-Cash Tips</label>
                <input
                  type="number"
                  step="0.01"
                  value={nonCashTips}
                  onChange={(e) => setNonCashTips(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Auto Gratuity */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Auto Gratuity</label>
                <input
                  type="number"
                  step="0.01"
                  value={autoGratuity}
                  onChange={(e) => setAutoGratuity(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
              
              {/* Server Tip Charges */}
              <div className="flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider mb-1 text-gray-700">Server Tip Charges</label>
                <input
                  type="number"
                  step="0.01"
                  value={serverTipCharges}
                  onChange={(e) => setServerTipCharges(e.target.value === '' ? '' : Number(e.target.value))}
                  className="block w-full rounded-md shadow-sm sm:text-sm border p-3 bg-white border-gray-300 text-gray-900 focus:ring-red-500 focus:border-red-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Server Calculations Display */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Server Net Cash Owing:</span>
                    <span className={`text-sm font-bold ${serverNetCashOwing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${serverNetCashOwing.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Cash Payments - Non-Cash Tips - Auto Gratuity + Server Tip Charges
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Credit Total:</span>
                    <span className="text-sm font-bold text-blue-600">${creditTotal.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Sum of all payment methods including cash
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Final Summary Section */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Final Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-medium text-gray-900">Server Net Cash Owing:</span>
                <span className={`text-base font-bold ${serverNetCashOwing >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${serverNetCashOwing.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between items-center