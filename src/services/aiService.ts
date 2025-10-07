// External AI provider removed. Using local deterministic generators instead.

export interface FinancialAnalysis {
  insights: string[];
  recommendations: string[];
  spendingPatterns: string[];
  riskAssessment: string;
  savingsOpportunities: string[];
}

export interface TransactionData {
  description: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface GoalData {
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export class AIService {
  static async analyzeSpendingPatterns(
    transactions: TransactionData[],
  ): Promise<FinancialAnalysis> {
    try {
      const transactionSummary = this.formatTransactionData(transactions);

      const prompt = `
        Analisis pola pengeluaran berikut dan berikan insight finansial:
        
        Data Transaksi:
        ${transactionSummary}
        
        Berikan analisis dalam format JSON:
        {
          "insights": ["insight 1", "insight 2"],
          "recommendations": ["rekomendasi 1", "rekomendasi 2"],
          "spendingPatterns": ["pola 1", "pola 2"],
          "riskAssessment": "penilaian risiko",
          "savingsOpportunities": ["peluang 1", "peluang 2"]
        }
      `;

      // Local pseudo-AI: parse prompt and return structured defaults
      return this.parseAIResponse(
        `{"insights":["Fokus pada kategori pengeluaran tertinggi"],"recommendations":["Buat anggaran untuk 3 kategori terbesar"],"spendingPatterns":["Pengeluaran meningkat di akhir bulan"],"riskAssessment":"sedang","savingsOpportunities":["Otomatiskan transfer tabungan"]}`,
      );
    } catch (error) {
      console.error('AI Analysis Error:', error);
      return this.getFallbackAnalysis();
    }
  }

  static async generateGoalRecommendations(
    goals: GoalData[],
    transactions: TransactionData[],
  ): Promise<string[]> {
    try {
      const goalSummary = goals
        .map(
          (goal) =>
            `Goal: ${goal.name}, Target: ${goal.targetAmount}, Current: ${goal.currentAmount}, Deadline: ${goal.deadline}`,
        )
        .join('\n');

      const prompt = `
        Berikan rekomendasi untuk mencapai goals finansial berikut:
        
        Goals:
        ${goalSummary}
        
        Berikan 3-5 rekomendasi praktis dalam format array JSON:
        ["rekomendasi 1", "rekomendasi 2", "rekomendasi 3"]
      `;

      // Local pseudo-AI output
      return this.parseRecommendations(
        '["Tingkatkan kontribusi bulanan","Kurangi pengeluaran non-esensial","Gunakan pengingat auto-transfer"]',
      );
    } catch (error) {
      console.error('AI Goal Recommendations Error:', error);
      return [
        'Buat budget bulanan yang realistis',
        'Otomatiskan transfer ke tabungan',
        'Kurangi pengeluaran yang tidak perlu',
      ];
    }
  }

  static async generateBudgetAdvice(
    income: number,
    expenses: TransactionData[],
  ): Promise<string[]> {
    try {
      const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const savingsRate = ((income - totalExpenses) / income) * 100;

      const prompt = `
        Berikan saran budget berdasarkan:
        - Income: ${income}
        - Total Expenses: ${totalExpenses}
        - Savings Rate: ${savingsRate.toFixed(1)}%
        
        Berikan 5 saran praktis dalam format array JSON:
        ["saran 1", "saran 2", "saran 3", "saran 4", "saran 5"]
      `;

      // Local pseudo-AI output
      return this.parseRecommendations(
        '["Tetapkan batas kategori","Review langganan","Optimalkan kebutuhan bulanan","Naikkan tabungan otomatis","Cek diskon"]',
      );
    } catch (error) {
      console.error('AI Budget Advice Error:', error);
      return [
        'Gunakan aturan 50/30/20 untuk budget',
        'Prioritaskan emergency fund',
        'Review pengeluaran bulanan',
        'Investasikan sisa dana',
        'Monitor progress secara berkala',
      ];
    }
  }

  static async generateInvestmentAdvice(
    riskProfile: 'low' | 'medium' | 'high',
    amount: number,
  ): Promise<string[]> {
    try {
      const prompt = `
        Berikan saran investasi untuk:
        - Risk Profile: ${riskProfile}
        - Amount: ${amount}
        
        Berikan 4-5 saran investasi dalam format array JSON:
        ["saran 1", "saran 2", "saran 3", "saran 4"]
      `;

      // Local pseudo-AI output
      return this.parseRecommendations(
        '["Diversifikasi","Mulai konservatif","Pertimbangkan reksadana","Monitoring berkala"]',
      );
    } catch (error) {
      console.error('AI Investment Advice Error:', error);
      return [
        'Diversifikasi portfolio',
        'Mulai dengan investasi konservatif',
        'Pertimbangkan reksadana',
        'Monitor performa secara berkala',
      ];
    }
  }

  private static formatTransactionData(
    transactions: TransactionData[],
  ): string {
    return transactions
      .map(
        (t) =>
          `${t.type}: ${t.description} - ${t.amount} (${t.category}) - ${t.date}`,
      )
      .join('\n');
  }

  private static parseAIResponse(text: string): FinancialAnalysis {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    return this.getFallbackAnalysis();
  }

  private static parseRecommendations(text: string): string[] {
    try {
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0]);
      }
    } catch (error) {
      console.error('Failed to parse recommendations:', error);
    }

    return ['Rekomendasi AI tidak tersedia saat ini'];
  }

  private static getFallbackAnalysis(): FinancialAnalysis {
    return {
      insights: [
        'Analisis AI sedang dalam pengembangan',
        'Gunakan fitur manual untuk analisis detail',
      ],
      recommendations: [
        'Buat budget bulanan yang jelas',
        'Monitor pengeluaran secara berkala',
        'Prioritaskan emergency fund',
      ],
      spendingPatterns: ['Pola pengeluaran perlu dianalisis lebih lanjut'],
      riskAssessment: 'Risiko sedang - perlu monitoring lebih lanjut',
      savingsOpportunities: [
        'Identifikasi pengeluaran yang bisa dikurangi',
        'Otomatiskan transfer tabungan',
      ],
    };
  }
}
