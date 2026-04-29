import React, { useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

interface StringingType {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  isActive: boolean;
}

export default function StringingServiceManagement() {
  const [services, setServices] = useState<StringingType[]>([
    { id: 'st001', name: 'BG80 Power', price: 125000, stock: 50, description: 'High-repulsion multifilament string', isActive: true },
    { id: 'st002', name: 'Nanogy 99', price: 165000, stock: 30, description: 'Ultra-thin string with exceptional control', isActive: true },
    { id: 'st003', name: 'BG65 Titanium', price: 105000, stock: 120, description: 'Durable and solid feeling', isActive: true },
  ]);
  
  const [baseFee, setBaseFee] = useState(30000);
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [tempBaseFee, setTempBaseFee] = useState(30000);

  const handleSaveBaseFee = () => {
    setBaseFee(tempBaseFee);
    setIsEditingBase(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="text-blue-600" /> Stringing Service Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Atur biaya jasa, jenis senar yang tersedia, dan harga senar.</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm font-medium text-slate-500 mb-2">Biaya Jasa Dasar (Tarikan & Pemasangan)</div>
          {isEditingBase ? (
            <div className="flex items-center gap-2 mt-2">
              <input 
                type="number" 
                value={tempBaseFee}
                onChange={(e) => setTempBaseFee(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 font-semibold w-full focus:outline-none focus:border-blue-500"
              />
              <button onClick={handleSaveBaseFee} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">Simpan</button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <div className="text-2xl font-bold text-slate-800">
                Rp {baseFee.toLocaleString('id-ID')}
              </div>
              <button onClick={() => setIsEditingBase(true)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded-md">
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm font-medium text-slate-500 mb-2">Total Opsi Senar Aktif</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{services.filter(s => s.isActive).length} Jenis</div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
          <button className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-6 py-3 rounded-xl transition w-full justify-center">
            <Plus size={20} /> Tambah Senar Baru
          </button>
        </div>
      </div>

      {/* List of Strings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari jenis senar..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition">
            <Filter size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Nama Senar</th>
                <th className="px-6 py-4">Harga</th>
                <th className="px-6 py-4">Stok</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-medium text-slate-600">{service.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{service.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{service.description}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">Rp {service.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${service.stock > 40 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {service.stock} pcs
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex w-max items-center gap-1.5 ${service.isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-blue-600' : 'bg-slate-400'}`}></span>
                      {service.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
