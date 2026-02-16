let selectedProduct = "", selectedPrice = "", currentServiceId = "", requiredPattern = "";

// --- PENGATURAN MANUAL LAYANAN PULSA ---
// Ubah ke true jika ingin menutup pulsa secara manual (kapan saja)
// Ubah ke false untuk mengikuti jam operasional otomatis (04:00 - 22:00)
const isManualClose = false; 

// --- FUNGSI ALERT & MODAL ---
function kustomAlert(title, message, icon = "⚠️") {
    const iconEl = document.getElementById('alert-icon');
    const titleEl = document.getElementById('alert-title');
    const msgEl = document.getElementById('alert-message');
    const overlay = document.getElementById('alert-overlay');
    
    if(iconEl) iconEl.innerText = icon;
    if(titleEl) titleEl.innerText = title;
    if(msgEl) msgEl.innerText = message;
    if(overlay) overlay.style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }
function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }

function konfirmasiSaluran() {
    tutupTesti();
    kustomAlert("Dialihkan!", "Kamu akan diarahkan ke Saluran WhatsApp Syrumi Store.", "🚀");
    setTimeout(() => {
        window.location.href = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504";
    }, 2000);
}

// --- NAVIGASI SCREEN ---
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.style.display = 'none';
    });
    const target = document.getElementById(id);
    if(target) {
        target.style.display = 'block';
        setTimeout(() => { target.classList.add('active'); }, 10);
    }
    window.scrollTo(0, 0);
}

function goToLobby() { switchScreen('screen-lobby'); }
function backToKategori() { switchScreen('screen-kategori'); }
function tutupKonfirmasi() { document.getElementById('confirm-overlay').style.display = 'none'; }

// --- LOGIKA KATEGORI & PRODUK ---
function openKategori(cat) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = "";
    databaseLayanan[cat].forEach(item => {
        let func;
        if (item.comingSoon) {
            func = `kustomAlert('Segera Hadir', 'Layanan ${item.name} akan segera tersedia!', '⏳')`;
        } else if (item.isAppGroup) {
            func = `openSubSosmed('${item.id}')`;
        } else {
            func = `openOrder('${item.id}', '${item.name}', '${item.label}', false)`;
        }
        listDiv.innerHTML += `<div onclick="${func}" class="glass menu-item"><img src="${item.icon}"><span>${item.name}</span></div>`;
    });
    switchScreen('screen-kategori');
}

function openSubSosmed(appId) {
    const listDiv = document.getElementById('list-layanan');
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; margin-bottom:15px; padding:0 10px;">⚠️ Akun dilarang private!</p>`;
    
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `
            <div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.note || ""}', '${sub.pattern || ""}')" class="glass menu-item">
                <i class="fas fa-chevron-right" style="margin-right:15px; color:#ff85b3;"></i>
                <div style="display:flex; flex-direction:column; text-align:left;">
                    <span>${sub.name}</span>
                    ${sub.note ? `<small style="font-size:10px; color:#aaa;">${sub.note}</small>` : ''}
                </div>
            </div>`;
    });
}

function openOrder(id, name, label, isSosmed, extraNote = "", pattern = "") {
    currentServiceId = id; 
    requiredPattern = pattern;
    selectedProduct = ""; 
    selectedPrice = "";
    
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    
    const inputTujuan = document.getElementById('user-id');
    const inputZona = document.getElementById('zone-id');
    const grid = document.getElementById('grid-produk');
    const logoCont = document.getElementById('operator-logo-container');
    const kalkulatorCont = document.getElementById('kalkulator-sosmed-container');
    const btnOrder = document.querySelector('.btn-order');
    
    inputTujuan.value = "";
    inputZona.value = ""; 
    if(logoCont) logoCont.style.display = 'none';
    if(btnOrder) btnOrder.style.display = 'block';
    if(kalkulatorCont) {
        kalkulatorCont.style.display = 'none';
        kalkulatorCont.innerHTML = "";
    }

    inputTujuan.oninput = null;
    inputZona.oninput = null;

    if (id === 'ml') {
        inputTujuan.maxLength = 12;
        inputZona.maxLength = 5;
        inputTujuan.placeholder = "User ID";
        inputZona.placeholder = "Zona";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
        inputZona.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
    } else if (id === 'ff') {
        inputTujuan.maxLength = 12;
        inputTujuan.placeholder = "Player ID";
        inputTujuan.oninput = function() { this.value = this.value.replace(/[^0-9]/g, ''); };
    } else if (id === 'pulsa') {
        inputTujuan.maxLength = 15;
        inputTujuan.placeholder = "0812xxxx";
        inputTujuan.oninput = function() {
            this.value = this.value.replace(/[^0-9]/g, ''); 
            handleDeteksiOperator(this.value);
        };
    } else {
        inputTujuan.maxLength = 500;
        inputTujuan.placeholder = "Masukkan Link/Username";
    }
    
    inputZona.style.display = (id === 'ml') ? 'block' : 'none';
    grid.innerHTML = ""; 

    if (isSosmed) {
        grid.innerHTML = `<div style="background:rgba(255,133,179,0.1); border:1px solid #ff85b3; padding:10px; border-radius:12px; font-size:11px; margin-bottom:15px; color:#333; text-align:left;"><strong>INFO:</strong> Akun dilarang private. ${extraNote}</div>`;

        if (typeof hargaSatuan !== 'undefined' && hargaSatuan[id] && kalkulatorCont) {
            const data = hargaSatuan[id];
            kalkulatorCont.style.display = 'block';
            kalkulatorCont.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: flex-end;">
                    <div style="flex: 1.5; text-align: left;">
                        <label style="font-size: 10px; color: #ff85b3; font-weight: bold; margin-left: 5px;">JUMLAH BEBAS</label>
                        <input type="number" id="custom-qty" placeholder="Min: ${data.min}" 
                            style="width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ff85b3; background: #fff; margin-top: 5px; height:50px;"
                            oninput="hitungHargaOtomatis(this.value, '${id}')">
                    </div>
                    <div style="flex: 1; text-align: left;">
                        <label style="font-size: 10px; color: #ff85b3; font-weight: bold; margin-left: 5px;">HARGA</label>
                        <div id="display-harga-otomatis" 
                            style="height: 50px; background: #fff; border-radius: 12px; border: 1px solid #ff85b3; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #ff85b3; margin-top: 5px; font-size: 14px;">
                            Rp0
                        </div>
                    </div>
                </div>`;
        }
    }

    renderProducts(id);
    switchScreen('screen-order');
}

function handleDeteksiOperator(nomor) {
    const provider = deteksiOperator(nomor);
    const logoCont = document.getElementById('operator-logo-container');
    const logoImg = document.getElementById('operator-logo');
    const grid = document.getElementById('grid-produk');
    const btnOrder = document.querySelector('.btn-order');
    const daftarLogo = {
        "telkomsel": "images/telkomsel.jfif", 
        "indosat":   "images/indosat.jfif",
        "xl_axis":   "images/XL.jfif",
        "three":      "images/three.jfif",
        "smartfren": "images/smartfren.jfif",
        "byu":       "images/by-u.jfif"
    };

    if (provider) {
        const jam = new Date().getHours();
        // Logika Tutup: Manual AKTIF atau sedang Jam Cut Off (22-04)
        const isTutup = isManualClose || (jam >= 22 || jam < 4);

        if (isTutup) {
            logoCont.style.display = 'none';
            if(btnOrder) btnOrder.style.display = 'none';
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 25px 15px; border: 2px solid #ff85b3; border-radius: 20px; background: rgba(255,255,255,0.4);">
                    <p style="font-size: 35px; margin-bottom: 10px;">🕒</p>
                    <h3 style="color: #ff85b3; margin-bottom: 5px;">LAYANAN PULSA TUTUP</h3>
                    <p style="font-size: 12px; color: #444; line-height: 1.5;">
                        Mohon maaf, layanan pengisian pulsa hanya beroperasi pada pukul <b>04:00 - 22:00 WIB</b>.
                    </p>
                </div>`;
            return;
        }
        renderProductsPulsa(provider);
        logoImg.src = daftarLogo[provider]; 
        logoCont.style.display = 'block';
        if(btnOrder) btnOrder.style.display = 'block';
    } else {
        logoCont.style.display = 'none';
        grid.innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Menunggu operator...</p>";
    }
}

function deteksiOperator(nomor) {
    if (nomor.length < 4) return null;
    const prefix = nomor.slice(0, 4);
    if (/^0851$/.test(prefix)) return "byu"; 
    if (/^0811|0812|0813|0821|0822|0823|0852|0853$/.test(prefix)) return "telkomsel";
    if (/^0814|0815|0816|0855|0856|0857|0858$/.test(prefix)) return "indosat";
    if (/^0817|0818|0819|0859|0877|0878|0831|0832|0833|0838$/.test(prefix)) return "xl_axis";
    if (/^0895|0896|0897|0898|0899$/.test(prefix)) return "three";
    if (/^0881|0882|0883|0884|0885|0886|0887|0888|0889$/.test(prefix)) return "smartfren";
    return null;
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    const allData = { ...pricelistGame, ...pricelistSosmed };
    const data = allData[id];
    
    if(data) {
        data.forEach(p => {
            const labelHTML = (p.label || p.isPremium) ? `<span class="badge-premium">${p.label || '👑 HOT'}</span>` : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium ? 'premium' : ''}">
                    <span class="item-name" style="color:#000 !important;">${p.item} ${labelHTML}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function renderProductsPulsa(provider) {
    const grid = document.getElementById('grid-produk');
    grid.innerHTML = "";
    if(pricelistPPOB[provider]) {
        pricelistPPOB[provider].forEach(p => {
            const labelHTML = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card">
                    <span class="item-name" style="color:#000 !important;">${p.item} ${labelHTML}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function selectItem(item, harga, el) {
    const manualInput = document.getElementById('custom-qty');
    const displayManual = document.getElementById('display-harga-otomatis');
    
    if (manualInput) {
        manualInput.value = ""; 
        if (displayManual) displayManual.innerText = "Rp0";
    }

    selectedProduct = item; 
    selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function tampilkanKonfirmasi() {
    const jam = new Date().getHours();
    // Proteksi Tombol Pesan: Manual atau Jam Malam
    if (currentServiceId === 'pulsa' && (isManualClose || (jam >= 22 || jam < 4))) {
        return kustomAlert("LAYANAN TUTUP", "Mohon maaf, layanan pengisian pulsa hanya beroperasi pada pukul 04:00 - 22:00 WIB.", "🕒");
    }

    const val = document.getElementById('user-id').value.toLowerCase().trim();
    if (!val) return kustomAlert("Data Kosong", "Isi nomor/ID tujuan!", "❌");
    
    if (currentServiceId === 'pulsa' && val.length < 10) {
        return kustomAlert("Nomor Tidak Valid", "Nomor HP minimal harus 10 digit!", "📱");
    }

    if (!selectedProduct) return kustomAlert("Pilihan Kosong", "Pilih nominal paket!", "🛒");

    if (requiredPattern) {
        const keys = requiredPattern.split('|');
        const isValid = keys.some(k => val.includes(k));
        if (!isValid) return kustomAlert("Link Salah!", `Format salah. Harus mengandung: ${keys.join(' atau ')}`, "🚫");
    }
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    let val = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value;
    
    let isFollowers = false;
    for (let app in databaseLayanan.sosmed_apps) {
        let found = databaseLayanan.sosmed_apps[app].find(s => s.id === currentServiceId);
        if (found && found.isFollowers) {
            isFollowers = true;
            break;
        }
    }

    if (isFollowers && !val.includes('http')) {
        let username = val.replace('@', ''); 
        if (currentServiceId.includes('tk_')) {
            val = `https://www.tiktok.com/@${username}`;
        } else if (currentServiceId.includes('ig_')) {
            val = `https://www.instagram.com/${username}`;
        } else if (currentServiceId.includes('shp_')) {
            val = `https://shopee.co.id/${username}`;
        }
    }

    const tujuan = (currentServiceId === 'ml' && zone) ? `${val} (${zone})` : val;

    const textWA = 
`*ORDER SYRUMI STORE*

*Produk:* ${selectedProduct}
*Tujuan:* ${tujuan}
*Harga: ${selectedPrice}*

----------------------------
[ CARA PENYELESAIAN ]
1. Transfer sesuai total di atas.
2. Kirim Bukti Bayar di chat ini.
3. Pesanan akan segera Diproses.
----------------------------
[ METODE PEMBAYARAN ]
- DANA: 089507913948
- QRIS: https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504
----------------------------
[ CATATAN ADMIN ]
Mohon bersabar jika admin belum membalas karena proses 100% Manual. Pesanan diproses sesuai antrean ya!
----------------------------

_Silakan kirim bukti transfer agar segera diproses._`;

    const pesanEncoded = window.encodeURIComponent(textWA);
    window.location.href = `https://wa.me/6289507913948?text=${pesanEncoded}`;
}

function kirimTestiWA() {
    const t = document.getElementById('input-testi').value.trim();
    if(!t) return kustomAlert("Kosong", "Tulis testimoninya dulu!", "✍️");
    
    const pesanTesti = `*TESTIMONI SYRUMI STORE*%0A%0A"${t}"%0A%0A_Terima kasih sudah belanja di Syrumi Store!_`;
    window.location.href = `https://wa.me/6289507913948?text=${pesanTesti}`;
}

function hitungHargaOtomatis(qty, id) {
    const display = document.getElementById('display-harga-otomatis');
    const data = hargaSatuan[id];
    
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));

    if (!qty || qty <= 0) {
        display.innerText = "Rp0";
        selectedProduct = ""; 
        selectedPrice = "";
        return;
    }

    if (qty < data.min) {
        display.innerHTML = `<span style="color:#ff4d4d; font-size:10px;">Min: ${data.min.toLocaleString()}</span>`;
        selectedProduct = ""; 
        selectedPrice = "";
        return;
    } 
    
    if (qty > data.max) {
        display.innerHTML = `<span style="color:#ff4d4d; font-size:10px;">Limit!</span>`;
        selectedProduct = ""; 
        selectedPrice = "";
        return;
    }

    const total = Math.ceil(qty * data.price);
    const formattedTotal = new Intl.NumberFormat('id-ID').format(total);
    
    selectedProduct = `${qty} ${document.getElementById('order-title').innerText}`;
    selectedPrice = `Rp${formattedTotal}`;
    display.innerText = `Rp${formattedTotal}`;
}
