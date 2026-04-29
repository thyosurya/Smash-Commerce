import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Wrench, ChevronLeft, CheckCircle2, ChevronRight, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, products } from '../../data/mockData';

const STRINGS = products.filter(p => p.category === 'string');

const TENSION_OPTIONS = [
  { value: 20, label: '20 lbs - Beginner (More Power, Less Control)' },
  { value: 22, label: '22 lbs - Beginner to Intermediate' },
  { value: 24, label: '24 lbs - Intermediate (Balanced Power & Control)' },
  { value: 26, label: '26 lbs - Intermediate to Advanced' },
  { value: 28, label: '28 lbs - Advanced (More Control, Less Power)' },
  { value: 30, label: '30 lbs - Professional Level' },
];

const SERVICE_FEE = 30000; // Harga jasa pasang senar

export default function StringingService() {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const [selectedStringId, setSelectedStringId] = useState<string>('');
  const [selectedTension, setSelectedTension] = useState<number>(24);
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedString = STRINGS.find(s => s.id === selectedStringId);
  const totalPrice = SERVICE_FEE + (selectedString ? selectedString.price : 0);

  const handleAddToCart = () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!selectedString) return;

    const serviceProduct = {
      ...selectedString,
      id: `service-${selectedString.id}`,
      name: `Jasa Pasang Senar + ${selectedString.name}`,
    };

    addToCart(serviceProduct, 1, { stringType: 'Jasa Pasang Senar', tension: selectedTension });
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/cart');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg text-slate-800">Stringing Service</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Intro */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
            <Wrench size={100} />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">Jasa Pasang Senar</h2>
            <p className="text-sm text-blue-50 opacity-90 mb-4">
              Pilih senar favorit Anda dan atur tension sesuai gaya bermain. Mesin digital kami menjamin akurasi 100%.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              Biaya Jasa: {formatCurrency(SERVICE_FEE)}
            </div>
          </div>
        </div>

        {/* Step 1: Select String */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
            Pilih Jenis Senar
          </h3>
          <div className="space-y-3">
            {STRINGS.map(string => (
              <div 
                key={string.id}
                onClick={() => setSelectedStringId(string.id)}
                className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer flex gap-4 ${
                  selectedStringId === string.id ? 'border-blue-500 shadow-md bg-blue-50/50' : 'border-transparent shadow-sm'
                }`}
              >
                <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                  <img src={string.image} alt={string.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-800">{string.name}</h4>
                    {selectedStringId === string.id && <CheckCircle2 size={18} className="text-blue-600" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">{string.description}</p>
                  <div className="text-sm font-bold text-blue-600">{formatCurrency(string.price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Tension */}
        <div>
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
            Pilih Tension (Tarikan)
          </h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {TENSION_OPTIONS.map((option, idx) => (
              <div 
                key={option.value}
                onClick={() => setSelectedTension(option.value)}
                className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${
                  idx !== TENSION_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''
                } ${selectedTension === option.value ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-sm ${selectedTension === option.value ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                  {option.label}
                </span>
                {selectedTension === option.value && <Check size={16} className="text-blue-600" />}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Bottom Bar */}
      <div className="lg:bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Total Biaya</div>
            <div className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</div>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={!selectedStringId}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/30"
          >
            Pesan Layanan <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm flex flex-col items-center text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Berhasil!</h3>
            <p className="text-sm text-gray-500 mb-6">Layanan pasang senar telah ditambahkan ke keranjang.</p>
          </div>
        </div>
      )}
    </div>
  );
}
