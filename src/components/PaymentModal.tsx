import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import { paymentService } from '../lib/crm-service';
import { Order, PaymentMode, PaymentStatus, ClearanceStatus } from '../types';
import { useToast } from './Toast';
import { Camera, Upload, Loader2, Landmark, CreditCard, Banknote, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { Timestamp } from 'firebase/firestore';

interface PaymentModalProps {
  order: Order;
  userId: string;
  close: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ order, userId, close }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<PaymentMode>(PaymentMode.UPI);
  const [amount, setAmount] = useState<number>(0);
  
  // Cheque fields
  const [chequeNumber, setChequeNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [chequeDate, setChequeDate] = useState('');

  const { showToast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleUpload = async () => {
    if (!file || amount <= 0) {
      showToast("Please provide valid amount and proof.", "error");
      return;
    }
    
    if (mode === PaymentMode.CHEQUE && (!chequeNumber || !bankName || !chequeDate)) {
      showToast("Please provide all cheque details.", "error");
      return;
    }

    setLoading(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `payments/${order.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Create Payment Record via Service
      await paymentService.createPayment({
        orderId: order.id,
        amount,
        mode,
        proofUrl: downloadURL,
        chequeNumber: mode === PaymentMode.CHEQUE ? chequeNumber : undefined,
        bankName: mode === PaymentMode.CHEQUE ? bankName : undefined,
        chequeDate: mode === PaymentMode.CHEQUE ? Timestamp.fromDate(new Date(chequeDate)) : undefined,
      }, userId);

      showToast(
        mode === PaymentMode.CHEQUE 
          ? "Cheque logged. Awaiting clearance." 
          : "Payment proof uploaded. Awaiting verification.", 
        "success"
      );
      close();
    } catch (error: any) {
      console.error(error);
      showToast("Upload failed: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative space-y-6 overflow-y-auto max-h-[90vh]"
      >
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-black tracking-tight">Financial Settlement</h3>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Log transaction details for verification</p>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { id: PaymentMode.UPI, icon: <CreditCard size={18}/>, label: 'UPI' },
            { id: PaymentMode.CASH, icon: <Banknote size={18}/>, label: 'CASH' },
            { id: PaymentMode.TRANSFER, icon: <Landmark size={18}/>, label: 'BANK' },
            { id: PaymentMode.CHEQUE, icon: <FileText size={18}/>, label: 'CHEQUE' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                mode === m.id ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
              }`}
            >
              {m.icon}
              <span className="text-[8px] font-black uppercase">{m.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Settlement Amount</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100 focus:border-brand-blue outline-none transition-all"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
            />
          </div>

          {mode === PaymentMode.CHEQUE && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Cheque Number</label>
                  <input 
                    placeholder="XXXXXX" 
                    className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100 focus:border-brand-blue outline-none transition-all"
                    value={chequeNumber}
                    onChange={e => setChequeNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Cheque Date</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100 focus:border-brand-blue outline-none transition-all"
                    value={chequeDate}
                    onChange={e => setChequeDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 ml-2">Issuing Bank</label>
                <input 
                  placeholder="Bank Name" 
                  className="w-full bg-slate-50 p-5 rounded-2xl font-bold border border-slate-100 focus:border-brand-blue outline-none transition-all"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                />
              </div>
            </motion.div>
          )}

          <div className="relative group">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="payment-upload" disabled={loading} />
            <label 
              htmlFor="payment-upload"
              className={`block aspect-video rounded-[2rem] border-4 border-dashed transition-all cursor-pointer overflow-hidden relative ${
                preview ? 'border-emerald-500/20' : 'border-slate-100 hover:border-brand-blue/30 bg-slate-50'
              }`}
            >
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-300 group-hover:text-brand-blue transition-colors">
                  <Camera size={48} strokeWidth={1.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Capture or Select Proof</span>
                </div>
              )}
            </label>
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button 
            onClick={handleUpload}
            disabled={!file || loading || amount <= 0}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
            {loading ? 'Processing...' : 'Submit Settlement'}
          </button>
          <button onClick={close} disabled={loading} className="w-full py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Abort Sequence</button>
        </div>
      </motion.div>
    </div>
  );
};
