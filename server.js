// server.js
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// ===== Conexão MongoDB =====
const uri = "mongodb://admin:12345@ac-iz1ghur-shard-00-00.bpmyvbz.mongodb.net:27017,ac-iz1ghur-shard-00-01.bpmyvbz.mongodb.net:27017,ac-iz1ghur-shard-00-02.bpmyvbz.mongodb.net/Api?ssl=true&replicaSet=atlas-zcu8ak-shard-0&authSource=admin";
mongoose.connect(uri)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => console.error('Erro MongoDB:', err));

// ===== Schema =====
const itemSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  price: Number
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  value: Number,
  creationDate: Date,
  items: [itemSchema]
});

const Order = mongoose.model('Order', orderSchema);

// ===== Endpoints =====

// Criar um novo pedido (POST)
app.post('/order', async (req, res) => {
  try {
    const data = req.body;

    const order = await Order.findOneAndUpdate(
      { orderId: data.numeroPedido }, // procura pelo orderId
      {
        orderId: data.numeroPedido,
        value: data.valorTotal,
        creationDate: new Date(data.dataCriacao),
        items: data.items.map(item => ({
          productId: Number(item.idItem),
          quantity: item.quantidadeItem,
          price: item.valorItem
        }))
      },
      { new: true, upsert: true } // cria se não existir
    );

    res.status(201).json({ message: 'Pedido criado/atualizado com sucesso!', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Listar todos os pedidos (GET)
app.get('/order/list', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter pedido por número (GET)
app.get('/order/:numeroPedido', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.numeroPedido });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Atualizar pedido por número (PUT)
app.put('/order/:numeroPedido', async (req, res) => {
  try {
    const data = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: req.params.numeroPedido },
      {
        value: data.valorTotal,
        creationDate: new Date(data.dataCriacao),
        items: data.items.map(item => ({
          productId: Number(item.idItem),
          quantity: item.quantidadeItem,
          price: item.valorItem
        }))
      },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json({ message: 'Pedido atualizado!', order: updatedOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar pedido por número (DELETE)
app.delete('/order/:numeroPedido', async (req, res) => {
  try {
    const deletedOrder = await Order.findOneAndDelete({ orderId: req.params.numeroPedido });
    if (!deletedOrder) return res.status(404).json({ message: 'Pedido não encontrado' });
    res.json({ message: 'Pedido deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== Inicia servidor =====
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:3000`));