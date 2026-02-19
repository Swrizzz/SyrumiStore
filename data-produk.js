const hargaSatuan = {
    // TIKTOK
    tk_fol: { price: 60, min: 100, max: 10000, label: 'Username (Tanpa @)', isUser: true, urlPrefix: 'https://www.tiktok.com/@' }, 
    tk_like: { price: 10, min: 100, max: 5000, label: 'Link Video TikTok', pattern: 'tiktok.com|tt.com' }, 
    tk_view: { price: 0.67, min: 1000, max: 1000000, label: 'Link Video TikTok', pattern: 'tiktok.com|tt.com' },
    
    // INSTAGRAM
    ig_fol_indo: { price: 80, min: 100, max: 2000, label: 'Username IG', isUser: true, urlPrefix: 'https://www.instagram.com/' },
    ig_fol_mix: { price: 50, min: 100, max: 5000, label: 'Username IG', isUser: true, urlPrefix: 'https://www.instagram.com/' },
    ig_like: { price: 10, min: 100, max: 5000, label: 'Link Postingan IG', pattern: 'instagram.com' },
    ig_view: { price: 0.67, min: 1000, max: 1000000, label: 'Link Reels IG', pattern: 'instagram.com' },

    // SHOPEE
    shp_fol: { price: 70, min: 100, max: 2000, label: 'Username/Link Toko', isUser: true, urlPrefix: 'https://shopee.co.id/' }
};

const databaseLayanan = {
    game: [
        { id: 'ml', name: 'Mobile Legends', icon: 'images/logo-ml.jfif' },
        { id: 'ff', name: 'Free Fire', icon: 'images/ff.jfif' },
        { id: 'pubg', name: 'PUBG Mobile', icon: 'images/pubg.jfif' },
        { id: 'hi', name: 'Honor Of Kings', icon: 'images/hok.jfif' },
        { id: 'genshin', name: 'Genshin Impact', icon: 'images/genshin.png' }
    ],
    sosmed: [
        { id: 'tiktok', name: 'TikTok', icon: 'images/tt.jfif', isAppGroup: true },
        { id: 'instagram', name: 'Instagram', icon: 'images/ig.jfif', isAppGroup: true },
        { id: 'shopee', name: 'Shopee', icon: 'images/shopee.png', isAppGroup: true },
        { id: 'facebook', name: 'Facebook', icon: 'images/facebook.png', comingSoon: true },
        { id: 'youtube', name: 'YouTube', icon: 'images/yt.jfif', comingSoon: true }
    ],
    ppob: [
        { id: 'pulsa', name: 'Pulsa Reguler', icon: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png', label: 'NOMOR HP' },
        { id: 'sub_ewallet', name: 'E-Wallet', icon: 'images/wallet.jfif', label: 'PILIH DOMPET' },
        { id: 'pln', name: 'Token PLN', icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105155.png', label: 'NOMOR METER/ID PEL' }
    ],
    sosmed_apps: {
        tiktok: [
            { id: 'tk_fol', name: 'TikTok Followers', note: 'Max 3x24 Jam' },
            { id: 'tk_view', name: 'TikTok Viewers', note: 'Instant' },
            { id: 'tk_like', name: 'TikTok Likes', note: 'Instant' }
        ],
        instagram: [
            { id: 'ig_fol_mix', name: 'IG Followers Mix', note: 'Kualitas Mix' },
            { id: 'ig_fol_indo', name: 'IG Followers Indo', note: 'Real Indonesia' },
            { id: 'ig_like', name: 'Instagram Likes', note: 'Instant' },
            { id: 'ig_view', name: 'Instagram Views', note: 'Instant' }
        ],
        shopee: [
            { id: 'shp_fol', name: 'Shopee Followers', note: 'Meningkatkan Trust' }
        ]
    }
};
