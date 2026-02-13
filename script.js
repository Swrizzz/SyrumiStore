async function prosesBayar(nominal, layanan, target) {
    // Tampilkan loading (opsional, biar keren)
    console.log("Memproses pesanan...");

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nominal: nominal,
                service: layanan,
                target: target
            })
        });

        const data = await response.json();

        if (data.success) {
            // Jika berhasil, arahkan user ke link pembayaran atau tampilkan QRIS
            // PayDisini biasanya mengembalikan link di data.data.checkout_url
            alert("Pesanan Dibuat! Silakan bayar melalui QRIS yang muncul.");
            window.location.href = data.data.checkout_url; 
        } else {
            alert("Gagal membuat pesanan: " + data.msg);
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan koneksi.");
    }
}

// Contoh cara panggil fungsi ini dari tombol di HTML:
// <button onclick="prosesBayar(10000, 'Mobile Legends', '12345678(1234)')">Bayar</button>
