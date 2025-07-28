import { FirstAidGuide, GuideContent, GuideStep } from '../types';

export interface SearchIndex {
  id: string;
  terms: string[];
  title: string;
  category: string;
  severity: string;
  relevanceScore: number;
}

export interface SearchResult {
  guide: FirstAidGuide;
  score: number;
  matches: {
    field: string;
    term: string;
    position: number;
  }[];
}

export class SearchIndexer {
  private index: Map<string, SearchIndex> = new Map();
  private termFrequency: Map<string, number> = new Map();

  buildIndex(guides: FirstAidGuide[]): void {
    this.clearIndex();

    guides.forEach((guide) => {
      const terms = this.extractTerms(guide);
      const searchIndex: SearchIndex = {
        id: guide.id,
        terms,
        title: guide.title,
        category: guide.category,
        severity: guide.severity,
        relevanceScore: this.calculateBaseRelevance(guide),
      };

      this.index.set(guide.id, searchIndex);
      this.updateTermFrequency(terms);
    });
  }

  private extractTerms(guide: FirstAidGuide): string[] {
    const terms: string[] = [];

    // Extract from title
    terms.push(...this.tokenize(guide.title));

    // Extract from summary
    terms.push(...this.tokenize(guide.summary));

    // Extract from search tags
    guide.searchTags.forEach((tag) => {
      terms.push(...this.tokenize(tag));
    });

    // Extract from content
    if (guide.content) {
      terms.push(...this.extractContentTerms(guide.content));
    }

    // Add category and severity as searchable terms
    terms.push(guide.category.toLowerCase());
    terms.push(guide.severity.toLowerCase());

    // Remove duplicates and return
    return [...new Set(terms)];
  }

  private extractContentTerms(content: GuideContent): string[] {
    const terms: string[] = [];

    // Extract from steps
    content.steps.forEach((step) => {
      terms.push(...this.tokenize(step.title));
      terms.push(...this.tokenize(step.description));
    });

    // Extract from warnings
    content.warnings?.forEach((warning) => {
      terms.push(...this.tokenize(warning));
    });

    // Extract from when to seek help
    content.whenToSeekHelp?.forEach((help) => {
      terms.push(...this.tokenize(help));
    });

    // Extract from prevention tips
    content.preventionTips?.forEach((tip) => {
      terms.push(...this.tokenize(tip));
    });

    return terms;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((term) => term.length > 2);
  }

  private updateTermFrequency(terms: string[]): void {
    terms.forEach((term) => {
      this.termFrequency.set(term, (this.termFrequency.get(term) || 0) + 1);
    });
  }

  private calculateBaseRelevance(guide: FirstAidGuide): number {
    let score = 0;

    // Higher score for critical severity
    const severityScores = {
      critical: 40,
      high: 30,
      medium: 20,
      low: 10,
    };
    score += severityScores[guide.severity] || 0;

    // Bonus for offline availability
    if (guide.isOfflineAvailable) {
      score += 10;
    }

    // Bonus for recent review
    if (guide.lastReviewedAt) {
      const reviewDate = new Date(guide.lastReviewedAt);
      const daysSinceReview = (Date.now() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceReview < 90) {
        score += 10;
      }
    }

    // Bonus for popular guides
    if (guide.viewCount > 1000) {
      score += Math.min(guide.viewCount / 100, 20);
    }

    return score;
  }

  search(query: string, guides: FirstAidGuide[]): SearchResult[] {
    const queryTerms = this.tokenize(query);
    if (queryTerms.length === 0) {
      return [];
    }

    const results: SearchResult[] = [];

    guides.forEach((guide) => {
      const indexEntry = this.index.get(guide.id);
      if (!indexEntry) {
        return;
      }

      const matches = this.findMatches(queryTerms, indexEntry, guide);
      if (matches.length > 0) {
        const score = this.calculateSearchScore(matches, indexEntry, queryTerms);
        results.push({
          guide,
          score,
          matches,
        });
      }
    });

    // Sort by score in descending order
    results.sort((a, b) => b.score - a.score);

    return results;
  }

  private findMatches(
    queryTerms: string[],
    indexEntry: SearchIndex,
    guide: FirstAidGuide
  ): SearchResult['matches'] {
    const matches: SearchResult['matches'] = [];

    queryTerms.forEach((queryTerm) => {
      // Exact match in terms
      if (indexEntry.terms.includes(queryTerm)) {
        matches.push({
          field: 'content',
          term: queryTerm,
          position: 0,
        });
      }

      // Fuzzy match in title
      if (this.fuzzyMatch(queryTerm, indexEntry.title)) {
        matches.push({
          field: 'title',
          term: queryTerm,
          position: indexEntry.title.toLowerCase().indexOf(queryTerm),
        });
      }

      // Check category match
      if (this.fuzzyMatch(queryTerm, indexEntry.category)) {
        matches.push({
          field: 'category',
          term: queryTerm,
          position: 0,
        });
      }

      // Check severity match
      if (queryTerm === indexEntry.severity) {
        matches.push({
          field: 'severity',
          term: queryTerm,
          position: 0,
        });
      }
    });

    return matches;
  }

  private fuzzyMatch(query: string, target: string): boolean {
    const targetLower = target.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match
    if (targetLower.includes(queryLower)) {
      return true;
    }

    // Word boundary match (e.g., "burn" matches "burns" or "burned")
    const words = targetLower.split(/\s+/);
    if (words.some(word => word.startsWith(queryLower) || queryLower.startsWith(word))) {
      return true;
    }

    // Levenshtein distance for fuzzy matching (only for short strings)
    if (queryLower.length <= 10) {
      const distance = this.levenshteinDistance(queryLower, targetLower);
      const threshold = Math.floor(queryLower.length * 0.3);
      return distance <= threshold;
    }

    return false;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) {
      dp[i][0] = i;
    }

    for (let j = 0; j <= n; j++) {
      dp[0][j] = j;
    }

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1,
            dp[i][j - 1] + 1,
            dp[i - 1][j - 1] + 1
          );
        }
      }
    }

    return dp[m][n];
  }

  private calculateSearchScore(
    matches: SearchResult['matches'],
    indexEntry: SearchIndex,
    queryTerms: string[]
  ): number {
    let score = indexEntry.relevanceScore;

    matches.forEach((match) => {
      // Field-specific scoring
      const fieldScores = {
        title: 50,
        category: 30,
        severity: 20,
        content: 10,
      };

      score += fieldScores[match.field as keyof typeof fieldScores] || 5;

      // Position bonus (earlier matches score higher)
      if (match.field === 'title' && match.position >= 0) {
        score += Math.max(0, 20 - match.position);
      }

      // Term frequency bonus (rare terms score higher)
      const termFreq = this.termFrequency.get(match.term) || 1;
      const idf = Math.log(this.index.size / termFreq);
      score += idf * 5;
    });

    // Query completeness bonus
    const matchedTerms = new Set(matches.map((m) => m.term));
    const completeness = matchedTerms.size / queryTerms.length;
    score *= 1 + completeness * 0.5;

    return Math.round(score);
  }

  getTopSearchTerms(limit: number = 10): Array<{ term: string; frequency: number }> {
    const sortedTerms = Array.from(this.termFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term, frequency]) => ({ term, frequency }));

    return sortedTerms;
  }

  getSuggestedSearches(partialQuery: string, limit: number = 5): string[] {
    const partialLower = partialQuery.toLowerCase();
    const suggestions: string[] = [];

    this.termFrequency.forEach((freq, term) => {
      if (term.startsWith(partialLower) && term !== partialLower) {
        suggestions.push(term);
      }
    });

    // Sort by frequency and return top suggestions
    return suggestions
      .sort((a, b) => (this.termFrequency.get(b) || 0) - (this.termFrequency.get(a) || 0))
      .slice(0, limit);
  }

  clearIndex(): void {
    this.index.clear();
    this.termFrequency.clear();
  }

  getIndexSize(): number {
    return this.index.size;
  }
}