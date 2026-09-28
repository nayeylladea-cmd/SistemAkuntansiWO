let pelangganData = [];
let paketData = [];
let transaksiData = [];


document.addEventListener("DOMContentLoaded", () => {

    setDate();

    loadDashboard();
    loadPelanggan();
    loadPaket();
    loadTransaksi();
    loadPembayaran();

    setDefaultDate();

});


/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(number) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(number || 0);

}


/* =========================
   FORMAT TANGGAL
========================= */

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleDateString(
        "id-ID",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================
   CURRENT DATE
========================= */

function setDate() {

    const element =
        document.getElementById("currentDate");

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


/* =========================
   DEFAULT DATE
========================= */

function setDefaultDate() {

    const today =
        new Date().toISOString().split("T")[0];

    document.getElementById(
        "tanggalTransaksi"
    ).value = today;

    document.getElementById(
        "tanggalBayar"
    ).value = today;

}


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".section")
        .forEach(section => {

            section.classList.remove("active");

        });


    document
        .getElementById(sectionId)
        .classList.add("active");


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const buttons =
        document.querySelectorAll(".nav-item");

    buttons.forEach(button => {

        if (
            button
                .getAttribute("onclick")
                .includes(sectionId)
        ) {

            button.classList.add("active");

        }

    });

}


/* =========================
   MODAL
========================= */

function openModal(id) {

    document
        .getElementById(id)
        .classList.add("show");

}


function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");

}


/* =========================
   DASHBOARD
========================= */

async function loadDashboard() {

    try {

        const response =
            await fetch("/api/dashboard");

        const data =
            await response.json();


        document.getElementById(
            "totalPendapatan"
        ).textContent =
            formatRupiah(data.totalPendapatan);


        document.getElementById(
            "totalPembayaran"
        ).textContent =
            formatRupiah(data.totalPembayaran);


        document.getElementById(
            "totalPiutang"
        ).textContent =
            formatRupiah(data.totalPiutang);


        document.getElementById(
            "jumlahPelanggan"
        ).textContent =
            data.jumlahPelanggan;


        let percentage = 0;


        if (data.totalPendapatan > 0) {

            percentage =
                (
                    data.totalPembayaran /
                    data.totalPendapatan
                ) * 100;

        }


        percentage =
            Math.min(percentage, 100);


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


/* =========================
   PELANGGAN
========================= */

async function loadPelanggan() {

    try {

        const response =
            await fetch("/api/pelanggan");

        pelangganData =
            await response.json();


        const table =
            document.getElementById(
                "pelangganTable"
            );


        table.innerHTML = "";


        pelangganData.forEach(item => {

            table.innerHTML += `

                <tr>

                    <td>#${item.id_pelanggan}</td>

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

        });


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


    select.innerHTML = `
        <option value="">
            Pilih pelanggan
        </option>
    `;


    pelangganData.forEach(item => {

        select.innerHTML += `

            <option value="${item.id_pelanggan}">
                ${item.nama_pelanggan}
            </option>

        `;

    });

}


/* =========================
   TAMBAH PELANGGAN
========================= */

document
    .getElementById("pelangganForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                            JSON.stringify(data)
                    }
                );


            if (!response.ok) {

                alert(
                    "Gagal menyimpan pelanggan."
                );

                return;

            }


            alert(
                "Pelanggan berhasil ditambahkan."
            );


            event.target.reset();

            closeModal("pelangganModal");

            loadPelanggan();
            loadDashboard();

        }
    );


/* =========================
   PAKET
========================= */

async function loadPaket() {

    try {

        const response =
            await fetch("/api/paket");

        paketData =
            await response.json();


        const container =
            document.getElementById(
                "paketContainer"
            );


        container.innerHTML = "";


        paketData.forEach(item => {

            container.innerHTML += `

                <div class="package-card">

                    <span class="eyebrow">
                        WEDDING PACKAGE
                    </span>

                    <h3>
                        ${item.nama_paket}
                    </h3>

                    <p>
                        ${item.deskripsi || "Tidak ada deskripsi."}
                    </p>

                    <div class="package-price">
                        ${formatRupiah(item.harga_paket)}
                    </div>

                </div>

            `;

        });


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


    select.innerHTML = `
        <option value="">
            Pilih paket
        </option>
    `;


    paketData.forEach(item => {

        select.innerHTML += `

            <option value="${item.id_paket}">
                ${item.nama_paket}
                -
                ${formatRupiah(item.harga_paket)}
            </option>

        `;

    });

}


/* =========================
   TAMBAH PAKET
========================= */

document
    .getElementById("paketForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                            JSON.stringify(data)
                    }
                );


            if (!response.ok) {

                alert(
                    "Gagal menyimpan paket."
                );

                return;

            }


            alert(
                "Paket berhasil ditambahkan."
            );


            event.target.reset();

            closeModal("paketModal");

            loadPaket();

        }
    );


/* =========================
   TRANSAKSI
========================= */

async function loadTransaksi() {

    try {

        const response =
            await fetch("/api/transaksi");

        transaksiData =
            await response.json();


        const table =
            document.getElementById(
                "transaksiTable"
            );


        table.innerHTML = "";


        transaksiData.forEach(item => {

            const statusClass =
                item.status_transaksi
                    .toLowerCase()
                    .includes("lunas")
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
                        ${item.pelanggan
                            ?.nama_pelanggan || "-"}
                    </td>

                    <td>
                        ${item.paket_wedding
                            ?.nama_paket || "-"}
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(
                                item.total_transaksi
                            )}
                        </strong>
                    </td>

                    <td>

                        <span
                            class="status ${statusClass}"
                        >
                            ${item.status_transaksi}
                        </span>

                    </td>

                </tr>

            `;

        });


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


    select.innerHTML = `
        <option value="">
            Pilih transaksi
        </option>
    `;


    transaksiData.forEach(item => {

        select.innerHTML += `

            <option value="${item.id_transaksi}">
                Transaksi #${item.id_transaksi}
                -
                ${item.pelanggan
                    ?.nama_pelanggan || ""}
            </option>

        `;

    });

}


/* =========================
   TAMBAH TRANSAKSI
========================= */

document
    .getElementById("transaksiForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                            JSON.stringify(data)
                    }
                );


            if (!response.ok) {

                alert(
                    "Gagal menyimpan transaksi."
                );

                return;

            }


            alert(
                "Transaksi berhasil ditambahkan."
            );


            event.target.reset();

            closeModal("transaksiModal");

            loadTransaksi();
            loadDashboard();

        }
    );


/* =========================
   PEMBAYARAN
========================= */

async function loadPembayaran() {

    try {

        const response =
            await fetch("/api/pembayaran");

        const data =
            await response.json();


        const table =
            document.getElementById(
                "pembayaranTable"
            );


        table.innerHTML = "";


        data.forEach(item => {

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
                        ${item
                            .transaksi_wedding
                            ?.pelanggan
                            ?.nama_pelanggan || "-"}
                    </td>

                    <td>
                        <strong>
                            ${formatRupiah(
                                item.jumlah_bayar
                            )}
                        </strong>
                    </td>

                    <td>
                        ${item.metode_bayar}
                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(
            "Pembayaran error:",
            error
        );

    }

}


/* =========================
   TAMBAH PEMBAYARAN
========================= */

document
    .getElementById("pembayaranForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


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
                            JSON.stringify(data)
                    }
                );


            if (!response.ok) {

                alert(
                    "Gagal menyimpan pembayaran."
                );

                return;

            }


            alert(
                "Pembayaran berhasil ditambahkan."
            );


            event.target.reset();

            closeModal("pembayaranModal");

            loadPembayaran();
            loadDashboard();

        }
    );