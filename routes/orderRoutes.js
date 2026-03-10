const express = require("express");
const router = express.Router();
const Order = require("../models/Order");


// Criar pedido
router.post("/order", async (req, res) => {

  try {

    const body = req.body;

    // Mapping dos dados
    const orderMapped = {
      orderId: body.numeroPedido,
      value: body.valorTotal,
      creationDate: new Date(body.dataCriacao),
      items: body.items.map(item => ({
        productId: Number(item.idItem),
        quantity: item.quantidadeItem,
        price: item.valorItem
      }))
    };

    const order = new Order(orderMapped);

    await order.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({error: error.message});
  }

});


// Buscar pedido pelo número
router.get("/order/:id", async (req, res) => {

  try {

    const order = await Order.findOne({orderId: req.params.id});

    if(!order){
      return res.status(404).json({message:"Pedido não encontrado"});
    }

    res.json(order);

  } catch (error) {
    res.status(500).json({error: error.message});
  }

});


// Listar pedidos
router.get("/order/list", async (req, res) => {

  try {

    const orders = await Order.find();

    res.json(orders);

  } catch (error) {
    res.status(500).json({error: error.message});
  }

});


// Atualizar pedido
router.put("/order/:id", async (req, res) => {

  try {

    const body = req.body;

    const orderMapped = {
      value: body.valorTotal,
      creationDate: new Date(body.dataCriacao),
      items: body.items.map(item => ({
        productId: Number(item.idItem),
        quantity: item.quantidadeItem,
        price: item.valorItem
      }))
    };

    const order = await Order.findOneAndUpdate(
      {orderId: req.params.id},
      orderMapped,
      {new: true}
    );

    res.json(order);

  } catch (error) {
    res.status(500).json({error: error.message});
  }

});


// Deletar pedido
router.delete("/order/:id", async (req, res) => {

  try {

    await Order.deleteOne({orderId: req.params.id});

    res.json({message:"Pedido deletado com sucesso"});

  } catch (error) {
    res.status(500).json({error: error.message});
  }

});

module.exports = router;