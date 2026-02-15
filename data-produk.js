const hargaSatuan = {
    tk_fol: { price: 65, min: 100, max: 1000000 },
    tk_like: { price: 22, min: 100, max: 5000000 },
    tk_view: { price: 1, min: 1000, max: 100000000 },
    ig_fol_indo: { price: 85, min: 100, max: 2000 },
    ig_fol_mix: { price: 60, min: 100, max: 10000000 },
    ig_like: { price: 20, min: 100, max: 5000 },
    ig_view: { price: 1, min: 1000, max: 2000000000 },
    shp_fol: { price: 75, min: 100, max: 2000 }
};

const databaseLayanan = {
    game: [
        { id: 'ml', name: 'Mobile Legends', icon: 'images/logo-ml.jfif', label: 'USER ID & ZONE' },
        { id: 'ff', name: 'Free Fire', icon: 'images/ff.jfif', label: 'PLAYER ID (UID)' }
    ],
    sosmed: [
        { id: 'tiktok', name: 'TikTok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', isAppGroup: true },
        { id: 'instagram', name: 'Instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', isAppGroup: true },
        { id: 'shopee', name: 'Shopee', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968600.png', isAppGroup: true },
        { id: 'youtube', name: 'YouTube', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', comingSoon: true },
        { id: 'facebook', name: 'Facebook', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png', comingSoon: true }
    ],
    ppob: [{ id: 'pulsa', name: 'Pulsa', icon: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png', label: 'NOMOR HP' }],
    sosmed_apps: {
        tiktok: [
            { id: 'tk_fol', name: 'TikTok Followers', label: 'USERNAME TIKTOK', isFollowers: true, note: 'Maks 3x24 Jam', pattern: '' },
            { id: 'tk_view', name: 'TikTok Viewers', label: 'LINK VIDEO', note: 'Maks 3x24 Jam', pattern: 'tiktok|tt.com' },
            { id: 'tk_like', name: 'TikTok Likes', label: 'LINK VIDEO', note: 'Maks 3x24 Jam', pattern: 'tiktok|tt.com' }
        ],
        instagram: [
            { id: 'ig_fol_indo', name: 'Followers Indonesia', label: 'USERNAME INSTAGRAM', isFollowers: true, note: 'Proses Cepat', pattern: '' },
            { id: 'ig_fol_mix', name: 'Followers Acak/Asing', label: 'USERNAME INSTAGRAM', isFollowers: true, note: 'Harga Ekonomis', pattern: '' },
            { id: 'ig_like', name: 'Instagram Likes', label: 'LINK POSTINGAN', pattern: 'instagram|ig.me' },
            { id: 'ig_view', name: 'Instagram Viewers', label: 'LINK REELS/VIDEO', pattern: 'instagram|ig.me' }
        ],
        shopee: [
            { id: 'shp_fol', name: 'Shopee Followers', label: 'LINK TOKO', isFollowers: true, pattern: '' }
        ]
    }
};
