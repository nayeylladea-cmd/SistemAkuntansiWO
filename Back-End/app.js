const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

/* =========================
   SUPABASE
========================= */

const SUPABASE_URL = "https://stjmekvxqwyagqlqvdlw.supabase.co";

const SUPABASE_KEY = "sb_publishable_GSPAteXt_qUlrkVddselrA_GKtONp5L";


/* =========================
   SUPABASE REQUEST
========================= */

async function supabaseRequest(endpoint, options = {}) {

    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/${endpoint}`,
        {
            ...options,

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation",

                ...(options.headers || {})
            }
        }
    );


    const text = await response.text();

    let data;

    try {

        data = text ? JSON.parse(text) : [];

    } catch {

        data = text;

    }


    if (!response.ok) {

        throw new Error(
            typeof data === "string"
                ? data
                : JSON.stringify(data)
        );

    }


    return data;

}


/* =========================
   SEND JSON
========================= */

function sendJSON(res, data, status = 200) {

    res.writeHead(status, {

        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"

    });


    res.end(
        JSON.stringify(data)
    );

}


/* =========================
   GET BODY
========================= */

function getBody(req) {

    return new Promise((resolve, reject) => {

        let body = "";


        req.on("data", chunk => {

            body += chunk;

        });


        req.on("end", () => {

            try {

                resolve(
                    body ? JSON.parse(body) : {}
                );

            } catch (error) {

                reject(error);

            }

        });


        req.on("error", reject);

    });

}


/* =========================
   API
========================= */

async function handleAPI(req, res) {

    try {


        /* =====================================================
           PELANGGAN
        ===================================================== */

        if (
            req.url === "/api/pelanggan" &&
            req.method === "GET"
        ) {

            const data = await supabaseRequest(
                "pelanggan?select=*&order=id_pelanggan.desc"
            );

            return sendJSON(res, data);

        }


        if (
            req.url === "/api/pelanggan" &&
            req.method === "POST"
        ) {

            const body = await getBody(req);

            const data = await supabaseRequest(
                "pelanggan",
                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );

            return sendJSON(res, data);

        }


        /* =====================================================
           PAKET WEDDING
        ===================================================== */

        if (
            req.url === "/api/paket" &&
            req.method === "GET"
        ) {

            const data = await supabaseRequest(
                "paket_wedding?select=*&order=id_paket.desc"
            );

            return sendJSON(res, data);

        }


        if (
            req.url === "/api/paket" &&
            req.method === "POST"
        ) {

            const body = await getBody(req);

            const data = await supabaseRequest(
                "paket_wedding",
                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );

            return sendJSON(res, data);

        }


        /* =====================================================
           TRANSAKSI
        ===================================================== */

        if (
            req.url === "/api/transaksi" &&
            req.method === "GET"
        ) {

            const data = await supabaseRequest(
                "transaksi_wedding?select=*,pelanggan(nama_pelanggan),paket_wedding(nama_paket)&order=id_transaksi.desc"
            );

            return sendJSON(res, data);

        }


        if (
            req.url === "/api/transaksi" &&
            req.method === "POST"
        ) {

            const body = await getBody(req);

            const data = await supabaseRequest(
                "transaksi_wedding",
                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );

            return sendJSON(res, data);

        }


        /* =====================================================
           PEMBAYARAN
        ===================================================== */

        if (
            req.url === "/api/pembayaran" &&
            req.method === "GET"
        ) {

            const data = await supabaseRequest(
                "pembayaran?select=*,transaksi_wedding(id_transaksi,pelanggan(nama_pelanggan))&order=id_pembayaran.desc"
            );

            return sendJSON(res, data);

        }


        if (
            req.url === "/api/pembayaran" &&
            req.method === "POST"
        ) {

            const body = await getBody(req);

            const data = await supabaseRequest(
                "pembayaran",
                {
                    method: "POST",
                    body: JSON.stringify(body)
                }
            );

            return sendJSON(res, data);

        }


        /* =====================================================
           DASHBOARD
        ===================================================== */

        if (
            req.url === "/api/dashboard" &&
            req.method === "GET"
        ) {

            const transaksi =
                await supabaseRequest(
                    "transaksi_wedding?select=total_transaksi"
                );


            const pembayaran =
                await supabaseRequest(
                    "pembayaran?select=jumlah_bayar"
                );


            const pelanggan =
                await supabaseRequest(
                    "pelanggan?select=id_pelanggan"
                );


            const totalPendapatan =
                transaksi.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.total_transaksi || 0
                        ),
                    0
                );


            const totalPembayaran =
                pembayaran.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.jumlah_bayar || 0
                        ),
                    0
                );


            const totalPiutang =
                totalPendapatan -
                totalPembayaran;


            return sendJSON(
                res,
                {
                    totalPendapatan,
                    totalPembayaran,
                    totalPiutang,
                    jumlahPelanggan:
                        pelanggan.length
                }
            );

        }


        /* =====================================================
           API TIDAK DITEMUKAN
        ===================================================== */

        return sendJSON(
            res,
            {
                error: "API tidak ditemukan"
            },
            404
        );


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        return sendJSON(
            res,
            {
                error: error.message
            },
            500
        );

    }

}


/* =========================================================
   STATIC FILE
========================================================= */

function serveFile(
    res,
    filePath,
    contentType
) {

    fs.readFile(
        filePath,
        (error, data) => {

            if (error) {

                console.error(
                    "FILE ERROR:",
                    filePath
                );


                res.writeHead(
                    404,
                    {
                        "Content-Type":
                            "text/plain"
                    }
                );


                res.end(
                    "File tidak ditemukan"
                );


                return;

            }


            res.writeHead(
                200,
                {
                    "Content-Type":
                        contentType
                }
            );


            res.end(data);

        }
    );

}


/* =========================================================
   SERVER
========================================================= */

const server =
    http.createServer(
        (req, res) => {


            /* =========================
               API
            ========================= */

            if (
                req.url.startsWith("/api/")
            ) {

                handleAPI(req, res);

                return;

            }


            /* =========================
               HTML
            ========================= */

            if (
                req.url === "/" ||
                req.url === "/index.html"
            ) {

                serveFile(
                    res,

                    path.join(
                        __dirname,
                        "../Front-End/HTML/index.html"
                    ),

                    "text/html"
                );

                return;

            }


            /* =========================
               CSS
            ========================= */

            if (
                req.url === "/style.css"
            ) {

                serveFile(
                    res,

                    path.join(
                        __dirname,
                        "../Front-End/CSS/style.css"
                    ),

                    "text/css"
                );

                return;

            }


            /* =========================
               JAVASCRIPT
            ========================= */

            if (
                req.url === "/script.js"
            ) {

                serveFile(
                    res,

                    path.join(
                        __dirname,
                        "../Front-End/JSS/script.js"
                    ),

                    "application/javascript"
                );

                return;

            }


            /* =========================
               404
            ========================= */

            res.writeHead(404);

            res.end(
                "404 - Halaman tidak ditemukan"
            );

        }
    );


/* =========================================================
   START SERVER
========================================================= */

server.listen(
    PORT,
    () => {

        console.log(
            `Server berjalan di http://localhost:${PORT}`
        );

    }
);