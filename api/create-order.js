const axios = require('axios');

export default async function handler(req, res) {
  // Hanya izinkan metode POST (saat tombol beli diklik)
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Harus pakai POST' });
  }

  const { nominal, service, target } = req.body;

  try {
    // Meminta QRIS ke PayDisini
    const response = await axios.post('https://paydisini.co.id/api/', new URLSearchParams({
      key: process.env.PAYDISINI_KEY, // Diambil dari secret Vercel nanti
      request: 'new_order',
      unique_code: Math.floor(Math.random() * 100000), // Kode unik transaksi
      service: '11', // ID untuk QRIS Dinamis di PayDisini
      amount: nominal,
      note: `Topup ${service} ke ${target}`
    }));

    // Kirim balik data QRIS ke Frontend
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
