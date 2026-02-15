let selectedProduct = "", selectedPrice = "", currentServiceId = "", currentUnitName = "Pcs";

// --- FUNGSI ALERT & MODAL ---
function kustomAlert(title, message, icon = "⚠️") {
    document.getElementById('alert-icon').innerText = icon;
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-message').innerText = message;
    document.getElementById('alert-overlay').style.display = 'flex';
}

function tutupAlert() { document.getElementById('alert-overlay').style.display = 'none'; }

function bukaTesti() { document.getElementById('testi-overlay').style.display = 'flex'; }
function tutupTesti() { document.getElementById('testi-overlay').style.display = 'none'; }

function konfirmasiSaluran() {
    tutupTesti();
    kustomAlert("Dialihkan!", "Kamu akan diarahkan ke Saluran WhatsApp Syrumi Store untuk melihat testimoni lengkap.", "🚀");
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
    target.style.display = 'block';
    setTimeout(() => { target.classList.add('active'); }, 10);
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
            func = `kustomAlert('Segera Hadir', 'Layanan ${item.name} akan segera tersedia di Syrumi Store! Stay tuned.', '⏳')`;
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
    listDiv.innerHTML = `<p style="text-align:center; font-size:11px; color:#ff85b3; margin-bottom:15px; padding:0 10px;">⚠️ Pastikan akun TIDAK DI-PRIVATE. Kami tidak menerima komplain apabila akun diprivate saat proses.</p>`;
    
    databaseLayanan.sosmed_apps[appId].forEach(sub => {
        listDiv.innerHTML += `
            <div onclick="openOrder('${sub.id}', '${sub.name}', '${sub.label}', true, '${sub.note || ""}')" class="glass menu-item">
                <i class="fas fa-chevron-right" style="margin-right:15px; color:#ff85b3;"></i>
                <div style="display:flex; flex-direction:column; text-align:left;">
                    <span>${sub.name}</span>
                    ${sub.note ? `<small style="font-size:10px; color:#aaa;">${sub.note}</small>` : ''}
                </div>
            </div>`;
    });
}

function openOrder(id, name, label, isSosmed, extraNote = "") {
    currentServiceId = id; 
    selectedProduct = ""; 
    selectedPrice = "";
    
    document.getElementById('order-title').innerText = name;
    document.getElementById('label-input').innerText = label;
    
    const inputTujuan = document.getElementById('user-id');
    const inputZona = document.getElementById('zone-id');
    
    inputTujuan.value = "";
    inputZona.value = ""; 
    document.getElementById('operator-logo-container').style.display = 'none';

    if (id === 'pulsa' || id === 'ml' || id === 'ff') {
        inputTujuan.type = "tel"; 
        inputTujuan.oninput = function() {
            this.value = this.value.replace(/[^0-9]/g, ''); 
            if (currentServiceId === 'pulsa') handleDeteksiOperator(this.value);
        };
        inputTujuan.placeholder = "Masukkan angka...";
    } else {
        inputTujuan.type = "text"; 
        inputTujuan.oninput = null; 
        inputTujuan.placeholder = "Masukkan Link / Username...";
    }
    
    if (id === 'ml') {
        inputZona.style.display = 'block';
        inputZona.type = "tel"; 
        inputZona.oninput = function() {
            this.value = this.value.replace(/[^0-9]/g, '').slice(0, 5); 
        };
    } else {
        inputZona.style.display = 'none';
    }

    const grid = document.getElementById('grid-produk');
    grid.innerHTML = (id === 'pulsa') ? "<p style='text-align:center; padding:20px;'>Masukkan nomor...</p>" : "";
    
    // Tambah Peringatan Jika Sosmed
    if(isSosmed) {
        grid.innerHTML = `
            <div style="background:rgba(255,133,179,0.1); border:1px solid #ff85b3; padding:10px; border-radius:8px; font-size:11px; margin-bottom:15px; color:#eee; text-align:left;">
                <strong>INFO:</strong> Akun dilarang private. ${extraNote ? `Catatan: ${extraNote}` : ''}
            </div>
        `;
    }

    renderProducts(id);
    switchScreen('screen-order');
}

function handleDeteksiOperator(nomor) {
    const provider = deteksiOperator(nomor);
    const logoCont = document.getElementById('operator-logo-container');
    const logoImg = document.getElementById('operator-logo');
    const daftarLogo = {
        "telkomsel": "images/telkomsel.jfif", 
        "indosat":   "images/indosat.jfif",
        "xl_axis":   "images/XL.jfif",
        "three":      "images/three.jfif",
        "smartfren": "images/smartfren.jfif"
    };

    if (provider) {
        renderProductsPulsa(provider);
        logoImg.src = daftarLogo[provider]; 
        logoCont.style.display = 'block';
    } else {
        logoCont.style.display = 'none';
        document.getElementById('grid-produk').innerHTML = "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Menunggu operator...</p>";
    }
}

function deteksiOperator(nomor) {
    if (nomor.length < 4) return null;
    const prefix = nomor.slice(0, 4);
    if (/^0811|0812|0813|0821|0822|0823|0851|0852|0853$/.test(prefix)) return "telkomsel";
    if (/^0814|0815|0816|0855|0856|0857|0858$/.test(prefix)) return "indosat";
    if (/^0817|0818|0819|0859|0877|0878|0831|0832|0833|0838$/.test(prefix)) return "xl_axis";
    if (/^0895|0896|0897|0898|0899$/.test(prefix)) return "three";
    if (/^0881|0882|0883|0884|0885|0886|0887|0888|0889$/.test(prefix)) return "smartfren";
    return null;
}

function renderProducts(id) {
    const grid = document.getElementById('grid-produk');
    const data = pricelist[id];
    if(data) {
        data.forEach(p => {
            let labelText = p.label ? p.label : (p.isPremium ? "👑 HOT" : "");
            const labelHTML = labelText ? `<span class="badge-premium">${labelText}</span>` : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card ${p.isPremium ? 'premium' : ''}">
                    <span class="item-name">${p.item} ${labelHTML}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    } else if (id !== 'pulsa') {
        grid.innerHTML += "<p style='text-align:center; font-size:12px; color:#aaa; padding:20px;'>Paket segera hadir...</p>";
    }
}

function renderProductsPulsa(provider) {
    const grid = document.getElementById('grid-produk');
    if (pricelist.pulsa && pricelist.pulsa[provider]) {
        grid.innerHTML = "";
        pricelist.pulsa[provider].forEach(p => {
            const labelHTML = p.label ? `<span class="badge-premium">${p.label}</span>` : '';
            grid.innerHTML += `
                <div onclick="selectItem('${p.item}', '${p.harga}', this)" class="product-card">
                    <span class="item-name">${p.item} ${labelHTML}</span>
                    <span class="item-price">${p.harga}</span>
                </div>`;
        });
    }
}

function selectItem(item, harga, el) {
    selectedProduct = item; selectedPrice = harga;
    document.querySelectorAll('.product-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
}

function tampilkanKonfirmasi() {
    const val = document.getElementById('user-id').value.trim();
    if (currentServiceId === 'pulsa' && val.length < 10) return kustomAlert("Nomor Kurang", "Nomor HP minimal harus 10 angka!", "❌");
    if (!val) return kustomAlert("Data Kosong", "Isi nomor/ID tujuan!", "❌");
    if (!selectedProduct) return kustomAlert("Pilihan Kosong", "Pilih nominal dulu!", "🛒");
    document.getElementById('confirm-overlay').style.display = 'flex';
}

function prosesKeWA() {
    let val = document.getElementById('user-id').value.trim();
    const zone = document.getElementById('zone-id').value;
    const namaProdukFix = selectedProduct; 
    let tujuan = (currentServiceId === 'ml' && zone) ? `${val} (${zone})` : val;
    const linkTesti = "https://whatsapp.com/channel/0029VbB9bWGLNSa9K95BId3P/504"; 

    const instruksi = 
        `----------------------------\n` +
        `[ CARA PENYELESAIAN ]\n` +
        `1. Transfer sesuai total di atas.\n` +
        `2. Kirim Bukti Bayar di chat ini.\n` +
        `3. Pesanan akan segera Diproses.\n` +
        `----------------------------\n` +
        `[ METODE PEMBAYARAN ]\n` +
        `- DANA: 089507913948\n` +
        `- QRIS: ${linkTesti}\n` + 
        `----------------------------\n` +
        `[ CATATAN ADMIN ]\n` +
        `Mohon bersabar karena proses manual. Akun dilarang private!\n` +
        `----------------------------`;

    const pesan = window.encodeURIComponent(
        `*ORDER SYRUMI STORE*\n\n` +
        `*Produk:* ${namaProdukFix}\n` + 
        `*Tujuan:* ${tujuan}\n` +
        `*TOTAL TAGIHAN: ${selectedPrice}*\n\n` +
        `${instruksi}`
    );
    window.location.href = `https://wa.me/6289507913948?text=${pesan}`;
}

function kirimTestiWA() {
    const pesanTesti = document.getElementById('input-testi').value.trim();
    if (!pesanTesti) {
        tutupTesti(); 
        setTimeout(() => { kustomAlert("Eits!", "Tulis dulu testimoninya ya kak!", "✍️"); }, 300);
        return;
    }
    const formatPesan = window.encodeURIComponent(`*TESTIMONI SYRUMI STORE*\n\n"${pesanTesti}"`);
    window.location.href = `https://wa.me/6289507913948?text=${formatPesan}`;
}
