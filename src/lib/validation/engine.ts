export interface ValidationError {
  line: number;
  column: number;
  message: number | string;
  rawContext?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Mappings for technical XSD errors to user-friendly "Exact-language"
 */
const errorMappings: Record<string, string> = {
  "is not a valid value of the atomic type": "De ingevoerde waarde is niet toegestaan voor dit type veld.",
  "is not a valid value of the local complex type": "De structuur van dit element is onjuist.",
  "The attribute 'caption' is required": "Het attribuut 'caption' (omschrijving) is verplicht.",
  "The attribute 'name' is required": "Het attribuut 'name' (technische naam) is verplicht.",
  "is not a valid value of the list type": "De gekozen waarde komt niet voor in de toegestane lijst.",
  "Element 'property' is not allowed": "Het element 'property' staat op de verkeerde plek of is niet toegestaan.",
  "Expected is": "Er werd een ander element verwacht. Controleer de volgorde.",
  "is not accepted by the pattern": "De waarde voldoet niet aan het vereiste formaat (bijv. voor 'code' of 'version').",
  "attribute 'code'": "Het attribuut 'code' is verplicht en moet 3-30 hoofdletters of cijfers bevatten.",
  "attribute 'version'": "Het attribuut 'version' is verplicht en moet in semver formaat (bijv. 1.0.0).",
  "readonly": "Het attribuut 'readonly' wordt niet ondersteund in de XSD. Verwijder dit uit de XML.",
  "is not a valid value of the atomic type 'xs:boolean'": "De waarde moet 'true' of 'false' zijn (geen losse woorden).",
};

function mapErrorMessage(msg: string): string {
  for (const [key, replacement] of Object.entries(errorMappings)) {
    if (msg.includes(key)) {
      return replacement;
    }
  }
  return msg;
}

export async function validateWithSchema(xml: string, xsd?: string): Promise<ValidationResult> {
  try {
    const response = await fetch("/api/validate-xml", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Server validatie mislukt.");
    }

    const result = await response.json();
    
    if (result.isValid) {
      return { isValid: true, errors: [] };
    }

    const mappedErrors: ValidationError[] = (result.errors || []).map((err: any) => ({
      ...err,
      message: mapErrorMessage(err.message)
    }));

    return {
      isValid: false,
      errors: mappedErrors
    };
  } catch (error) {
    console.error("Validation Engine Error:", error);
    const techMsg = error instanceof Error ? error.message : String(error);
    return {
      isValid: false,
      errors: [{
        line: 1,
        column: 1,
        message: `Fout bij verbinden met validatie-server: ${techMsg}. Controleer of de server draait.`,
        rawContext: techMsg
      }]
    };
  }
}
