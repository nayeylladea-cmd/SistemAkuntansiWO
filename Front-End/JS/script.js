let pelangganData = [];
let paketData = [];
let transaksiData = [];


// ============================================
// SAAT HALAMAN DIBUKA
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setDate();
        setDefaultDate();

        loadDashboard();
        loadPelanggan();
        loadPaket();
        loadTransaksi();
        loadPembayaran();

    }
);


// ============================================
// FORMAT RUPIAH
// ============================================

function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(number) || 0);

}


// ============================================
// FORMAT TANGGAL
// ============================================

function formatDate(date) {

    if (!date) {
        return "-";
    }


    return new Date(date).toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ============================================
// TANGGAL HARI INI
// ============================================

function setDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    element.textContent =
        new Date().toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


// ============================================
// DEFAULT DATE
// ============================================

function setDefaultDate() {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const tanggalTransaksi =
        document.getElementById(
            "tanggalTransaksi"
        );


    const tanggalBayar =
        document.getElementById(
            "tanggalBayar"
        );


    if (tanggalTransaksi) {
        tanggalTransaksi.value = today;
    }


    if (tanggalBayar) {
        tanggalBayar.value = today;
    }

}


// ============================================
// NAVIGATION
// ============================================

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const section =
        document.getElementById(
            sectionId
        );


    if (section) {

        section.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            const onclick =
                button.getAttribute(
                    "onclick"
                ) || "";


            if (
                onclick.includes(
                    `'${sectionId}'`
                )
            ) {

                button.classList.add(
                    "active"
                );

            }

        });

}


// ============================================
// MODAL
// ============================================

function openModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add("show");

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove("show");

    }

}


// ============================================
// DASHBOARD
// ============================================

async function loadDashboard() {

    try {

        const response =
            await fetch(
                "/api/dashboard"
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error ||
                "Gagal mengambil dashboard"
            );
        }


        document.getElementById(
            "totalPendapatan"
        ).textContent =
            formatRupiah(
                data.totalPendapatan
            );


        document.getElementById(
            "totalPembayaran"
        ).textContent =
            formatRupiah(
                data.totalPembayaran
            );


        document.getElementById(
            "totalPiutang"
        ).textContent =
            formatRupiah(
                data.totalPiutang
            );


        document.getElementById(
            "jumlahPelanggan"
        ).textContent =
            data.jumlahPelanggan;


        let percentage = 0;


        if (
            Number(data.totalPendapatan) > 0
        ) {

            percentage =
                (
                    Number(
                        data.totalPembayaran
                    ) /
                    Number(
                        data.totalPendapatan
                    )
                ) * 100;

        }


        percentage =
            Math.min(
                percentage,
                100
            );


        document.getElementById(
            "paymentPercentage"
        ).textContent =
            `${percentage.toFixed(1)}%`;


        document.getElementById(
            "paymentProgress"
        ).style.width =
            `${percentage}%`;


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


// ============================================
// PELANGGAN
// ============================================

async function loadPelanggan() {

    try {

        const response =
            await fetch(
                "/api/pelanggan"
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error
            );
        }


        pelangganData = data;


        const table =
            document.getElementById(
                "pelangganTable"
            );


        table.innerHTML = "";


        if (pelangganData.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5">
                        Belum ada data pelanggan.
                    </td>
                </tr>
            `;

        }


        pelangganData.forEach(
            item => {

                table.innerHTML += `
                    <tr>

                        <td>
                            #${item.id_pelanggan}
                        </td>

                        <td>
                            <strong>
                                ${item.nama_pelanggan}
                            </strong>
                        </td>

                        <td>
                            ${item.no_hp || "-"}
                        </td>

                        <td>
                            ${item.email || "-"}
                        </td>

                        <td>
                            ${item.alamat || "-"}
                        </td>

                    </tr>
                `;

            }
        );


        updatePelangganSelect();


    } catch (error) {

        console.error(
            "Pelanggan error:",
            error
        );

    }

}


function updatePelangganSelect() {

    const select =
        document.getElementById(
            "transaksiPelanggan"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Pilih pelanggan
        </option>
    `;


    pelangganData.forEach(
        item => {

            select.innerHTML += `
                <option
                    value="${item.id_pelanggan}"
                >
                    ${item.nama_pelanggan}
                </option>
            `;

        }
    );

}


// ============================================
// FORM PELANGGAN
// ============================================

document
    .getElementById(
        "pelangganForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                const data = {

                    nama_pelanggan:
                        document.getElementById(
                            "namaPelanggan"
                        ).value,

                    no_hp:
                        document.getElementById(
                            "noHp"
                        ).value,

                    email:
                        document.getElementById(
                            "email"
                        ).value,

                    alamat:
                        document.getElementById(
                            "alamat"
                        ).value

                };


                const response =
                    await fetch(
                        "/api/pelanggan",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Gagal menyimpan pelanggan"
                    );

                }


                alert(
                    "Pelanggan berhasil ditambahkan."
                );


                event.target.reset();

                closeModal(
                    "pelangganModal"
                );

                loadPelanggan();
                loadDashboard();


            } catch (error) {

                console.error(error);

                alert(
                    "Gagal menyimpan pelanggan:\n" +
                    error.message
                );

            }

        }
    );


// ============================================
// PAKET
// ============================================

async function loadPaket() {

    try {

        const response =
            await fetch(
                "/api/paket"
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error
            );
        }


        paketData = data;


        const container =
            document.getElementById(
                "paketContainer"
            );


        container.innerHTML = "";


        if (paketData.length === 0) {

            container.innerHTML = `
                <div class="card">
                    Belum ada paket wedding.
                </div>
            `;

        }


        paketData.forEach(
            item => {

                container.innerHTML += `

                    <div class="package-card">

                        <span class="eyebrow">
                            WEDDING PACKAGE
                        </span>

                        <h3>
                            ${item.nama_paket}
                        </h3>

                        <p>
                            ${
                                item.deskripsi ||
                                "Tidak ada deskripsi."
                            }
                        </p>

                        <div class="package-price">
                            ${
                                formatRupiah(
                                    item.harga_paket
                                )
                            }
                        </div>

                    </div>

                `;

            }
        );


        updatePaketSelect();


    } catch (error) {

        console.error(
            "Paket error:",
            error
        );

    }

}


function updatePaketSelect() {

    const select =
        document.getElementById(
            "transaksiPaket"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Pilih paket
        </option>
    `;


    paketData.forEach(
        item => {

            select.innerHTML += `

                <option
                    value="${item.id_paket}"
                >
                    ${item.nama_paket}
                    -
                    ${formatRupiah(
                        item.harga_paket
                    )}
                </option>

            `;

        }
    );

}


// ============================================
// FORM PAKET
// ============================================

document
    .getElementById(
        "paketForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                const data = {

                    nama_paket:
                        document.getElementById(
                            "namaPaket"
                        ).value,

                    deskripsi:
                        document.getElementById(
                            "deskripsiPaket"
                        ).value,

                    harga_paket:
                        Number(
                            document.getElementById(
                                "hargaPaket"
                            ).value
                        )

                };


                const response =
                    await fetch(
                        "/api/paket",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Gagal menyimpan paket"
                    );

                }


                alert(
                    "Paket berhasil ditambahkan."
                );


                event.target.reset();

                closeModal(
                    "paketModal"
                );

                loadPaket();


            } catch (error) {

                console.error(error);

                alert(
                    "Gagal menyimpan paket:\n" +
                    error.message
                );

            }

        }
    );


// ============================================
// TRANSAKSI
// ============================================

async function loadTransaksi() {

    try {

        const response =
            await fetch(
                "/api/transaksi"
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error
            );
        }


        transaksiData = data;


        const table =
            document.getElementById(
                "transaksiTable"
            );


        table.innerHTML = "";


        if (transaksiData.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        Belum ada transaksi.
                    </td>
                </tr>
            `;

        }


        transaksiData.forEach(
            item => {

                const status =
                    item.status_transaksi ||
                    "Belum Lunas";


                const statusClass =
                    status === "Lunas"
                        ? "lunas"
                        : "belum";


                table.innerHTML += `

                    <tr>

                        <td>
                            #${item.id_transaksi}
                        </td>

                        <td>
                            ${formatDate(
                                item.tanggal_transaksi
                            )}
                        </td>

                        <td>
                            ${
                                item.pelanggan
                                    ?.nama_pelanggan ||
                                "-"
                            }
                        </td>

                        <td>
                            ${
                                item.paket_wedding
                                    ?.nama_paket ||
                                "-"
                            }
                        </td>

                        <td>
                            <strong>
                                ${
                                    formatRupiah(
                                        item.total_transaksi
                                    )
                                }
                            </strong>
                        </td>

                        <td>

                            <span
                                class="status ${statusClass}"
                            >
                                ${status}
                            </span>

                        </td>

                    </tr>

                `;

            }
        );


        updateTransaksiSelect();


    } catch (error) {

        console.error(
            "Transaksi error:",
            error
        );

    }

}


function updateTransaksiSelect() {

    const select =
        document.getElementById(
            "pembayaranTransaksi"
        );


    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Pilih transaksi
        </option>
    `;


    transaksiData.forEach(
        item => {

            select.innerHTML += `

                <option
                    value="${item.id_transaksi}"
                >
                    Transaksi #${item.id_transaksi}
                    -
                    ${
                        item.pelanggan
                            ?.nama_pelanggan ||
                        ""
                    }
                </option>

            `;

        }
    );

}


// ============================================
// FORM TRANSAKSI
// ============================================

document
    .getElementById(
        "transaksiForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                const data = {

                    id_pelanggan:
                        Number(
                            document.getElementById(
                                "transaksiPelanggan"
                            ).value
                        ),

                    id_paket:
                        Number(
                            document.getElementById(
                                "transaksiPaket"
                            ).value
                        ),

                    tanggal_transaksi:
                        document.getElementById(
                            "tanggalTransaksi"
                        ).value,

                    total_transaksi:
                        Number(
                            document.getElementById(
                                "totalTransaksi"
                            ).value
                        ),

                    status_transaksi:
                        "Belum Lunas"

                };


                const response =
                    await fetch(
                        "/api/transaksi",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Gagal menyimpan transaksi"
                    );

                }


                alert(
                    "Transaksi berhasil ditambahkan."
                );


                event.target.reset();

                setDefaultDate();

                closeModal(
                    "transaksiModal"
                );

                loadTransaksi();
                loadDashboard();


            } catch (error) {

                console.error(error);

                alert(
                    "Gagal menyimpan transaksi:\n" +
                    error.message
                );

            }

        }
    );


// ============================================
// PEMBAYARAN
// ============================================

async function loadPembayaran() {

    try {

        const response =
            await fetch(
                "/api/pembayaran"
            );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error
            );
        }


        const table =
            document.getElementById(
                "pembayaranTable"
            );


        table.innerHTML = "";


        if (data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="6">
                        Belum ada pembayaran.
                    </td>
                </tr>
            `;

        }


        data.forEach(
            item => {

                table.innerHTML += `

                    <tr>

                        <td>
                            #${item.id_pembayaran}
                        </td>

                        <td>
                            ${formatDate(
                                item.tanggal_bayar
                            )}
                        </td>

                        <td>
                            #${item.id_transaksi}
                        </td>

                        <td>
                            ${
                                item
                                    .transaksi_wedding
                                    ?.pelanggan
                                    ?.nama_pelanggan ||
                                "-"
                            }
                        </td>

                        <td>
                            <strong>
                                ${
                                    formatRupiah(
                                        item.jumlah_bayar
                                    )
                                }
                            </strong>
                        </td>

                        <td>
                            ${item.metode_bayar}
                        </td>

                    </tr>

                `;

            }
        );


    } catch (error) {

        console.error(
            "Pembayaran error:",
            error
        );

    }

}


// ============================================
// FORM PEMBAYARAN
// ============================================

document
    .getElementById(
        "pembayaranForm"
    )
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                const data = {

                    id_transaksi:
                        Number(
                            document.getElementById(
                                "pembayaranTransaksi"
                            ).value
                        ),

                    tanggal_bayar:
                        document.getElementById(
                            "tanggalBayar"
                        ).value,

                    jumlah_bayar:
                        Number(
                            document.getElementById(
                                "jumlahBayar"
                            ).value
                        ),

                    metode_bayar:
                        document.getElementById(
                            "metodeBayar"
                        ).value,

                    keterangan:
                        document.getElementById(
                            "keterangan"
                        ).value

                };


                const response =
                    await fetch(
                        "/api/pembayaran",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    data
                                )
                        }
                    );


                const result =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Gagal menyimpan pembayaran"
                    );

                }


                alert(
                    "Pembayaran berhasil ditambahkan."
                );


                event.target.reset();

                setDefaultDate();

                closeModal(
                    "pembayaranModal"
                );

                loadPembayaran();
                loadDashboard();


            } catch (error) {

                console.error(error);

                alert(
                    "Gagal menyimpan pembayaran:\n" +
                    error.message
                );

            }

        }
    );