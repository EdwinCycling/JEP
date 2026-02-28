import React, { useState } from "react";
import { useJEPStore } from "../store";
import { Upload, FileCode, FilePlus, Sparkles, Table, Layout, BarChart3, Workflow, PlusCircle } from "lucide-react";
import { motion } from "motion/react";

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setModel = useJEPStore((state) => state.setModel);
  const setExplanation = useJEPStore((state) => state.setExplanation);
  const addNotification = useJEPStore((state) => state.addNotification);

  const templates = [
    {
      id: 'empty',
      title: 'Helemaal leeg',
      description: 'Start met een schone lei, alleen de basis XML structuur.',
      icon: <FilePlus className="w-6 h-6" />,
      color: 'bg-slate-100 text-slate-600',
      model: {
        extension: {
          "@_code": "CUSTOM_EXT",
          "@_version": "1.0.0",
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xsi:noNamespaceSchemaLocation": "Extension.xsd"
        }
      },
      explanation: "Je bent gestart met een leeg extensiebestand."
    },
    {
      id: 'field',
      title: 'Extra Veld',
      description: 'Voeg een extra veld toe aan een bestaande entiteit (bijv. Account).',
      icon: <PlusCircle className="w-6 h-6" />,
      color: 'bg-emerald-100 text-emerald-600',
      model: {
        extension: {
          "@_code": "EXT_FIELD",
          "@_version": "1.0.0",
          entities: {
            entity: {
              "@_name": "Account",
              property: {
                "@_name": "EXT_SpecialNote",
                "@_type": "string",
                "@_length": "100",
                "@_caption": "Speciale Notitie"
              }
            }
          }
        }
      },
      explanation: "Dit template bevat een voorbeeld van een extra veld op de Account entiteit."
    },
    {
      id: 'table',
      title: 'Nieuwe Tabel',
      description: 'Maak een volledig nieuwe tabel (Custom Entity) aan.',
      icon: <Table className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
      model: {
        extension: {
          "@_code": "EXT_TABLE",
          "@_version": "1.0.0",
          customentities: {
            customentity: {
              "@_name": "EXT_ProjectPhase",
              "@_description": "Project Fasen",
              property: [
                { "@_name": "Code", "@_type": "string", "@_length": "20", "@_caption": "Code", "@_isdescription": "true" },
                { "@_name": "Description", "@_type": "string", "@_length": "60", "@_caption": "Omschrijving" }
              ]
            }
          }
        }
      },
      explanation: "Dit template bevat een nieuwe Custom Entity genaamd ProjectPhase."
    },
    {
      id: 'workflow',
      title: 'Kleine Workflow',
      description: 'Een basis bedrijfsproces met 3 stappen (New, In Progress, Done).',
      icon: <Workflow className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
      model: {
        extension: {
          "@_code": "EXT_WORKFLOW",
          "@_version": "1.0.0",
          workflowdefinitions: {
            workflowdefinition: {
              "@_name": "EXT_SimpleProcess",
              "@_description": "Eenvoudig Proces",
              stages: {
                stage: [
                  { "@_name": "New", "@_caption": "Nieuw", "@_stagetype": "New" },
                  { "@_name": "InProgress", "@_caption": "In Behandeling" },
                  { "@_name": "Done", "@_caption": "Afgerond", "@_stagetype": "Completed" }
                ]
              }
            }
          }
        }
      },
      explanation: "Dit template bevat een eenvoudige workflow met drie fasen."
    },
    {
      id: 'menu',
      title: 'Menu Uitbreiding',
      description: 'Voeg nieuwe tabbladen en links toe aan het Mega Menu.',
      icon: <Layout className="w-6 h-6" />,
      color: 'bg-amber-100 text-amber-600',
      model: {
        extension: {
          "@_code": "EXT_MENU",
          "@_version": "1.0.0",
          megamenuextensions: {
            megamenuextension: {
              "@_menuid": "MegaMenu",
              tab: {
                "@_id": "CustomTools",
                "@_caption": "Mijn Tools",
                section: {
                  "@_id": "General",
                  subsection: {
                    "@_id": "Links",
                    link: {
                      "@_id": "ExactSupport",
                      "@_caption": "Exact Support",
                      "@_href": "https://support.exact.com"
                    }
                  }
                }
              }
            }
          }
        }
      },
      explanation: "Dit template voegt een 'Mijn Tools' tabblad toe aan het Mega Menu."
    },
    {
      id: 'powerbi',
      title: 'Power BI Rapport',
      description: 'Integreer een Power BI rapport direct in Exact Online.',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-yellow-100 text-yellow-700',
      model: {
        extension: {
          "@_code": "EXT_PBI",
          "@_version": "1.0.0",
          megamenuextensions: {
            megamenuextension: {
              "@_menuid": "MegaMenu",
              tab: {
                "@_id": "Reporting",
                "@_existing": "true",
                section: {
                  "@_id": "BI",
                  subsection: {
                    "@_id": "Reports",
                    powerbilink: {
                      "@_id": "SalesDashboard",
                      "@_caption": "Sales Dashboard",
                      powerbireportembedlink: "https://app.powerbi.com/reportEmbed?reportId=your-id"
                    }
                  }
                }
              }
            }
          }
        }
      },
      explanation: "Dit template toont hoe je een Power BI rapport kunt embedden in het menu."
    }
  ];

  const useTemplate = (template: typeof templates[0]) => {
    setModel(template.model as any);
    setExplanation(template.explanation);
    addNotification(`${template.title} template geladen!`, "success");
  };

  const handleFile = async (file: File) => {
    if (!file || !file.name.endsWith(".xml")) {
      addNotification("Upload a.u.b. een geldig XML-bestand.", "warning");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("xmlFile", file);

      const res = await fetch("/api/parse-xml", {
        method: "POST",
        body: formData,
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Fout bij het verwerken van het bestand.");
        }
        throw new Error("Fout bij het verwerken van het bestand (Server Error).");
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server retourneerde geen geldig JSON-antwoord. Controleer of de server correct draait.");
      }

      const { data } = await res.json();

      setModel(data);
      addNotification("XML succesvol geüpload!", "success");

      // Fetch explanation
      const explainRes = await fetch("/api/explain-extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonObj: data }),
      });

      if (explainRes.ok) {
        const { explanation } = await explainRes.json();
        setExplanation(explanation);
      }
    } catch (error: any) {
      console.error(error);
      addNotification(error.message || "Er is een fout opgetreden bij het uploaden.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto mt-24 px-4"
    >
      <div className="text-center mb-12">
        <h1 className="text-5xl font-heading font-semibold text-exact-dark tracking-tight mb-4">
          Premium <span className="text-exact-red">edition</span>
        </h1>
        <p className="text-lg text-gray-600 font-sans">
          Upload een Exact Online Premium XML-extensie om deze visueel te bewerken.
        </p>
      </div>

      <div className="space-y-12">
        {/* Upload Box */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`
            relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200
            ${
              isDragging
                ? "border-exact-red bg-red-50"
                : "border-gray-300 hover:border-exact-red bg-white shadow-sm hover:shadow-md"
            }
          `}
        >
          <input
            type="file"
            accept=".xml"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            disabled={isLoading}
          />

          <div className="pointer-events-none flex flex-col items-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-exact-red mb-6" />
            ) : (
              <div className="w-16 h-16 bg-exact-beige text-exact-red rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
            )}
            <h3 className="text-lg font-heading font-medium text-exact-dark mb-2">
              {isLoading
                ? "Bestand verwerken..."
                : "Sleep XML hierheen"}
            </h3>
            <p className="text-sm text-gray-500 font-sans">
              of klik om een bestaand extensiebestand te laden
            </p>
          </div>
        </div>

        {/* Templates Section */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-exact-gold/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-exact-gold" />
            </div>
            <h2 className="text-xl font-heading font-bold text-exact-dark">Of start met een template</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ y: -4 }}
                onClick={() => useTemplate(template)}
                className="group relative bg-white border border-gray-100 rounded-3xl p-6 text-left shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
              >
                <div className={`w-12 h-12 ${template.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {template.icon}
                </div>
                <h3 className="text-lg font-heading font-bold text-exact-dark mb-2 group-hover:text-exact-blue transition-colors">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-500 font-sans leading-relaxed mb-4 flex-1">
                  {template.description}
                </p>
                <div className="flex items-center text-xs font-bold text-exact-blue group-hover:translate-x-1 transition-transform">
                  Template gebruiken <PlusCircle className="w-3 h-3 ml-2" />
                </div>
                
                {template.id === 'empty' && (
                  <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-100">
                    Schoon project
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
