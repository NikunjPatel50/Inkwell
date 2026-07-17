"use client";

import { useEffect, useMemo, useState } from "react";
import { WORD_COLLECTIONS } from "../../constants/wordCollections";
import { getWordOfTheDay } from "../../constants/wordOfTheDay";
import { addRecentWord, readRecentWords } from "../../lib/vocabularyLookup";
import { searchWordSuggestionsAsync } from "../../lib/vocabularyClient";
import { isSearchableQuery, searchWordSuggestions } from "../../lib/vocabularySearch";
import styles from "../learning/LearningTab.module.css";

interface VocabHubProps {
  onSelectWord: (word: string) => void;
  onSelectCollection: (collectionId: string) => void;
}

export function VocabHub({ onSelectWord, onSelectCollection }: VocabHubProps) {
  const wordOfDay = useMemo(() => getWordOfTheDay(), []);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  const trimmedQuery = query.trim();
  const showSuggestions = isSearchableQuery(query);
  const localSuggestions = useMemo(
    () => (showSuggestions ? searchWordSuggestions(trimmedQuery) : []),
    [showSuggestions, trimmedQuery],
  );

  useEffect(() => {
    setRecent(readRecentWords());
  }, []);

  useEffect(() => {
    if (!showSuggestions) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestions(localSuggestions);

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setSuggestionsLoading(true);

      void searchWordSuggestionsAsync(trimmedQuery)
        .then((results) => {
          if (!cancelled) setSuggestions(results);
        })
        .catch(() => {
          if (!cancelled) setSuggestions(localSuggestions);
        })
        .finally(() => {
          if (!cancelled) setSuggestionsLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [showSuggestions, trimmedQuery, localSuggestions]);

  const submitWord = (word: string) => {
    const next = word.trim();
    if (!next) return;
    setQuery("");
    setSuggestions([]);
    setRecent(addRecentWord(next));
    onSelectWord(next);
  };

  const dropdownSuggestions = suggestions.filter(
    (word) => word.toLowerCase() !== trimmedQuery.toLowerCase(),
  );

  return (
    <div className={styles.overview}>
      <header className={styles.header}>
        <h2 className={styles.title}>Vocabulary</h2>
        <p className={styles.subtitle}>
          Every word is taught through real sentences — looked up, unpacked, and practiced in context.
        </p>
      </header>

      <div className={styles.searchWrap}>
        <label className={styles.srOnly} htmlFor="vocab-search">
          Search for a word
        </label>
        <input
          id="vocab-search"
          className={styles.searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && trimmedQuery) submitWord(trimmedQuery);
          }}
          placeholder="Search any word — AI-powered lookup"
          autoComplete="off"
          spellCheck={false}
        />
        {showSuggestions && (
          <div className={styles.suggestions} role="listbox" aria-label="Word suggestions">
            <button
              type="button"
              className={`${styles.suggestionItem} ${styles.suggestionPrimary}`}
              role="option"
              onClick={() => submitWord(trimmedQuery)}
            >
              Look up &ldquo;{trimmedQuery}&rdquo;
            </button>
            {suggestionsLoading && dropdownSuggestions.length === 0 && (
              <p className={styles.suggestionLoading}>Finding words…</p>
            )}
            {dropdownSuggestions.map((word) => (
              <button
                key={word}
                type="button"
                className={styles.suggestionItem}
                role="option"
                onClick={() => submitWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        className={styles.wordOfDayCard}
        onClick={() => submitWord(wordOfDay.word)}
      >
        <p className={styles.wordOfDayLabel}>Word of the day</p>
        <p className={styles.wordOfDayWord}>{wordOfDay.word}</p>
        <p className={styles.definition}>
          <span className={styles.posBadge}>{wordOfDay.partOfSpeech}</span>{" "}
          {wordOfDay.definition}
        </p>
        <p className={styles.subtitle}>{wordOfDay.example}</p>
      </button>

      <section aria-labelledby="collections-heading">
        <h3 id="collections-heading" className={styles.sectionHeading}>
          Word collections
        </h3>
        <div className={styles.collectionGrid}>
          {WORD_COLLECTIONS.map((collection) => (
            <article key={collection.id} className={styles.collectionCard}>
              <h4 className={styles.collectionTitle}>{collection.title}</h4>
              <p className={styles.collectionTeaser}>{collection.teaser}…</p>
              <p className={styles.collectionMeta}>{collection.words.length} words</p>
              <button
                type="button"
                className={styles.collectionExplore}
                onClick={() => onSelectCollection(collection.id)}
              >
                Explore
              </button>
            </article>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section aria-labelledby="recent-heading">
          <h3 id="recent-heading" className={styles.sectionHeading}>
            Recently looked up
          </h3>
          <div className={styles.recentChips}>
            {recent.map((word) => (
              <button
                key={word}
                type="button"
                className={styles.recentChip}
                onClick={() => onSelectWord(word)}
              >
                {word}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
