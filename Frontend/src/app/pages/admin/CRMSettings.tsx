import { useEffect, useState } from 'react';
import { Save, Award, Zap, Star, Trophy, Edit3, Check } from 'lucide-react';
import { fetchAdminCrmSettings, updateAdminCrmSettings, type CrmTierSetting } from '../../services/adminCrmApi';
import { toast } from 'sonner';

const TIER_ICONS = ['🏸', '⚡', '🎯', '🏆'];

const DEFAULT_TIERS: CrmTierSetting[] = [
  { name: 'Newbie', minPoints: 0, maxPoints: 999, color: '#64748B', icon: '🏸', discount: 0, perks: ['Free Shipping on 1st Order', 'Birthday Bonus'] },
  { name: 'Amateur', minPoints: 1000, maxPoints: 4999, color: '#10B981', icon: '⚡', discount: 5, perks: ['5% Discount', 'Priority Support', 'Early Access Sales'] },
  { name: 'Pro', minPoints: 5000, maxPoints: 11999, color: '#2563EB', icon: '🎯', discount: 10, perks: ['10% Discount', 'Free Shipping All Orders', 'VIP Events Access'] },
  { name: 'Champion', minPoints: 12000, maxPoints: null, color: '#F59E0B', icon: '🏆', discount: 15, perks: ['15% Discount', 'Free Stringing', 'Personal Coach Sessions', 'Exclusive Products'] },
];

export default function CRMSettings() {
  const [pointsPerIDR, setPointsPerIDR] = useState(1);
  const [bonusMultiplier, setBonusMultiplier] = useState(2);
  const [reviewBonus, setReviewBonus] = useState(50);
  const [firstOrderBonus, setFirstOrderBonus] = useState(100);
  const [editingTier, setEditingTier] = useState<number | null>(null);
  const [tierSettings, setTierSettings] = useState<CrmTierSetting[]>(DEFAULT_TIERS.map((t, i) => ({ ...t, icon: t.icon ?? TIER_ICONS[i] })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminCrmSettings();
        if (isMounted) {
          setPointsPerIDR(data.pointsPerIDR);
          setBonusMultiplier(data.bonusMultiplier);
          setReviewBonus(data.reviewBonus);
          setFirstOrderBonus(data.firstOrderBonus);
          setTierSettings(data.tiers.map((tier, i) => ({ ...tier, icon: tier.icon ?? TIER_ICONS[i] ?? '🏸' })));
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Gagal mengambil CRM settings.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        pointsPerIDR,
        bonusMultiplier,
        reviewBonus,
        firstOrderBonus,
        tiers: tierSettings.map((tier) => ({
          ...tier,
          maxPoints: tier.maxPoints,
        })),
      };

      const updated = await updateAdminCrmSettings(payload);
      setPointsPerIDR(updated.pointsPerIDR);
      setBonusMultiplier(updated.bonusMultiplier);
      setReviewBonus(updated.reviewBonus);
      setFirstOrderBonus(updated.firstOrderBonus);
      setTierSettings(updated.tiers.map((tier, i) => ({ ...tier, icon: tier.icon ?? TIER_ICONS[i] ?? '🏸' })));
      toast.success('CRM settings saved successfully!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan CRM settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: '#F1F5F9' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-xl" style={{ color: '#0F172A' }}>CRM Settings</h1>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Points & loyalty program configuration</p>
        </div>
        <button onClick={handleSave}
          disabled={saving || loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 2px 8px rgba(16,185,129,0.25)' }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save All'}
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-3 py-2 text-xs" style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          {error}
        </div>
      )}

      {/* Points Config */}
      <div className="rounded-2xl p-4 space-y-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} style={{ color: '#1D4ED8' }} />
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Points Configuration</h3>
        </div>

        {[
          { label: 'Points per Rp 10.000 spent', value: pointsPerIDR, setter: setPointsPerIDR, min: 1, max: 10, suffix: 'pts', desc: 'Standard earning rate on purchases' },
          { label: 'Weekend Bonus Multiplier', value: bonusMultiplier, setter: setBonusMultiplier, min: 1, max: 5, suffix: 'x', desc: 'Applied every Saturday & Sunday' },
          { label: 'Review Bonus Points', value: reviewBonus, setter: setReviewBonus, min: 0, max: 200, suffix: 'pts', desc: 'Awarded for each product review' },
          { label: 'First Order Bonus', value: firstOrderBonus, setter: setFirstOrderBonus, min: 0, max: 500, suffix: 'pts', desc: 'One-time welcome reward' },
        ].map(config => (
          <div key={config.label} className="rounded-xl p-3.5" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-medium" style={{ color: '#0F172A' }}>{config.label}</span>
              <span className="text-sm font-bold" style={{ color: '#1D4ED8' }}>{config.value} {config.suffix}</span>
            </div>
            <p className="text-[10px] mb-2.5" style={{ color: '#94A3B8' }}>{config.desc}</p>
            <input type="range" min={config.min} max={config.max} value={config.value}
              onChange={e => config.setter(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(to right, #1D4ED8 ${((config.value - config.min) / (config.max - config.min)) * 100}%, #E2E8F0 ${((config.value - config.min) / (config.max - config.min)) * 100}%)` }} />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: '#94A3B8' }}>
              <span>{config.min}</span><span>{config.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Management */}
      <div className="rounded-2xl p-4 space-y-3 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={16} style={{ color: '#F59E0B' }} />
          <h3 className="font-semibold" style={{ color: '#0F172A' }}>Loyalty Tiers</h3>
        </div>

        {tierSettings.map((tier, i) => (
          <div key={tier.name} className="rounded-xl overflow-hidden" style={{ background: '#F8FAFC', border: `1px solid ${tier.color}25` }}>
            <div className="flex items-center gap-3 p-3.5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${tier.color}12` }}>
                {tier.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm" style={{ color: '#0F172A' }}>{tier.name}</p>
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${tier.color}15`, color: tier.color }}>
                    {tier.discount}% OFF
                  </span>
                </div>
                <p className="text-xs" style={{ color: '#94A3B8' }}>
                  {tier.minPoints.toLocaleString()} — {tier.maxPoints == null ? '∞' : tier.maxPoints.toLocaleString()} pts
                </p>
              </div>
              <button onClick={() => setEditingTier(editingTier === i ? null : i)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: editingTier === i ? `${tier.color}20` : '#FFFFFF', border: '1px solid #E2E8F0' }}>
                {editingTier === i ? <Check size={14} style={{ color: tier.color }} /> : <Edit3 size={14} style={{ color: '#94A3B8' }} />}
              </button>
            </div>

            {editingTier === i && (
              <div className="px-3.5 pb-3.5 space-y-2.5 border-t" style={{ borderColor: `${tier.color}15` }}>
                <div className="grid grid-cols-2 gap-2 mt-2.5">
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: '#94A3B8' }}>Min Points</label>
                    <input type="number" value={tier.minPoints}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
                      onChange={e => {
                        const updated = [...tierSettings];
                        updated[i] = { ...updated[i], minPoints: Number(e.target.value) };
                        setTierSettings(updated);
                      }} />
                  </div>
                  <div>
                    <label className="text-[10px] mb-1 block" style={{ color: '#94A3B8' }}>Discount %</label>
                    <input type="number" value={tier.discount}
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs outline-none"
                      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', color: '#0F172A' }}
                      onChange={e => {
                        const updated = [...tierSettings];
                        updated[i] = { ...updated[i], discount: Number(e.target.value) };
                        setTierSettings(updated);
                      }} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] mb-1.5 block" style={{ color: '#94A3B8' }}>Perks</label>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.perks.map(p => (
                      <span key={p} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${tier.color}12`, color: tier.color }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-4 bg-white" style={{ border: '1px solid #E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#0F172A' }}>Current Program Summary</h3>
        <div className="space-y-2.5">
          {[
            { label: 'Standard earning', value: `${pointsPerIDR} pt per Rp 10.000`, icon: Star, color: '#0EA5E9' },
            { label: 'Weekend multiplier', value: `${bonusMultiplier}x bonus`, icon: Zap, color: '#F59E0B' },
            { label: 'Review reward', value: `${reviewBonus} pts`, icon: Star, color: '#10B981' },
            { label: 'First order bonus', value: `${firstOrderBonus} pts`, icon: Award, color: '#8B5CF6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
              <div className="flex items-center gap-2">
                <Icon size={13} style={{ color }} />
                <span className="text-xs" style={{ color: '#475569' }}>{label}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: '#0F172A' }}>{value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleSave}
          disabled={saving || loading}
          className="w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.25)' }}>
          <Save size={15} /> {saving ? 'Saving CRM Settings...' : 'Save CRM Settings'}
        </button>
      </div>
    </div>
  );
}
