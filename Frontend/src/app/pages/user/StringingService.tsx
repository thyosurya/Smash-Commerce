import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Wrench, ChevronLeft, CheckCircle2, ChevronRight, Check, Scissors } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, products } from '../../data/mockData';

const STRINGS = products.filter(p => p.category === 'string');
const GRIPS = products.filter(p => p.category === 'grip');

const TENSION_OPTIONS = [
  { value: 20, label: '20 lbs - Pemula (Power Lebih, Kontrol Kurang)' },
  { value: 22, label: '22 lbs - Pemula ke Menengah' },
  { value: 24, label: '24 lbs - Menengah (Power & Kontrol Seimbang)' },
  { value: 26, label: '26 lbs - Menengah ke Mahir' },
  { value: 28, label: '28 lbs - Mahir (Kontrol Lebih, Power Kurang)' },
  { value: 30, label: '30 lbs - Level Profesional' },
];

const STRING_SERVICE_FEE = 30000;
const GRIP_SERVICE_FEE = 5000;

export default function StringingService() {
  const navigate = useNavigate();
  const { state, addToCart } = useApp();
  const [activeTab, setActiveTab] = useState<'string' | 'grip'>('string');
  
  // String state
  const [selectedStringId, setSelectedStringId] = useState<string>('');
  const [selectedTension, setSelectedTension] = useState<number>(24);
  
  // Grip state
  const [selectedGripId, setSelectedGripId] = useState<string>('');

  const [showSuccess, setShowSuccess] = useState(false);

  const selectedString = STRINGS.find(s => s.id === selectedStringId);
  const selectedGrip = GRIPS.find(g => g.id === selectedGripId);

  const totalPrice = activeTab === 'string'
    ? STRING_SERVICE_FEE + (selectedString ? selectedString.price : 0)
    : GRIP_SERVICE_FEE + (selectedGrip ? selectedGrip.price : 0);

  const isButtonDisabled = activeTab === 'string' ? !selectedStringId : !selectedGripId;

  const handleAddToCart = () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (activeTab === 'string') {
      if (!selectedString) return;
      const serviceProduct = {
        ...selectedString,
        id: `service-${selectedString.id}`,
        name: `Jasa Pasang Senar + ${selectedString.name}`,
      };
      addToCart(serviceProduct, 1, { stringType: 'Jasa Pasang Senar', tension: selectedTension });
    } else {
      if (!selectedGrip) return;
      const serviceProduct = {
        ...selectedGrip,
        id: `service-${selectedGrip.id}`,
        name: `Jasa Pasang Grip + ${selectedGrip.name}`,
      };
      addToCart(serviceProduct, 1, { gripType: 'Jasa Pasang Grip' });
    }
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/cart');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] pb-24">
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full text-gray-600 hover:bg-gray-100">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg text-slate-800">Layanan Kustomisasi</h1>
        <div className="w-10"></div>
      </header>

      {/* Tabs */}
      <div className="bg-white px-4 border-b border-gray-200 sticky top-[60px] z-20">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('string')}
            className={`py-3.5 text-sm font-semibold border-b-2 transition-colors flex-1 text-center ${activeTab === 'string' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Jasa Senar
          </button>
          <button 
            onClick={() => setActiveTab('grip')}
            className={`py-3.5 text-sm font-semibold border-b-2 transition-colors flex-1 text-center ${activeTab === 'grip' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'}`}
          >
            Jasa Grip
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6 max-w-lg mx-auto mt-2">
        {/* Intro */}
        {activeTab === 'string' ? (
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
                Biaya Jasa: {formatCurrency(STRING_SERVICE_FEE)}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-500 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4">
              <Scissors size={100} />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-2">Jasa Pasang Grip</h2>
              <p className="text-sm text-purple-50 opacity-90 mb-4">
                Pilih grip sesuai kebutuhan kenyamanan Anda. Kami pasangkan dengan rapi dan presisi untuk performa maksimal.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                Biaya Jasa: {formatCurrency(GRIP_SERVICE_FEE)}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Based on Tab */}
        {activeTab === 'string' ? (
          <>
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
          </>
        ) : (
          <>
            {/* Grip Selection */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-bold">1</span>
                Pilih Jenis Grip
              </h3>
              <div className="space-y-3">
                {GRIPS.map(grip => (
                  <div 
                    key={grip.id}
                    onClick={() => setSelectedGripId(grip.id)}
                    className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer flex gap-4 ${
                      selectedGripId === grip.id ? 'border-purple-500 shadow-md bg-purple-50/50' : 'border-transparent shadow-sm'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      <img src={grip.image} alt={grip.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-slate-800">{grip.name}</h4>
                        {selectedGripId === grip.id && <CheckCircle2 size={18} className="text-purple-600" />}
                      </div>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">{grip.description}</p>
                      <div className="text-sm font-bold text-purple-600">{formatCurrency(grip.price)}</div>
                    </div>
                  </div>
                ))}
                {GRIPS.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Belum ada pilihan grip yang tersedia.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-0.5">Total Biaya</div>
            <div className="text-lg font-bold text-blue-600">{formatCurrency(totalPrice)}</div>
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={isButtonDisabled}
            className={`text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-lg ${
              isButtonDisabled ? 'bg-gray-300 cursor-not-allowed shadow-none' : activeTab === 'string' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/30'
            }`}
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
            <p className="text-sm text-gray-500 mb-6">
              Layanan {activeTab === 'string' ? 'pasang senar' : 'pasang grip'} telah ditambahkan ke keranjang.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
