import React, { useState } from "react";
import { useJEPStore } from "../store";
import { Upload, FileCode } from "lucide-react";
import { motion } from "motion/react";

export default function UploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const setModel = useJEPStore((state) => state.setModel);
  const setExplanation = useJEPStore((state) => state.setExplanation);
  const addNotification = useJEPStore((state) => state.addNotification);

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

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-3xl p-16 text-center transition-all duration-200
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
            <div className="animate-spin rounded-full h-14 w-14 border-b-4 border-exact-red mb-6" />
          ) : (
            <div className="w-20 h-20 bg-exact-beige text-exact-red rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Upload className="w-10 h-10" />
            </div>
          )}
          <h3 className="text-xl font-heading font-medium text-exact-dark mb-2">
            {isLoading
              ? "Bestand verwerken..."
              : "Sleep je XML-bestand hierheen"}
          </h3>
          <p className="text-base text-gray-500 font-sans">
            of klik om een bestand te selecteren
          </p>
        </div>
      </div>
    </motion.div>
  );
}
