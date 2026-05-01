<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteService
{
    private string $token;
    private string $baseUrl;
    private bool   $isLocal;

    public function __construct()
    {
        $this->token   = config('services.fonnte.token', '');
        $this->baseUrl = config('services.fonnte.url', 'https://api.fonnte.com/send');
        // Di lokal (Windows dev), SSL CA bundle sering tidak tersedia
        $this->isLocal = app()->environment('local');
    }

    /**
     * Kirim pesan WhatsApp via Fonnte API.
     *
     * @param  string  $phone    Nomor tujuan (semua format diterima: 08x / +62x / 62x)
     * @param  string  $message  Isi pesan (mendukung emoji & newline)
     * @return bool
     */
    public function send(string $phone, string $message): bool
    {
        if (empty($this->token)) {
            Log::warning('[Fonnte] Token tidak dikonfigurasi — pesan tidak dikirim.', compact('phone'));
            return false;
        }

        $normalized = $this->normalizePhone($phone);

        if (empty($normalized)) {
            Log::warning('[Fonnte] Nomor tidak valid, pesan dibatalkan.', [
                'phone_raw' => $phone,
            ]);
            return false;
        }

        Log::debug('[Fonnte] Mencoba kirim WA.', [
            'phone_raw'  => $phone,
            'phone_norm' => $normalized,
            'url'        => $this->baseUrl,
        ]);

        try {
            $pending = Http::timeout(20)
                ->withHeaders(['Authorization' => $this->token]);

            // Di lokal Windows sering gagal SSL verify karena CA bundle tidak lengkap
            if ($this->isLocal) {
                $pending = $pending->withoutVerifying();
            }

            $response = $pending
                ->asForm()
                ->post($this->baseUrl, [
                    'target'  => $normalized,
                    'message' => $message,
                    'delay'   => 1,
                ]);

            $body    = $response->json() ?? [];
            $rawBody = $response->body();

            // Fonnte bisa return: {"status":true}, {"status":"true"}, atau {"detail":"..."}
            $success = $this->isSuccess($response->status(), $body);

            if ($success) {
                Log::info('[Fonnte] Pesan terkirim ✓', [
                    'phone'  => $normalized,
                    'detail' => $body['detail'] ?? $rawBody,
                ]);
                return true;
            }

            Log::warning('[Fonnte] API mengembalikan status gagal.', [
                'phone'    => $normalized,
                'http'     => $response->status(),
                'body'     => $rawBody,
                'reason'   => $body['reason'] ?? $body['detail'] ?? '—',
            ]);

            return false;

        } catch (\Throwable $e) {
            Log::error('[Fonnte] Exception: ' . $e->getMessage(), [
                'phone' => $normalized,
                'class' => get_class($e),
            ]);
            return false;
        }
    }

    /**
     * Cek apakah response Fonnte sukses.
     * Fonnte format: {"status":true,"detail":"..."} atau {"status":false,"reason":"..."}
     */
    private function isSuccess(int $httpCode, array $body): bool
    {
        // HTTP gagal sama sekali
        if ($httpCode >= 500) return false;

        // Cek field 'status': bisa bool true, string "true", int 1
        if (array_key_exists('status', $body)) {
            $status = $body['status'];
            return filter_var($status, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) === true
                || $status === 1
                || $status === '1';
        }

        // Jika tidak ada field status tapi HTTP 200, anggap sukses
        return $httpCode === 200;
    }

    /**
     * Normalisasi semua format nomor HP Indonesia → format Fonnte (62xxxxxxxxxx)
     *
     * Contoh yang didukung:
     *   08123456789      → 628123456789
     *   +6281234567890   → 6281234567890
     *   6281234567890    → 6281234567890
     *   +62 812-3456-789 → 628123456789
     *   62812 3456 789   → 6281234567890
     */
    public function normalizePhone(string $phone): string
    {
        // 1. Strip semua karakter bukan digit
        $digits = preg_replace('/\D/', '', $phone);

        if (empty($digits)) return '';

        // 2. Handle awalan 0 (format lokal Indonesia)
        if (str_starts_with($digits, '0')) {
            $digits = '62' . substr($digits, 1);
        }

        // 3. Jika masih dimulai angka lain (misal 8xx tanpa country code)
        //    → tambahkan 62 di depan
        if (!str_starts_with($digits, '62')) {
            if (str_starts_with($digits, '8')) {
                $digits = '62' . $digits;
            }
        }

        // 4. Validasi panjang minimal (62 + 8 digit = 10)
        if (strlen($digits) < 10 || strlen($digits) > 15) {
            return '';
        }

        return $digits;
    }
}
