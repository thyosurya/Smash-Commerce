<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\FonnteService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Maksimum percobaan ulang jika gagal.
     */
    public int $tries = 3;

    /**
     * Jeda antar percobaan (detik).
     */
    public int $backoff = 60;

    public function __construct(
        private readonly string $orderId,
        private readonly string $status,
        private readonly string $phone,
        private readonly string $customerName,
    ) {}

    public function handle(FonnteService $fonnte): void
    {
        $order = Order::query()->with('items')->find($this->orderId);

        if (! $order) {
            Log::warning("[WA Bot] Order {$this->orderId} tidak ditemukan, job dibatalkan.");
            return;
        }

        $message = $this->buildMessage($order);

        if (empty($message)) {
            Log::info("[WA Bot] Status '{$this->status}' tidak punya template pesan, dilewati.");
            return;
        }

        $success = $fonnte->send($this->phone, $message);

        if (! $success) {
            // Release kembali ke antrian untuk retry
            $this->release($this->backoff);
        }
    }

    /**
     * Buat pesan WA sesuai status pesanan.
     */
    private function buildMessage(Order $order): string
    {
        $name        = $this->customerName;
        $orderId     = $order->id;
        $total       = 'Rp ' . number_format($order->total, 0, ',', '.');
        $tracking    = $order->tracking_number ?? '-';
        $method      = $order->shipping_method === 'pickup' ? '🏪 Ambil di Toko' : '🚚 Dikirim ke Alamat';
        $itemSummary = $order->items->map(fn($i) => "  • {$i->product_name} (x{$i->quantity})")->implode("\n");

        return match ($this->status) {

            'pending' => implode("\n", [
                "🛒 *Pesanan Diterima!*",
                "━━━━━━━━━━━━━━━━━━━━",
                "Halo *{$name}*! Terima kasih sudah berbelanja di *Smash Commerce* 🏸",
                "",
                "📦 *Order ID:* {$orderId}",
                "💳 *Total:* {$total}",
                "🚚 *Metode:* {$method}",
                "",
                "📋 *Produk:*",
                $itemSummary,
                "",
                "Pesanan kamu sedang menunggu konfirmasi dari tim kami.",
                "Kami akan segera memprosesnya! ⏳",
                "",
                "Terima kasih atas kepercayaan kamu 🙏",
                "_— Tim Smash Commerce_",
            ]),

            'processing' => implode("\n", [
                "⚙️ *Pesanan Sedang Diproses!*",
                "━━━━━━━━━━━━━━━━━━━━",
                "Halo *{$name}*! Kabar gembira nih 🎉",
                "",
                "📦 *Order ID:* {$orderId}",
                "💳 *Total:* {$total}",
                "",
                "Tim kami sedang mempersiapkan pesanan kamu dengan teliti.",
                "Estimasi proses: *1×24 jam kerja* ✅",
                "",
                "Nantikan update berikutnya ya!",
                "_— Tim Smash Commerce_",
            ]),

            'shipped' => implode("\n", [
                "🚀 *Pesanan Sudah Dikirim!*",
                "━━━━━━━━━━━━━━━━━━━━",
                "Halo *{$name}*! Pesananmu sudah dalam perjalanan! 📦",
                "",
                "📦 *Order ID:* {$orderId}",
                "🔖 *No. Resi:* {$tracking}",
                "🚚 *Metode:* Pengiriman Kurir",
                "",
                "Kamu bisa melacak paket menggunakan no. resi di atas.",
                "Estimasi tiba: *2–4 hari kerja* 🗓️",
                "",
                "Jika ada kendala, hubungi kami ya!",
                "_— Tim Smash Commerce_",
            ]),

            'delivered' => implode("\n", [
                "✅ *Pesanan Terkirim!*",
                "━━━━━━━━━━━━━━━━━━━━",
                "Halo *{$name}*! Paket kamu sudah tiba! 🎉",
                "",
                "📦 *Order ID:* {$orderId}",
                "💳 *Total:* {$total}",
                "",
                "Semoga produknya sesuai ekspektasi kamu ya! 😊",
                "Jangan lupa kasih *review* di aplikasi kami —",
                "setiap review dapat *+50 poin* reward lho! ⭐",
                "",
                "Sampai jumpa di pembelian berikutnya! 🏸",
                "_— Tim Smash Commerce_",
            ]),

            'cancelled' => implode("\n", [
                "❌ *Pesanan Dibatalkan*",
                "━━━━━━━━━━━━━━━━━━━━",
                "Halo *{$name}*, kami informasikan bahwa pesananmu telah dibatalkan.",
                "",
                "📦 *Order ID:* {$orderId}",
                "💳 *Total:* {$total}",
                "",
                "Jika pembatalan ini bukan permintaanmu atau ada pertanyaan,",
                "silakan hubungi tim kami segera.",
                "",
                "Kami mohon maaf atas ketidaknyamanannya 🙏",
                "Kamu bisa memesan kembali kapan saja!",
                "_— Tim Smash Commerce_",
            ]),

            // Status tidak dikenal — tidak kirim pesan
            default => '',
        };
    }
}
