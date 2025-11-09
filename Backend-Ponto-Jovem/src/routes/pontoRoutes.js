import express from "express";
import multer from "multer";
import {
  registrarEntrada,
  registrarSaida,
  listarPontos,
  uploadJustificativa,
  gerarRelatorio,
} from "../controllers/pontoController.js";

const router = express.Router();
const upload = multer({ dest: "src/uploads/" });


router.post("/entrada", registrarEntrada);
router.post("/saida", registrarSaida);
router.get("/:id_usuario", listarPontos);
router.post("/upload-justificativa", upload.single("file"), uploadJustificativa);


router.post("/relatorio", gerarRelatorio);

export default router;
