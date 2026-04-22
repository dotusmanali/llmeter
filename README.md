<div align="center">
  
# 🚀 LLMeter
**The Ultimate Local LLM Hardware Benchmark & Model Fit Analyzer**

[![React](https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

*Stop guessing if an LLM will run on your machine. Benchmark your hardware, analyze memory spikes, and get tailored quantization recommendations in seconds.*

</div>

---

## ⚡ What is LLMeter?
**LLMeter** is a browser-based hardware benchmarking tool designed specifically for the Local AI ecosystem. It runs precise micro-benchmarks on your CPU, memory, and disk to generate a **Real Performance Factor**, instantly telling you which Large Language Models (LLMs) will run gracefully on your device and which ones will melt your CPU.

No more downloading 15GB models only to find out they crash on load.

## ✨ Key Features

- 🏎️ **Real Micro-Benchmarks:** Runs actual WebAssembly SIMD operations, memory bandwidth tests, and disk read estimates to calculate your exact hardware capabilities.
- 🧠 **Multi-Quantization Fit Analyzer:** Cross-references your available RAM against a massive matrix of models (Llama 3, Qwen 2.5, Mistral, Gemma, Phi-3) and their specific quantization profiles (q2_k to q8_0).
- 📊 **Loading Strategy Planner:** Predicts RAM spikes (up to 1.25x model size) and recommends whether you can load a model directly into memory or if you need to rely on chunked loading.
- 🔌 **Seamless Ollama Integration:** Connects directly to your local `localhost:11434` instance to analyze your currently installed models and suggest upgrades or alternative quantizations.
- ⏱️ **Tokens/Sec Estimation:** Provides realistic inference speed estimates (Tokens per Second) by factoring in your CPU architecture (AVX2, NEON), memory bandwidth, and GPU capabilities.
- 🔒 **100% Privacy-Focused:** Everything runs locally. No accounts, no cloud sync, no data harvesting.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **State Management:** Zustand
- **Architecture:** Clean, standalone Vite + React structure
- **Design:** Premium Dark Mode UI, JetBrains Mono for data, Inter for typography

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/download/) (v20+ recommended)
- [pnpm](https://pnpm.io/installation) (v9+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dotusmanali/llmeter.git
   cd llmeter
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm -C artifacts/llmeter run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173` to see LLMeter in action!

## 📸 Screenshots

*(Add screenshots of your Dashboard, Benchmark progress, and Model Fit Table here)*

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  <i>Built with ❤️ for the Local AI Community.</i>
</div>
