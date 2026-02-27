import { validateXML } from 'xmllint-wasm';

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
};

function mapErrorMessage(msg: string): string {
  for (const [key, replacement] of Object.entries(errorMappings)) {
    if (msg.includes(key)) {
      return replacement;
    }
  }
  return msg;
}

export async function validateWithSchema(xml: string, xsd: string): Promise<ValidationResult> {
  try {
    const result = await validateXML({
      xml: xml,
      schema: xsd,
    });

    if (result.valid) {
      return { isValid: true, errors: [] };
    }

    const errors: ValidationError[] = (result.errors || []).map(errObj => {
      const err = typeof errObj === 'string' ? errObj : (errObj as any).message || String(errObj);
      // xmllint errors are often strings like "file.xml:10: element prop: Schemas validity error..."
      const match = err.match(/:(\d+):/);
      const line = match ? parseInt(match[1]) : 1;
      
      return {
        line,
        column: 1,
        message: mapErrorMessage(err),
        rawContext: err
      };
    });

    return {
      isValid: false,
      errors
    };
  } catch (error) {
    console.error("Validation Engine Error:", error);
    return {
      isValid: false,
      errors: [{
        line: 1,
        column: 1,
        message: "Er is een technische fout opgetreden tijdens de validatie."
      }]
    };
  }
}
