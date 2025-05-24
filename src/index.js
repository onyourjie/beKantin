const express = require("express");
const dotenv = require("dotenv");
const { PrismaClient } = require("./generated/prisma");
const cors = require("cors");

dotenv.config();
const prisma = new PrismaClient();
const app = express();

const PORT = process.env.PORT;

app.use(
    cors({
        origin: "http://192.168.1.20:3000",
    })
);
app.use(express.json());

//1
app.get("/products", async (req, res) => {
    try {
        const product = await prisma.produk.findMany({
            include: {
                pesananProduk: {
                    include: {
                        pesanan: true,
                    },
                },
            },
        });

        if (!product || product.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get("/products/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await prisma.produk.findUnique({
            where: {
                id: parseInt(productId),
            },
            include: {
                pesananProduk: {
                    include: {
                        pesanan: true,
                    },
                },
            },
        });

        if (!product || product.length === 0) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//2
app.post("/products", async (req, res) => {
    const { nama, harga, jenis, stock } = req.body;

    try {
        const products = await prisma.produk.create({
            data: {
                nama,
                harga,
                jenis,
                stock,
                penjualId: 1,
            },
        });

        res.json({ message: "Berhasil tambah produk", products });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//3
app.put("/products/:id", async (req, res) => {
    const productId = req.params.id;
    const { nama, harga, jenis, stock } = req.body;

    try {
        const product = await prisma.produk.update({
            where: { id: parseInt(productId) },
            data: {
                nama,
                harga,
                jenis,
                stock,
                penjualId: 1,
            },
        });

        res.json({ message: "Berhasil update produk", product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.delete("/products/:id", async (req, res) => {
    const productId = req.params.id;

    try {
        const product = await prisma.produk.delete({
            where: {
                id: parseInt(productId),
            },
        });

        res.json({ message: "Berhasil hapus produk", product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//6
app.post("/order", async (req, res) => {
    const { jumlahProduk, status, pembeliId, pesananProduk } = req.body;

    try {
        const product = await prisma.pesanan.create({
            data: {
                jumlahProduk,
                status,
                pembeliId,
                penjualId: 1,
                pesananProduk: {
                    create: pesananProduk.map((p) => ({
                        produk: { connect: { id: p.produkId } },
                    })),
                },
            },
        });

        res.json({ message: "Berhasil menambahkan pemesanan", product });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//7
app.get("/order", async (req, res) => {
    try {
        const order = await prisma.pesanan.findMany({
            where: {
                status: false,
            },
            include: {
                pesananProduk: {
                    include: {
                        produk: true,
                    },
                },
            },
        });

        if (!order || order.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//8
app.patch("/order/:id", async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    try {
        const order = await prisma.pesanan.update({
            where: {
                id: orderId,
            },
            data: {
                status,
            },
        });

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//9
app.get("/order/:userId", async (req, res) => {
    const userId = req.params.userId;
    try {
        const order = await prisma.pesanan.findFirst({
            where: {
                pembeliId: parseInt(userId),
                status: false,
            },
            include: {
                pesananProduk: {
                    include: {
                        produk: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});

// //1
// app.get("/products/:storeId", async (req, res) => {
//     const storeId = req.params.storeId;

//     try {
//         const product = await prisma.produk.findMany({
//             where: {
//                 penjualId: parseInt(storeId),
//             },
//             include: {
//                 pesananProduk: {
//                     include: {
//                         pesanan: true,
//                     },
//                 },
//             },
//         });

//         if (!product || product.length === 0) {
//             return res.status(404).json({ message: "Product not found" });
//         }
//         res.json(product);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// //2
// app.post("/products", async (req, res) => {
//     const newProduct = req.body;

//     try {
//         const products = await prisma.produk.create({
//             data: {
//                 nama: newProduct.nama,
//                 harga: newProduct.harga,
//                 jenis: newProduct.jenis,
//                 stock: newProduct.stock,
//                 penjualId: newProduct.penjualId,
//             },
//         });

//         res.send("berhasil");
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// //3
// app.put("/products/:id", async (req, res) => {
//     const productId = req.params.id;
//     const updatedProduct = req.body;

//     try {
//         const product = await prisma.produk.update({
//             where: { id: parseInt(productId) },
//             data: {
//                 nama: updatedProduct.nama,
//                 harga: updatedProduct.harga,
//                 jenis: updatedProduct.jenis,
//                 stock: updatedProduct.stock,
//                 penjualId: updatedProduct.penjualId,
//             },
//         });

//         res.json({ message: "Berhasil update produk", product });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// //4
// app.delete("/products/:id", async (req, res) => {
//     const productId = req.params.id;

//     try {
//         const product = await prisma.produk.delete({
//             where: {
//                 id: parseInt(productId),
//             },
//         });

//         res.json({ message: "Berhasil hapus produk", product });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });

// //5
// app.post("/order/:id", async (req, res) => {
//     const productId = req.params.id;
//     const newOrder = req.body;

//     const orderCreate = productIds.map((id) => ({
//         produk: { connect: { id } },
//     }));

//     try {
//         const product = await prisma.produk.create({
//             data: {
//                 jumlahProduk: newOrder.jumlahProduk,
//                 status: newOrder.status,
//                 pembeliId: newOrder.pembeliId,
//                 penjualId: newOrder.penjualId,
//                 pesananProduk: {
//                     create: [{ produk: { connect: { id: productId } } }],
//                 },
//             },
//         });

//         res.json({ message: "Berhasil hapus produk", product });
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// });
