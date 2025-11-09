import supabase from "../config/supabaseClient.js";
import fs from "fs";
import PDFDocument from "pdfkit";


if (typeof globalThis.fetch === "function") {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (url, init = {}) => {
    if (init && init.body && !init.duplex) init.duplex = "half";
    return originalFetch(url, init);
  };
}


function getLocalDateISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* ============================
   ⏱️ Helpers de tempo/agrupamento
   ============================ */
function parseHmsToMinutes(hms = "") {
  if (!hms) return 0;
  const [hh = "0", mm = "0", ss = "0"] = String(hms).split(":");
  return (+hh) * 60 + (+mm) + Math.floor((+ss) / 60);
}
function diffMinutes(entrada, saida) {
  const e = parseHmsToMinutes(entrada);
  const s = parseHmsToMinutes(saida);
  const d = s - e;
  return d > 0 ? d : 0;
}
function minutesToHHMM(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getISOWeekKey(yyyy_mm_dd) {

  const [y, m, d] = yyyy_mm_dd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));

  const dayNum = (date.getUTCDay() + 6) % 7;

  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const isoYear = date.getUTCFullYear();

  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const week = 1 + Math.round(((date - jan4) / 86400000 - 3 + jan4Day) / 7);
  return `${isoYear}-W${String(week).padStart(2, "0")}`;
}

function getCurrentMonthBoundsLocal() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const y1 = start.getFullYear(),
    m1 = String(start.getMonth() + 1).padStart(2, "0"),
    d1 = String(start.getDate()).padStart(2, "0");
  const y2 = end.getFullYear(),
    m2 = String(end.getMonth() + 1).padStart(2, "0"),
    d2 = String(end.getDate()).padStart(2, "0");
  return { startISO: `${y1}-${m1}-${d1}`, endISO: `${y2}-${m2}-${d2}` };
}

/* ============================
   📌 Registrar entrada
   ============================ */
export const registrarEntrada = async (req, res) => {
  try {
    const { id_usuario } = req.body;
    const dataAtual = getLocalDateISO();
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour12: false });

    const { data, error } = await supabase
      .from("tabela_ponto")
      .insert([{ id_usuario, data_registro: dataAtual, hora_entrada: horaAtual }]);

    if (error) throw error;
    return res.status(200).json({ success: true, message: "Entrada registrada.", data });
  } catch (error) {
    console.error("Erro registrarEntrada:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   📌 Registrar saída
   ============================ */
export const registrarSaida = async (req, res) => {
  try {
    const { id_usuario } = req.body;
    const dataAtual = getLocalDateISO();
    const horaAtual = new Date().toLocaleTimeString("pt-BR", { hour12: false });

    const { data, error } = await supabase
      .from("tabela_ponto")
      .update({ hora_saida: horaAtual })
      .eq("id_usuario", id_usuario)
      .eq("data_registro", dataAtual);

    if (error) throw error;
    return res.status(200).json({ success: true, message: "Saída registrada.", data });
  } catch (error) {
    console.error("Erro registrarSaida:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   📋 Listar pontos
   ============================ */
export const listarPontos = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { data, error } = await supabase
      .from("tabela_ponto")
      .select("*")
      .eq("id_usuario", id_usuario)
      .order("data_registro", { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro listarPontos:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   📤 Upload de justificativa
   ============================ */
export const uploadJustificativa = async (req, res) => {
  try {
    const { id_usuario, id_ponto, data_registro } = req.body;
    const file = req.file;

    if (!file)
      return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });

    const nomeArquivo = `${Date.now()}-${file.originalname}`;
    const caminhoSupabase = `${id_usuario}/${nomeArquivo}`;

    const { error: uploadError } = await supabase.storage
      .from("justificativas")
      .upload(caminhoSupabase, fs.createReadStream(file.path), {
        contentType: file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicURL } = supabase.storage
      .from("justificativas")
      .getPublicUrl(caminhoSupabase);


    let q = supabase
      .from("tabela_ponto")
      .update({ justificativa: publicURL.publicUrl })
      .eq("id_usuario", id_usuario);

    if (id_ponto) q = q.eq("id_ponto", id_ponto);
    else q = q.eq("data_registro", data_registro);

    const { error: updateError } = await q;
    if (updateError) throw updateError;

    try {
      fs.unlinkSync(file.path);
    } catch {}

    return res.status(200).json({
      success: true,
      message: "Arquivo enviado com sucesso.",
      url: publicURL.publicUrl,
    });
  } catch (error) {
    console.error("❌ Erro uploadJustificativa:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================
   🧾 Gerar relatório em PDF
   + totais por semana e mês vigente
   ============================ */
export const gerarRelatorio = async (req, res) => {
  try {
    const { id_usuario, data_inicio, data_fim, nome_usuario } = req.body;

    if (!id_usuario || !data_inicio || !data_fim) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios ausentes: id_usuario, data_inicio ou data_fim.",
      });
    }


    const { data: userData } = await supabase
      .from("tabela_usuario")
      .select("nome")
      .eq("id_usuario", id_usuario)
      .maybeSingle();

    const nomeUser = userData?.nome || nome_usuario || "Usuário";


    const { data, error } = await supabase
      .from("tabela_ponto")
      .select("*")
      .eq("id_usuario", id_usuario)
      .gte("data_registro", data_inicio)
      .lte("data_registro", data_fim)
      .order("data_registro", { ascending: true });

    if (error) throw error;
    if (!data?.length)
      return res.status(404).json({ success: false, message: "Nenhum ponto encontrado." });


    let totalPeriodoMin = 0;
    const porSemana = {};

    data.forEach((p) => {
      const mins = diffMinutes(p.hora_entrada, p.hora_saida);
      totalPeriodoMin += mins;
      const wk = getISOWeekKey(p.data_registro);
      porSemana[wk] = (porSemana[wk] || 0) + mins;
    });


    const { startISO, endISO } = getCurrentMonthBoundsLocal();
    let totalMesVigenteMin = 0;
    {
      const { data: dataMes, error: errMes } = await supabase
        .from("tabela_ponto")
        .select("data_registro,hora_entrada,hora_saida")
        .eq("id_usuario", id_usuario)
        .gte("data_registro", startISO)
        .lte("data_registro", endISO);
      if (!errMes && Array.isArray(dataMes)) {
        dataMes.forEach((p) => {
          totalMesVigenteMin += diffMinutes(p.hora_entrada, p.hora_saida);
        });
      }
    }

    const semanasOrdenadas = Object.keys(porSemana).sort();


    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const fileName = `relatorio_${id_usuario}_${Date.now()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("relatorios")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("relatorios")
        .getPublicUrl(fileName);

      return res.status(200).json({
        success: true,
        message: "Relatório gerado com sucesso.",
        url: publicUrlData.publicUrl,
      });
    });


    const formatDate = (date) => {
      const [y, m, d] = date.split("-");
      return `${d}/${m}/${y}`;
    };

    doc.image("./src/assets/logo.png", 50, 40, { width: 60 }).fillColor("#333");
    doc.fontSize(18).text("Relatório de Pontos", 120, 50);
    doc.moveTo(50, 80).lineTo(550, 80).strokeColor("#aaa").stroke();

    doc.moveDown(2);
    doc.fontSize(12).text(`Usuário: ${nomeUser}`);
    doc.text(`Período: ${formatDate(data_inicio)} até ${formatDate(data_fim)}`);
    doc.moveDown(1.5);


    doc
      .fontSize(12)
      .fillColor("#000")
      .text("Data", 50, doc.y, { continued: true })
      .text("Entrada", 180, doc.y, { continued: true })
      .text("Saída", 280, doc.y, { continued: true })
      .text("Justificativa", 400, doc.y)
      .moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor("#ccc").stroke();

    data.forEach((p) => {
      doc
        .fontSize(11)
        .fillColor("#333")
        .text(formatDate(p.data_registro), 50, doc.y, { continued: true })
        .text(p.hora_entrada || "-", 180, doc.y, { continued: true })
        .text(p.hora_saida || "-", 280, doc.y, { continued: true })
        .text(p.justificativa ? "Sim" : "-", 400, doc.y)
        .moveDown(0.4);
    });


    doc.moveDown(1.2);
    doc.fontSize(13).fillColor("#000").text("Resumo de horas", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor("#333").text(`Total no período: ${minutesToHHMM(totalPeriodoMin)} h`);
    doc.moveDown(0.2);
    doc
      .fontSize(12)
      .fillColor("#333")
      .text(`Mês vigente (${startISO.slice(5, 7)}/${startISO.slice(0, 4)}): ${minutesToHHMM(totalMesVigenteMin)} h`);

    doc.moveDown(2);
    doc
      .fontSize(8)
      .fillColor("#777")
      .text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 50, 750);

    doc.end();
  } catch (error) {
    console.error("❌ Erro gerarRelatorio:", error);
    res.status(500).json({ success: false, message: "Erro ao gerar relatório.", error });
  }
};
