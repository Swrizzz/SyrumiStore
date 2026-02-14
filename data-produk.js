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
        { id: 'instagram', name: 'Instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', isAppGroup: true }
    ],
    ppob: [{ id: 'pulsa', name: 'Pulsa & Data', icon: 'https://cdn-icons-png.flaticon.com/512/3059/3059502.png', label: 'NOMOR HP' }],
    sosmed_apps: {
        tiktok: [
            { id: 'tk_fol', name: 'TikTok Followers', label: 'USERNAME TIKTOK', isManual: true, unit: 'Fol' },
            { id: 'tk_like', name: 'TikTok Likes', label: 'LINK VIDEO', isManual: true, unit: 'Likes' }
        ],
        instagram: [
            { id: 'ig_fol', name: 'IG Followers', label: 'USERNAME INSTAGRAM', isManual: true, unit: 'Fol' }
        ]
    }
};

const pricelist = {
    ml: [
        { item: 'Weekly Diamond Pass', harga: 'Rp27.500' },
        { item: 'Twilight Pass', harga: 'Rp145.000' },
        { item: '5 Diamonds', harga: 'Rp1.560' },
        { item: '17 Diamonds', harga: 'Rp4.900' },
        { item: '28 Diamonds', harga: 'Rp8.000' },
        { item: '44 Diamonds', harga: 'Rp12.000' },
        { item: '59 Diamonds', harga: 'Rp16.000' },
        { item: '86 Diamonds', harga: 'Rp23.000' },
        { item: '172 Diamonds', harga: 'Rp46.000' },
        { item: '257 Diamonds', harga: 'Rp72.000' },
        { item: '706 Diamonds', harga: 'Rp185.000' },
        { item: '2195 Diamonds', harga: 'Rp545.000' },
        { item: '5532 Diamonds', harga: 'Rp1.350.000' },
        { item: '9288 Diamonds', harga: 'Rp2.300.000' }
    ],
    ff: [
        { item: '5 Diamonds', harga: 'Rp1.000' }
    ]
};
