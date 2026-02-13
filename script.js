// Fungsi untuk menampilkan modal popup
function openModal() {
    const modal = document.getElementById('modalPay');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Fungsi untuk menutup modal popup
function closeModal() {
    const modal = document.getElementById('modalPay');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Fungsi utama untuk memproses pembayaran
async function prosesBayar(nominal, layanan, target) {
    // 1. Tampilkan loading/modal agar user tahu proses sedang berjalan
    openModal();
    console.log("Memproses pesanan untuk:", layanan, target);

    try {
        // 2. Kirim data ke backend (Vercel API)
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                nominal: nominal,
                service: layanan,
                target: target
            })
        });

        const data = await response.json();

        // 3. Logika pengecekan hasil dari API
        if (data.success) {
            // Jika sukses, arahkan ke halaman QRIS PayDisini
            // Biasanya link ada di data.data.checkout_url
            alert("Pesanan Dibuat! Kamu akan diarahkan ke halaman pembayaran.");
            window.location.href = data.data.checkout_url; 
        } else {
            // Jika gagal dari sisi API
            alert("Gagal membuat pesanan: " + (data.msg || "Pesan tidak diketahui"));
            closeModal();
        }

    } catch (error) {
        // Jika gagal karena koneksi atau error script
        console.error("Error Detail:", error);
        alert("Terjadi kesalahan koneksi ke server.");
        closeModal();
    }
}
