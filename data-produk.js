const hargaKonstanta = {
    tiktokFollowers: 50,
    tiktokLikes: 10,
    igFollowers: 50
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
    ppob: [{ id: 'pulsa', name: 'Pulsa & Data', icon: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png', label: 'NOMOR HP' }],
    sosmed_apps: {
        tiktok: [
            { id: 'tk_fol', name: 'TikTok Followers', label: 'USERNAME TIKTOK', note: 'Maks 3x24 Jam', pattern: 'tiktok|tt.com' },
            { id: 'tk_view', name: 'TikTok Viewers', label: 'LINK VIDEO', note: 'Maks 3x24 Jam', pattern: 'tiktok|tt.com' },
            { id: 'tk_like', name: 'TikTok Likes', label: 'LINK VIDEO', note: 'Maks 3x24 Jam', pattern: 'tiktok|tt.com' }
        ],
        instagram: [
            { id: 'ig_fol_indo', name: 'Followers Indonesia', label: 'USERNAME INSTAGRAM', note: 'Proses Cepat', pattern: 'instagram|ig.me' },
            { id: 'ig_fol_mix', name: 'Followers Acak/Asing', label: 'USERNAME INSTAGRAM', note: 'Harga Ekonomis', pattern: 'instagram|ig.me' },
            { id: 'ig_like', name: 'Instagram Likes', label: 'LINK POSTINGAN', pattern: 'instagram|ig.me' },
            { id: 'ig_view', name: 'Instagram Viewers', label: 'LINK REELS/VIDEO', pattern: 'instagram|ig.me' }
        ],
        shopee: [
            { id: 'shp_fol', name: 'Shopee Followers', label: 'LINK TOKO', pattern: 'shopee' }
        ]
    }
};

const pricelist = {
    ml: [
        { item: 'Weekly Diamond Pass', harga: 'Rp28.000', isPremium: true },
        { item: 'Weekly Elite Bundle', harga: 'Rp15.000', isPremium: true },
        { item: 'Monthly Epic Bundle', harga: 'Rp75.000', isPremium: true },
        { item: '5 Diamonds', harga: 'Rp1.500' },
        { item: '12 Diamonds', harga: 'Rp3.500' },
        { item: '19 Diamonds', harga: 'Rp5.500' },
        { item: '28 Diamonds', harga: 'Rp8.000' },
        { item: '44 Diamonds', harga: 'Rp12.000' },
        { item: '59 Diamonds', harga: 'Rp16.000' },
        { item: '85 Diamonds', harga: 'Rp23.000' },
        { item: '170 Diamonds', harga: 'Rp46.000' },
        { item: '240 Diamonds', harga: 'Rp65.000' },
        { item: '296 Diamonds', harga: 'Rp80.000' },
        { item: '408 Diamonds', harga: 'Rp110.000' },
        { item: '568 Diamonds', harga: 'Rp150.000' },
        { item: '875 Diamonds', harga: 'Rp230.000' },
        { item: '2010 Diamonds', harga: 'Rp500.000', isPremium: true },
        { item: '4830 Diamonds', harga: 'Rp1.200.000', isPremium: true }
    ],
    ff: [
        { item: 'Membership Mingguan', harga: 'Rp29.000', isPremium: true },
        { item: 'Membership Bulanan', harga: 'Rp86.000', isPremium: true },
        { item: '5 Diamonds', harga: 'Rp1.000' },
        { item: '12 Diamonds', harga: 'Rp1.900' },
        { item: '50 Diamonds', harga: 'Rp7.000' },
        { item: '70 Diamonds', harga: 'Rp10.000' },
        { item: '140 Diamonds', harga: 'Rp19.000' },
        { item: '355 Diamonds', harga: 'Rp47.000' },
        { item: '720 Diamonds', harga: 'Rp95.000' },
        { item: '1440 Diamonds', harga: 'Rp188.000' },
        { item: '7290 Diamonds', harga: 'Rp945.000' }
    ],
    tk_fol: [
        { item: '100 Followers', harga: 'Rp5.000' },
        { item: '500 Followers', harga: 'Rp20.000' },
        { item: '1000 Followers', harga: 'Rp38.000' }
    ],
    ig_fol_indo: [
        { item: '100 Fol Indo', harga: 'Rp10.000' },
        { item: '500 Fol Indo', harga: 'Rp45.000' }
    ],
    ig_fol_mix: [
        { item: '100 Fol Asing', harga: 'Rp4.000' },
        { item: '1000 Fol Asing', harga: 'Rp28.000' }
    ],
    pulsa: {
        telkomsel: [
            { item: 'Pulsa 2.000', harga: 'Rp4.200' },
            { item: 'Pulsa 5.000', harga: 'Rp6.400', label: 'Hemat' },
            { item: 'Pulsa 10.000', harga: 'Rp11.400', label: 'Terlaris' },
            { item: 'Pulsa 20.000', harga: 'Rp21.000' },
            { item: 'Pulsa 50.000', harga: 'Rp51.200' },
            { item: 'Pulsa 100.000', harga: 'Rp98.500', label: '👑 Premium Price' },
            { item: 'Pulsa 200.000', harga: 'Rp194.800', label: '👑 Premium Price' },
            { item: 'Pulsa 300.000', harga: 'Rp292.000', label: 'Super Murah' }
        ],
        indosat: [
            { item: 'Pulsa 5.000', harga: 'Rp7.800' },
            { item: 'Pulsa 10.000', harga: 'Rp12.600', label: 'Populer' },
            { item: 'Pulsa 12.000', harga: 'Rp15.000' },
            { item: 'Pulsa 15.000', harga: 'Rp17.200' },
            { item: 'Pulsa 20.000', harga: 'Rp22.100' },
            { item: 'Pulsa 25.000', harga: 'Rp27.100' },
            { item: 'Pulsa 50.000', harga: 'Rp51.000', label: 'Best Deal' },
            { item: 'Pulsa 100.000', harga: 'Rp102.000' },
            { item: 'Pulsa 200.000', harga: 'Rp199.000', label: '👑 Premium Price' }
        ],
        xl_axis: [
            { item: 'Pulsa 5.000', harga: 'Rp7.200' },
            { item: 'Pulsa 10.000', harga: 'Rp12.100', label: 'Terlaris' },
            { item: 'Pulsa 15.000', harga: 'Rp16.300' },
            { item: 'Pulsa 25.000', harga: 'Rp26.200' },
            { item: 'Pulsa 50.000', harga: 'Rp51.750', label: 'Hemat' },
            { item: 'Pulsa 100.000', harga: 'Rp101.000' },
            { item: 'Pulsa 200.000', harga: 'Rp201.000' }
        ],
        three: [
            { item: 'Pulsa 5.000', harga: 'Rp7.850' },
            { item: 'Pulsa 10.000', harga: 'Rp12.850', label: 'Populer' },
            { item: 'Pulsa 20.000', harga: 'Rp21.750' },
            { item: 'Pulsa 30.000', harga: 'Rp30.700' },
            { item: 'Pulsa 50.000', harga: 'Rp51.400' },
            { item: 'Pulsa 100.000', harga: 'Rp101.400', label: 'Best Value' }
        ],
        smartfren: [
            { item: 'Pulsa 5.000', harga: 'Rp6.300', label: 'Super Murah' },
            { item: 'Pulsa 10.000', harga: 'Rp11.200', label: 'Populer' },
            { item: 'Pulsa 20.000', harga: 'Rp21.200' },
            { item: 'Pulsa 50.000', harga: 'Rp51.200' },
            { item: 'Pulsa 100.000', harga: 'Rp100.500', label: '👑 Premium Price' }
        ]
    }
};
