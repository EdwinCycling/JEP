import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import fs from "fs";
import path from "path";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.post("/api/test", (req, res) => {
    res.json({ message: "Test success", body: req.body });
  });

  app.get("/api/xsd", (req, res) => {
    try {
      const xsdPath = path.resolve(process.cwd(), "Extensions.xsd");
      if (fs.existsSync(xsdPath)) {
        const xsdContent = fs.readFileSync(xsdPath, "utf-8");
        res.json({ xsd: xsdContent });
      } else {
        res.status(404).json({ error: "XSD bestand niet gevonden." });
      }
    } catch (error) {
      console.error("XSD Get Error:", error);
      res.status(500).json({ error: "Fout bij het ophalen van de XSD." });
    }
  });

  app.post("/api/xsd", upload.single("xsdFile"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Geen bestand geüpload." });
      }
      
      const xsdData = req.file.buffer.toString("utf-8");
      const xsdPath = path.resolve(process.cwd(), "Extensions.xsd");
      
      fs.writeFileSync(xsdPath, xsdData, "utf-8");
      res.json({ message: "XSD succesvol bijgewerkt.", xsd: xsdData });
    } catch (error) {
      console.error("XSD Upload Error:", error);
      res.status(500).json({ error: "Fout bij het opslaan van de XSD." });
    }
  });

  app.post("/api/parse-xml", upload.single("xmlFile"), async (req, res) => {
    console.log(`[API] POST /api/parse-xml - File: ${req.file?.originalname}`);
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Geen bestand geüpload." });
      }

      const xmlData = req.file.buffer.toString("utf-8");
      console.log(`[API] XML Data length: ${xmlData.length}`);

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        textNodeName: "#text",
        isArray: (name, jpath, isLeafNode, isAttribute) => {
          const arrayPaths = [
            "extension.entities.entity",
            "extension.entities.entity.property",
            "extension.entities.entity.property.listitems.listitem",
            "extension.customentities.customentity",
            "extension.customentities.customentity.property",
            "extension.customentities.customentity.property.listitems.listitem",
            "extension.applicationextensions.applicationextension",
            "extension.applicationextensions.applicationextension.cardsection",
            "extension.applicationextensions.applicationextension.cardsection.field",
            "extension.applicationextensions.applicationextension.contentsectionrow",
            "extension.applicationextensions.applicationextension.contentsectionrow.field",
            "extension.applicationextensions.applicationextension.gridpageheader",
            "extension.applicationextensions.applicationextension.gridpageheader.section",
            "extension.applicationextensions.applicationextension.gridpageheader.section.field",
            "extension.applicationextensions.applicationextension.gridcolumn",
            "extension.applicationextensions.applicationextension.filterblock",
            "extension.applicationextensions.applicationextension.filterblock.filter",
            "extension.applicationextensions.applicationextension.columngroup",
            "extension.applicationextensions.applicationextension.columngroup.column",
            "extension.translationextensions.translation",
            "extension.translationextensions.translation.language",
            "extension.megamenuextensions.megamenuextension",
            "extension.megamenuextensions.megamenuextension.tab",
            "extension.megamenuextensions.megamenuextension.tab.section",
            "extension.megamenuextensions.megamenuextension.tab.section.subsection",
            "extension.megamenuextensions.megamenuextension.tab.section.subsection.link",
            "extension.quickmenuextensions.quickmenuextension",
            "extension.quickmenuextensions.quickmenuextension.subsection",
            "extension.quickmenuextensions.quickmenuextension.subsection.link",
            "extension.roles.role",
            "extension.roles.role.customentity",
            "extension.applicationextensions.applicationextension.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.forbiddenfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.button.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.button.forbiddenfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.monitor.item.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.monitor.item.forbiddenfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.cardsection.field.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.cardsection.field.forbiddenfeaturesets.featureset",
            "extension.megamenuextensions.megamenuextension.mandatoryfeaturesets.featureset",
            "extension.megamenuextensions.megamenuextension.forbiddenfeaturesets.featureset",
            "extension.quickmenuextensions.quickmenuextension.mandatoryfeaturesets.featureset",
            "extension.quickmenuextensions.quickmenuextension.forbiddenfeaturesets.featureset",
          ];
          return arrayPaths.includes(jpath);
        },
      });

      const jsonObj = parser.parse(xmlData);
      res.json({ data: jsonObj });
    } catch (error) {
      console.error("XML Parse Error:", error);
      res.status(500).json({ error: "Fout bij het verwerken van het XML-bestand." });
    }
  });

  app.post("/api/build-xml", (req, res) => {
    try {
      const { jsonObj } = req.body;
      if (!jsonObj) {
        return res.json({ xml: "" });
      }
      
      // Create a clean copy and remove any existing ?xml declaration to prevent duplicates or malformed tags
      const cleanObj = JSON.parse(JSON.stringify(jsonObj));
      if (cleanObj && cleanObj["?xml"]) {
        delete cleanObj["?xml"];
      }
      
      // Recursively fix boolean attributes to be strings "true" or "false"
      // because XML standard requires attributes to have a value (e.g. allowempty="true")
      const fixBooleanAttributes = (obj: any) => {
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (key.startsWith('@_') && typeof obj[key] === 'boolean') {
              obj[key] = obj[key] ? "true" : "false";
            } else if (typeof obj[key] === 'object') {
              fixBooleanAttributes(obj[key]);
            }
          }
        }
      };
      fixBooleanAttributes(cleanObj);

      const builder = new XMLBuilder({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        format: true,
        suppressEmptyNode: true,
        textNodeName: "#text"
      });

      let xmlData = builder.build(cleanObj);
      
      // Ensure the XML declaration is always perfectly formatted at the top
      xmlData = `<?xml version="1.0" encoding="utf-8"?>\n` + xmlData.trim();
      
      res.json({ xml: xmlData });
    } catch (error) {
      console.error("XML Build Error:", error);
      res.status(500).json({ error: "Fout bij het genereren van de XML." });
    }
  });

  app.post("/api/validate-xml", async (req, res) => {
    try {
      const { xml } = req.body;
      const xsdPath = path.resolve(process.cwd(), "Extensions.xsd");
      
      if (!fs.existsSync(xsdPath)) {
        return res.status(400).json({ isValid: false, message: "Geen XSD bestand gevonden. Upload eerst een XSD via 'Update XSD'." });
      }

      // Basic validation without AI
      if (!xml || !xml.includes("<extension")) {
        return res.json({
          isValid: false,
          errors: [
            {
              message: "Ongeldige XML structuur",
              line: "1",
              suggestion: "Zorg ervoor dat de XML begint met een <extension> tag."
            }
          ]
        });
      }

      res.json({ isValid: true, errors: [] });
    } catch (error) {
      console.error("XML Validation Error:", error);
      res.status(500).json({ isValid: false, message: "Fout bij het valideren van de XML." });
    }
  });

  app.post("/api/explain-extension", async (req, res) => {
    try {
      const { jsonObj } = req.body;
      const extensionCode = jsonObj?.extension?.["@_code"] || "Onbekend";
      res.json({ explanation: `Deze extensie (${extensionCode}) voegt specifieke velden en menu's toe aan uw Exact Online omgeving om uw bedrijfsprocessen beter te ondersteunen.` });
    } catch (error) {
      console.error("Explanation Error:", error);
      res.status(500).json({ error: "Fout bij het genereren van de uitleg." });
    }
  });

  app.post("/api/generate-changelog", async (req, res) => {
    try {
      const { changes } = req.body; // Array of change descriptions

      if (!changes || changes.length === 0) {
        return res.json({ changelog: "Geen wijzigingen gedetecteerd." });
      }

      res.json({ changelog: changes.join("\n") });
    } catch (error) {
      console.error("Changelog Error:", error);
      res.status(500).json({ error: "Fout bij het genereren van de changelog." });
    }
  });

  // API 404 handler
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: `API route niet gevonden: ${req.method} ${req.originalUrl}` });
  });

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error:", err);
    res.status(err.status || 500).json({
      error: err.message || "Interne serverfout",
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
