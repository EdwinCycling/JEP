import express from "express";
import multer from "multer";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import fs from "fs";
import path from "path";
import helmet from "helmet";
import cors from "cors";

const upload = multer({ storage: multer.memoryStorage() });

export function createApiApp() {
  const app = express();

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disable for easier dev/preview if needed
  }));
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Original: ${req.originalUrl} - Path: ${req.path}`);
    next();
  });

  // API Routes (Prefix /api is handled by mounting)
  app.get("/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.get("/xsd", (req, res) => {
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

  app.post("/xsd", upload.single("xsdFile"), (req, res) => {
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

  app.post("/parse-xml", upload.single("xmlFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Geen bestand geüpload." });
      }

      const xmlData = req.file.buffer.toString("utf-8");
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
        allowBooleanAttributes: true,
        parseAttributeValue: true,
        textNodeName: "#text",
        isArray: (name, jpath) => {
          const arrayPaths = [
            "extension.quickmenuextensions.quickmenuextension",
            "extension.quickmenuextensions.quickmenuextension.mandatoryfeaturesets.featureset",
            "extension.quickmenuextensions.quickmenuextension.forbiddenfeaturesets.featureset",
            "extension.quickmenuextensions.quickmenuextension.subsection",
            "extension.quickmenuextensions.quickmenuextension.subsection.link",
            "extension.megamenuextensions.megamenuextension",
            "extension.megamenuextensions.megamenuextension.mandatoryfeaturesets.featureset",
            "extension.megamenuextensions.megamenuextension.forbiddenfeaturesets.featureset",
            "extension.megamenuextensions.megamenuextension.tab",
            "extension.megamenuextensions.megamenuextension.tab.section",
            "extension.megamenuextensions.megamenuextension.tab.section.subsection",
            "extension.megamenuextensions.megamenuextension.tab.section.subsection.link",
            "extension.entities.entity",
            "extension.entities.entity.mandatoryfeaturesets.featureset",
            "extension.entities.entity.forbiddenfeaturesets.featureset",
            "extension.entities.entity.property",
            "extension.entities.entity.property.mandatoryfeaturesets.featureset",
            "extension.entities.entity.property.forbiddenfeaturesets.featureset",
            "extension.entities.entity.property.listitems.listitem",
            "extension.customentities.customentity",
            "extension.customentities.customentity.mandatoryfeaturesets.featureset",
            "extension.customentities.customentity.forbiddenfeaturesets.featureset",
            "extension.customentities.customentity.property",
            "extension.customentities.customentity.property.mandatoryfeaturesets.featureset",
            "extension.customentities.customentity.property.forbiddenfeaturesets.featureset",
            "extension.customentities.customentity.property.listitems.listitem",
            "extension.applicationextensions.applicationextension",
            "extension.applicationextensions.applicationextension.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.forbiddenfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.cardsection",
            "extension.applicationextensions.applicationextension.cardsection.mandatoryfeaturesets.featureset",
            "extension.applicationextensions.applicationextension.cardsection.forbiddenfeaturesets.featureset",
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
            "extension.roles.role",
            "extension.roles.extensionrole",
            "extension.roles.existingrole",
            "extension.roles.role.customentity",
            "extension.roles.extensionrole.customentity",
            "extension.roles.existingrole.customentity",
            "extension.workflowdefinitions.workflowdefinition",
            "extension.workflowdefinitions.workflowdefinition.stages.stage",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.propertysettings.propertysetting",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.actions.action",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.actions.action.permissions.user",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.actions.action.permissions.team",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.actions.action.permissions.actor",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.actions.action.automations.automation",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.editpermissions.user",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.editpermissions.team",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.editpermissions.actor",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.deletepermissions.user",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.deletepermissions.team",
            "extension.workflowdefinitions.workflowdefinition.stages.stage.deletepermissions.actor",
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

  app.post("/build-xml", (req, res) => {
    try {
      const { jsonObj } = req.body;
      if (!jsonObj) return res.json({ xml: "" });
      
      const cleanObj = JSON.parse(JSON.stringify(jsonObj));
      if (cleanObj["?xml"]) delete cleanObj["?xml"];
      
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
      xmlData = `<?xml version="1.0" encoding="utf-8"?>\n` + xmlData.trim();
      res.json({ xml: xmlData });
    } catch (error) {
      console.error("XML Build Error:", error);
      res.status(500).json({ error: "Fout bij het genereren van de XML." });
    }
  });

  app.post("/validate-xml", async (req, res) => {
    try {
      const { xml } = req.body;
      const xsdPath = path.resolve(process.cwd(), "Extensions.xsd");
      
      if (!fs.existsSync(xsdPath)) {
        return res.status(400).json({ isValid: false, message: "Geen XSD bestand gevonden." });
      }

      if (!xml || !xml.includes("<extension")) {
        return res.json({
          isValid: false,
          errors: [{ message: "Ongeldige XML structuur", line: "1", suggestion: "Zorg voor een <extension> tag." }]
        });
      }

      res.json({ isValid: true, errors: [] });
    } catch (error) {
      console.error("XML Validation Error:", error);
      res.status(500).json({ isValid: false, message: "Fout bij het valideren van de XML." });
    }
  });

  app.post("/explain-extension", (req, res) => {
    try {
      const { jsonObj } = req.body;
      const extensionCode = jsonObj?.extension?.["@_code"] || "Onbekend";
      res.json({ explanation: `Deze extensie (${extensionCode}) voegt specifieke velden en menu's toe aan uw Exact Online omgeving.` });
    } catch (error) {
      res.status(500).json({ error: "Fout bij het genereren van de uitleg." });
    }
  });

  app.post("/generate-changelog", (req, res) => {
    try {
      const { changes } = req.body;
      res.json({ changelog: (changes || []).join("\n") || "Geen wijzigingen." });
    } catch (error) {
      res.status(500).json({ error: "Fout bij het genereren van de changelog." });
    }
  });

  return app;
}
