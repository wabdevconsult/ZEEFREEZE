// routes/clientRoutes.js
const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

// Vérifiez que toutes les méthodes du contrôleur existent
router.post("/", clientController.createClient);
router.get("/", clientController.getClients);
router.get("/:id", clientController.getClientById);
router.put("/:id", clientController.updateClient);
router.delete("/:id", clientController.deleteClient);

module.exports = router;