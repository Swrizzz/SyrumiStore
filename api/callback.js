const axios = require('axios');

export default async function handler(req, res) {
  // PayDisini mengirim data via POST saat pembayaran sukses
  const { key, unique_code, status } = req.body;

  // Pastikan sinyal ini beneran dari PayDisini
  if (status === 'Success') {
    try {
      // PROSES OTOMATIS: Tembak ke API VIP Reseller
      const orderKeVip = await axios.post('https://vip-reseller.co.id/api/game-feature', new URLSearchParams({
        key: process.env.VIP_KEY, // Secret dari VIP Reseller
        sign: process.env.VIP_SIGN,
        type: 'order',
        service: 'ID_LAYANAN', // Nanti ini dibuat dinamis
        data_no: 'ID_PLAYER_TARGET' 
      }));

      return res.status(200).send('OK'); // Beritahu PayDisini kalau laporan diterima
    } catch (err) {
      return res.status(500).send('Gagal ke VIP');
    }
  }
  res.status(400).send('Invalid Status');
}
