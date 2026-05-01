import { useEffect, useState, useCallback } from 'react';
import {
  Wrench, Plus, Edit2, Trash2, Search, Save, X,
  DollarSign, Package, AlertTriangle, Loader2, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchStringingServices,
  createStringingService,
  updateStringingService,
  deleteStringingService,
  updateStringingFee,
  type StringingService,
} from '../../services/stringingApi';

/* ─── Types ─────────────────────────────────────────────────────── */
type FormData = {
  name: string;
  price: string;
  stock: string;
  description: string;
  image: string;
};

const EMPTY_FORM: FormData = { name: '', price: '', stock: '', description: '', image: '' };

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

/* ─── Modal ──────────────────────────────────────────────────────── */
function ServiceModal({
  open, editing, saving,
  onClose, onSave,
}: {
  open: boolean;
  editing: StringingService | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: FormData) => void;
}) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              name: editing.name,
              price: String(editing.price),
              stock: String(editing.stock),
              description: editing.description,
              image: editing.image,
            }
          : EMPTY_FORM,
      );
    }
  }, [open, editing]);

  if (!open) return null;

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.stock || !form.description.trim()) {
      toast.error('Harap lengkapi semua field wajib.');
      return;
    }
    onSave(form);
  };

  const inputCls =
    'w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-colors bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100">
              <Wrench size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-800">
              {editing ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              className={inputCls}
              value={form.name}
              onChange={set('name')}
              placeholder="Jasa Pasang Senar + BG80 Power"
              required
            />
          </div>

          {/* Price & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min={0}
                value={form.price}
                onChange={set('price')}
                placeholder="155000"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                Stok <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                type="number"
                min={0}
                value={form.stock}
                onChange={set('stock')}
                placeholder="999"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.description}
              onChange={set('description')}
              placeholder="Layanan jasa pasang senar menggunakan mesin digital..."
              required
            />
          </div>

          {/* Image */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
              URL Gambar <span className="text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              className={inputCls}
              type="url"
              value={form.image}
              onChange={set('image')}
              placeholder="https://..."
            />
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="mt-2 h-20 w-full object-cover rounded-xl border border-slate-200"
                onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition"
              style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambahkan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Delete Confirm Modal ───────────────────────────────────────── */
function DeleteModal({
  service, onCancel, onConfirm, loading,
}: {
  service: StringingService | null;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  if (!service) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-50">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="font-bold text-slate-800 mb-1">Hapus Layanan?</h3>
        <p className="text-sm text-slate-500 mb-6">
          <span className="font-medium text-slate-700">{service.name}</span> akan dihapus secara permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 transition"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function StringingServiceManagement() {
  const [services, setServices] = useState<StringingService[]>([]);
  const [serviceFee, setServiceFee] = useState<number>(30000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StringingService | null>(null);
  const [savingModal, setSavingModal] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<StringingService | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fee edit
  const [editingFee, setEditingFee] = useState(false);
  const [tempFee, setTempFee] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  /* ── Load ─────────────────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStringingServices();
      setServices(res.data);
      setServiceFee(res.serviceFee);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  /* ── Fee ──────────────────────────────────────────────────── */
  const startEditFee = () => {
    setTempFee(String(serviceFee));
    setEditingFee(true);
  };

  const saveFee = async () => {
    const num = parseInt(tempFee, 10);
    if (isNaN(num) || num < 0) { toast.error('Biaya jasa tidak valid.'); return; }
    setSavingFee(true);
    try {
      const updated = await updateStringingFee(num);
      setServiceFee(updated);
      setEditingFee(false);
      toast.success('Biaya jasa berhasil diperbarui.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal memperbarui biaya jasa.');
    } finally {
      setSavingFee(false);
    }
  };

  /* ── Modal save ───────────────────────────────────────────── */
  const handleSave = async (form: FormData) => {
    setSavingModal(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: parseInt(form.price, 10),
        stock: parseInt(form.stock, 10),
        description: form.description.trim(),
        image: form.image.trim() || '',
      };

      if (editTarget) {
        const updated = await updateStringingService(editTarget.id, payload);
        setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success('Layanan berhasil diperbarui.');
      } else {
        const created = await createStringingService(payload);
        setServices(prev => [...prev, created]);
        toast.success('Layanan baru berhasil ditambahkan.');
      }
      setModalOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menyimpan layanan.');
    } finally {
      setSavingModal(false);
    }
  };

  /* ── Delete ───────────────────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStringingService(deleteTarget.id);
      setServices(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success('Layanan berhasil dihapus.');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Gagal menghapus layanan.');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase()),
  );

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Modals */}
      <ServiceModal
        open={modalOpen}
        editing={editTarget}
        saving={savingModal}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      <DeleteModal
        service={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <Wrench size={20} className="text-blue-600" /> Jasa Pasang Senar
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola layanan stringing dan biaya jasa</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition border border-slate-200 bg-white"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => { setEditTarget(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: 'linear-gradient(135deg, #1D4ED8, #2563EB)' }}
          >
            <Plus size={16} /> Tambah Layanan
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2 bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle size={15} /> {error}
          <button onClick={load} className="ml-auto text-xs underline">Coba lagi</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Service fee card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 col-span-1">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <DollarSign size={15} className="text-blue-500" /> Biaya Jasa Dasar
          </div>
          {editingFee ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={tempFee}
                onChange={e => setTempFee(e.target.value)}
                className="flex-1 border border-blue-400 rounded-lg px-3 py-1.5 text-slate-800 font-semibold text-sm outline-none focus:ring-2 focus:ring-blue-100"
                autoFocus
              />
              <button
                onClick={saveFee}
                disabled={savingFee}
                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                {savingFee ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              </button>
              <button
                onClick={() => setEditingFee(false)}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-slate-800">
                {loading ? '—' : formatCurrency(serviceFee)}
              </div>
              <button
                onClick={startEditFee}
                className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
              >
                <Edit2 size={15} />
              </button>
            </div>
          )}
          <p className="text-xs text-slate-400 mt-1">Per tarikan & pemasangan</p>
        </div>

        {/* Active services */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Package size={15} className="text-emerald-500" /> Jenis Senar Aktif
          </div>
          <div className="text-2xl font-bold text-slate-800">{loading ? '—' : `${services.length} Jenis`}</div>
          <p className="text-xs text-slate-400 mt-1">Total opsi senar tersedia</p>
        </div>

        {/* Total stock */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2">
            <Package size={15} className="text-amber-500" /> Total Stok
          </div>
          <div className="text-2xl font-bold text-slate-800">
            {loading ? '—' : services.reduce((a, s) => a + s.stock, 0).toLocaleString('id-ID')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Unit tersedia di semua jenis</p>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari layanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-slate-700"
            />
          </div>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} layanan</span>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Wrench size={36} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">
              {search ? 'Tidak ada layanan yang cocok.' : 'Belum ada layanan. Tambahkan layanan baru.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Layanan</th>
                  <th className="px-5 py-3.5">Harga Senar</th>
                  <th className="px-5 py-3.5">Total (+ Jasa)</th>
                  <th className="px-5 py-3.5">Stok</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(service => (
                  <tr key={service.id} className="hover:bg-slate-50/60 transition">
                    {/* Name + desc */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-100 shrink-0"
                          onError={e => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                        />
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{service.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{service.description}</p>
                        </div>
                      </div>
                    </td>

                    {/* String price */}
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {formatCurrency(service.price - serviceFee)}
                    </td>

                    {/* Total price */}
                    <td className="px-5 py-4">
                      <span className="font-semibold text-blue-600">{formatCurrency(service.price)}</span>
                      <span className="text-xs text-slate-400 ml-1">(termasuk jasa)</span>
                    </td>

                    {/* Stock badge */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          service.stock > 50
                            ? 'bg-emerald-50 text-emerald-700'
                            : service.stock > 0
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {service.stock > 0 ? `${service.stock} unit` : 'Habis'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditTarget(service); setModalOpen(true); }}
                          className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
