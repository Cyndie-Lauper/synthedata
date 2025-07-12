import { z, ZodTypeAny, ZodObject } from "zod";
import { AIProvider } from "../ai/aiProvider";
import * as fs from 'fs';
import { Parser as Json2csvParser } from 'json2csv';

type GeneratedDataCache = { [key: string]: any[] };

export class FakedataGenerator {
  private generatedData: GeneratedDataCache = {};

  constructor(private aiProvider: AIProvider) {}

  async generate<T extends ZodTypeAny>(
    schema: T,
    count: number,
    context?: Record<string, any>
  ): Promise<z.infer<T>[]> {
    const modelName = (schema.description as string) || 'UnknownModel';
    console.log(`Starting creating ${count} records for schema '${modelName}'...`);

    const promises: Promise<z.infer<T>>[] = [];
    for (let i = 0; i < count; i++) {
      promises.push(this.generateSingleRecord(schema, modelName, context));
    }
    const records = await Promise.all(promises);

    if (!this.generatedData[modelName]) {
      this.generatedData[modelName] = [];
    }
    this.generatedData[modelName].push(...records);

    console.log(`Done creating data for '${modelName}'`);
    return records;
  }

  private async generateSingleRecord<T extends ZodTypeAny>(
    schema: T,
    modelName: string,
    context?: Record<string, any>
  ): Promise<z.infer<T>> {
    const shape = (schema as unknown as ZodObject<any>).shape;
    const record: any = {};

    for (const key in shape) {
      const fieldSchema = shape[key];
      const fieldDef = fieldSchema._def;

      if (key.endsWith('Id') && fieldDef.description) {
        const refModelName = fieldDef.description;
        if (this.generatedData[refModelName]?.length > 0) {
          const referencedData = this.generatedData[refModelName];
          record[key] = referencedData[Math.floor(Math.random() * referencedData.length)].id;
          continue;
        } else {
          console.warn(`Warning: No data found for foreign key '${refModelName}'. Set value to null.`);
          record[key] = null;
          continue;
        }
      }

      if (key === 'id') {
        record[key] = (this.generatedData[modelName]?.length || 0) + Object.keys(record).length + 1;
        continue;
      }

      const prompt = this.createPromptForField(modelName, key, fieldSchema, context);
      const generatedValue = await this.aiProvider.generateText(prompt);

      if (fieldDef.typeName === 'ZodNumber') {
        record[key] = parseInt(generatedValue, 10) || 0;
      } else {
        record[key] = generatedValue;
      }
    }
    return record as z.infer<T>;
  }

  private createPromptForField(
    modelName: string,
    fieldName: string,
    schema: ZodTypeAny,
    context?: Record<string, any>
  ): string {
    const fieldDef = schema._def;
    let prompt = `an actual ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} for a '${modelName}' object`;

    if (context) {
      const contextStr = Object.entries(context).map(([k, v]) => `${k} là ${v}`).join(", ");
      prompt += ` in context ${contextStr}`;
    }

    if (fieldDef.typeName === 'ZodEnum') {
      const options = (fieldDef as any).options ?? (fieldDef as any).values;
      if (Array.isArray(options)) {
        prompt += `. Value must be one of the following options: ${options.join(", ")}`;
      }
    }

    if (fieldDef.typeName === 'ZodString') {
      const checks = (fieldDef as any).checks ?? (fieldDef as any)._def?.checks;
      if (Array.isArray(checks)) {
        checks.forEach((check: any) => {
          if (check.kind === 'max') prompt += `. Maximum length is ${check.value} characters.`;
          if (check.kind === 'min') prompt += `. Minimum length is ${check.value} characters.`;
          if (check.kind === 'email') prompt += `. Must be a valid email address.`;
        });
      }
    }

    return prompt;
  }

  async exportDataToFile(modelName: string, filePath: string, format: 'json' | 'csv') {
    const data = this.generatedData[modelName];
    if (!data) {
        throw new Error(`No data found for model: ${modelName}`);
    }
    if (format === 'json') {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } else if (format === 'csv') {
        const json2csvParser = new Json2csvParser();
        const csv = json2csvParser.parse(data);
        fs.writeFileSync(filePath, csv, 'utf-8');
    } else {
        throw new Error('Unsupported format');
    }
}
}
