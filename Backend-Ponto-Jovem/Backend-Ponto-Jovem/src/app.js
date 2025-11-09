import express from "express";
import cors from "cors";
import routesUser from "./routes/routesUser.js";
import pontoRoutes from "./routes/pontoRoutes.js";
import passwordRoutes from "./routes/passwordRoutes.js";

const app = express();


app.use(cors());
app.use(express.json());


app.use("/bk-mobile", routesUser);
app.use("/bk-mobile", passwordRoutes);
app.use("/bk-mobile/ponto", pontoRoutes);

export default app;
