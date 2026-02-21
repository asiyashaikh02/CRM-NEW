import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  MoreVertical, 
  Send, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  Package,
  CreditCard,
  User,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { 
  Order, 
  OrderStatus, 
  UserProfile, 
  PaymentMode, 
  PaymentStatus, 
  ClearanceStatus,
  ChatMessage
} from '../types';
import { orderService, paymentService } from '../lib/crm-service';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface WhatsAppDashboardProps {
  user: UserProfile;
  orders: Order[];
}

export const WhatsAppDashboard: React.FC<WhatsAppDashboardProps> = ({ user, orders }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orders[0]?.id || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  useEffect(() => {
    if (selectedOrderId) {
      const unsub = orderService.subscribeToChat(selectedOrderId, setMessages);
      return () => unsub();
    }
  }, [selectedOrderId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOrderId) return;

    try {
      await orderService.sendMessage(selectedOrderId, newMessage, user.uid, user.name);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!selectedOrderId) return;
    setLoading(true);
    try {
      await orderService.updateStatus(selectedOrderId, status, user.uid, user.name);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o as any).clientName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
      {/* Left Panel: List */}
      <div className="w-96 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 bg-white border-b border-slate-100 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black tracking-tighter">Assigned Nodes</h2>
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><MoreVertical size={16}/></div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              placeholder="Search orders..." 
              className="w-full bg-slate-50 py-3 pl-12 pr-4 rounded-xl text-xs font-bold border border-transparent focus:border-brand-blue outline-none transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredOrders.map(order => (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`w-full p-6 flex items-start gap-4 transition-all border-b border-slate-100/50 ${
                selectedOrderId === order.id ? 'bg-white shadow-lg z-10 relative' : 'hover:bg-white/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                selectedOrderId === order.id ? 'bg-brand-blue text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                <Package size={20} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black truncate">{(order as any).clientName || 'Unknown Client'}</h4>
                  <span className="text-[8px] font-bold text-slate-300 uppercase shrink-0">
                    {order.createdAt instanceof Timestamp ? format(order.createdAt.toDate(), 'HH:mm') : ''}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 truncate mb-2">Order ID: {order.id}</p>
                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                    order.status === OrderStatus.COMPLETED ? 'bg-emerald-100 text-emerald-600' :
                    order.status === OrderStatus.IN_PROGRESS ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-200 text-slate-500'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Panel: Chat & Details */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedOrder ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400"><User size={20}/></div>
                <div>
                  <h3 className="text-lg font-black tracking-tighter">{(selectedOrder as any).clientName || 'Order Details'}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Live Connection Established</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {selectedOrder.status === OrderStatus.ASSIGNED && (
                  <button 
                    onClick={() => handleUpdateStatus(OrderStatus.ACCEPTED)}
                    className="px-6 py-3 bg-brand-blue text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                  >
                    Accept Node
                  </button>
                )}
                {selectedOrder.status === OrderStatus.ACCEPTED && (
                  <button 
                    onClick={() => handleUpdateStatus(OrderStatus.IN_PROGRESS)}
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                  >
                    Start Execution
                  </button>
                )}
                {selectedOrder.status === OrderStatus.IN_PROGRESS && (
                  <button 
                    onClick={() => handleUpdateStatus(OrderStatus.COMPLETED)}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all"
                  >
                    Finalize Node
                  </button>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex justify-center">
                  <span className="px-4 py-1 bg-white border border-slate-100 rounded-full text-[8px] font-black uppercase text-slate-300 tracking-widest shadow-sm">
                    Lifecycle Initialized: {selectedOrder.createdAt instanceof Timestamp ? format(selectedOrder.createdAt.toDate(), 'MMMM dd, yyyy') : ''}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                        msg.senderId === user.uid 
                          ? 'bg-brand-blue text-white rounded-tr-none' 
                          : 'bg-white text-slate-900 rounded-tl-none border border-slate-100'
                      }`}>
                        {msg.senderId !== user.uid && (
                          <p className="text-[8px] font-black uppercase mb-1 opacity-50">{msg.senderName}</p>
                        )}
                        <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                        <p className={`text-[8px] font-bold mt-2 text-right ${msg.senderId === user.uid ? 'text-white/50' : 'text-slate-300'}`}>
                          {msg.createdAt instanceof Timestamp ? format(msg.createdAt.toDate(), 'HH:mm') : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex items-center gap-4">
                <button type="button" className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all">
                  <ImageIcon size={20} />
                </button>
                <div className="flex-1 relative">
                  <input 
                    placeholder="Type a message or protocol update..." 
                    className="w-full bg-slate-50 py-4 px-6 rounded-2xl text-sm font-bold border border-transparent focus:border-brand-blue outline-none transition-all"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:bg-brand-blue transition-all active:scale-95"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 p-12">
            <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mb-6">
              <Package size={64} />
            </div>
            <h3 className="text-2xl font-black text-slate-300">Select an active node</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Awaiting operational selection</p>
          </div>
        )}
      </div>
    </div>
  );
};
