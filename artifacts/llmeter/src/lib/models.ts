export type Quality = "low" | "medium" | "balanced" | "good" | "high";
export type Fit = "likely" | "maybe" | "no";

export interface Quant {
  key: string;
  ram_gb: number;
  quality: Quality;
}

export interface Model {
  name: string;
  family: string;
  min_score: number;
  use_cases: string[];
  quants: Record<string, Quant>;
  ollama_name?: string;
}

export interface ModelFit extends Quant {
  model: Model;
  fit: Fit;
  failure_probability: number;
  chunked: boolean;
}

export const MODELS: Model[] = [
  {
    name: "TinyLlama 1.1B",
    family: "llama",
    min_score: 15,
    use_cases: ["chat", "fast_local"],
    ollama_name: "tinyllama",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 0.5, quality: "low" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 0.7, quality: "balanced" },
      q8_0: { key: "Q8_0", ram_gb: 1.1, quality: "high" },
    },
  },
  {
    name: "Gemma 2B",
    family: "gemma",
    min_score: 30,
    use_cases: ["chat", "summarization", "fast_local"],
    ollama_name: "gemma:2b",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 0.9, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 1.1, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 1.5, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 1.8, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 2.5, quality: "high" },
    },
  },
  {
    name: "Phi-3 Mini 3.8B",
    family: "phi",
    min_score: 40,
    use_cases: ["coding", "reasoning", "chat"],
    ollama_name: "phi3:mini",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 1.4, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 1.7, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 2.3, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 2.8, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 4.0, quality: "high" },
    },
  },
  {
    name: "Qwen2.5 3B",
    family: "qwen",
    min_score: 40,
    use_cases: ["coding", "chat", "multilingual"],
    ollama_name: "qwen2.5:3b",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 1.1, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 1.4, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 2.0, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 2.4, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 3.5, quality: "high" },
    },
  },
  {
    name: "Llama 3.2 3B",
    family: "llama",
    min_score: 40,
    use_cases: ["chat", "reasoning"],
    ollama_name: "llama3.2:3b",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 1.1, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 1.4, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 2.0, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 2.5, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 3.5, quality: "high" },
    },
  },
  {
    name: "Mistral 7B",
    family: "mistral",
    min_score: 60,
    use_cases: ["chat", "coding", "reasoning"],
    ollama_name: "mistral",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 2.7, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 3.3, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 4.1, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 4.9, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 7.7, quality: "high" },
    },
  },
  {
    name: "Llama 3.1 7B",
    family: "llama",
    min_score: 60,
    use_cases: ["chat", "reasoning", "roleplay"],
    ollama_name: "llama3.1:8b",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 2.8, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 3.4, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 4.5, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 5.3, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 8.0, quality: "high" },
    },
  },
  {
    name: "Qwen2.5 7B",
    family: "qwen",
    min_score: 60,
    use_cases: ["coding", "multilingual", "reasoning"],
    ollama_name: "qwen2.5:7b",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 2.6, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 3.2, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 4.4, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 5.2, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 7.6, quality: "high" },
    },
  },
  {
    name: "Llama 3.1 13B",
    family: "llama",
    min_score: 80,
    use_cases: ["reasoning", "coding", "roleplay"],
    ollama_name: "llama3.1:latest",
    quants: {
      q2_k: { key: "Q2_K", ram_gb: 5.0, quality: "low" },
      q3_k_m: { key: "Q3_K_M", ram_gb: 6.3, quality: "medium" },
      q4_k_m: { key: "Q4_K_M", ram_gb: 8.0, quality: "balanced" },
      q5_k_m: { key: "Q5_K_M", ram_gb: 9.8, quality: "good" },
      q8_0: { key: "Q8_0", ram_gb: 14.0, quality: "high" },
    },
  },
];

export const USE_CASE_MAP: Record<string, string[]> = {
  coding: ["Phi-3 Mini 3.8B", "Qwen2.5 7B", "Qwen2.5 3B"],
  chat: ["Llama 3.1 7B", "Mistral 7B", "Gemma 2B"],
  reasoning: ["Llama 3.1 13B", "Qwen2.5 7B", "Phi-3 Mini 3.8B"],
  roleplay: ["Llama 3.1 7B", "Llama 3.1 13B", "Mistral 7B"],
  fast_local: ["TinyLlama 1.1B", "Gemma 2B", "Qwen2.5 3B"],
  multilingual: ["Qwen2.5 7B", "Qwen2.5 3B"],
};

export function computeFits(
  ram_gb: number,
  score: number
): ModelFit[] {
  const usable_ram = ram_gb * 0.70;
  const results: ModelFit[] = [];

  for (const model of MODELS) {
    for (const [qkey, quant] of Object.entries(model.quants)) {
      const ram_spike = quant.ram_gb * 1.25;
      let fit: Fit;
      const chunked = ram_spike > usable_ram;
      if (ram_spike <= usable_ram && score >= model.min_score) {
        fit = "likely";
      } else if (quant.ram_gb <= usable_ram * 1.15) {
        fit = "maybe";
      } else {
        fit = "no";
      }

      const failure_probability = Math.max(
        0,
        (ram_spike - usable_ram) / ram_spike
      );

      results.push({
        ...quant,
        key: qkey,
        model,
        fit,
        failure_probability: Math.min(failure_probability, 0.99),
        chunked,
      });
    }
  }

  return results;
}

export function getBestRecommendations(
  fits: ModelFit[],
  goal?: string
): {
  best_overall: ModelFit | null;
  best_quality: ModelFit | null;
  fastest: ModelFit | null;
  for_goal: ModelFit | null;
} {
  const likely = fits.filter((f) => f.fit === "likely");
  const qualityOrder: Quality[] = ["high", "good", "balanced", "medium", "low"];

  const best_overall = likely.sort(
    (a, b) =>
      qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality)
  )[0] ?? null;

  const best_quality = fits
    .filter((f) => f.fit !== "no")
    .sort(
      (a, b) =>
        qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality)
    )[0] ?? null;

  const fastest = likely.sort((a, b) => a.ram_gb - b.ram_gb)[0] ?? null;

  let for_goal: ModelFit | null = null;
  if (goal && USE_CASE_MAP[goal]) {
    const goalNames = USE_CASE_MAP[goal];
    for_goal =
      likely
        .filter((f) => goalNames.includes(f.model.name))
        .sort(
          (a, b) =>
            qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality)
        )[0] ?? null;
  }

  return { best_overall, best_quality, fastest, for_goal };
}
