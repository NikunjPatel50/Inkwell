"use client";

import { useEffect, useMemo, useRef, useState, type TransitionEvent } from "react";
import { WORD_COLLECTIONS } from "../../constants/wordCollections";
import { addRecentWord, normalizeWord, readRecentWords } from "../../lib/vocabularyLookup";
import { searchWordSuggestionsAsync } from "../../lib/vocabularyClient";
import { isSearchableQuery, isValidWordLookup, searchWordSuggestions } from "../../lib/vocabularySearch";
import { WordDetailExpandCard } from "./WordDetailExpandCard";
import styles from "../learning/LearningTab.module.css";

interface VocabHubProps {
  onSelectCollection: (collectionId: string) => void;
}

export function VocabHub({ onSelectCollection }: VocabHubProps) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [detailWord, setDetailWord] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const pendingCloseRef = useRef(false);

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

  const openWordDetail = (word: string) => {
    const next = normalizeWord(word.trim());
    if (!next) return;
    setQuery("");
    setSuggestions([]);
    setRecent(addRecentWord(next));
    if (detailWord === next && detailOpen) {
      closeWordDetail();
      return;
    }
    pendingCloseRef.current = false;
    setDetailWord(next);
    setDetailOpen(true);
  };

  const closeWordDetail = () => {
    pendingCloseRef.current = true;
    setDetailOpen(false);
  };

  const clearWordDetail = () => {
    setDetailWord(null);
    pendingCloseRef.current = false;
  };

  const handleLayoutTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== "grid-template-columns") return;
    if (!detailOpen && pendingCloseRef.current) {
      clearWordDetail();
    }
  };

  const submitWord = (word: string) => {
    if (!isValidWordLookup(word)) return;
    openWordDetail(word);
  };

  const canSubmitQuery = isValidWordLookup(trimmedQuery);

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

      <div
        className={`${styles.hubLayout} ${detailWord ? styles.hubLayoutHasDetail : ""} ${detailOpen ? styles.hubLayoutDetailOpen : ""}`}
        onTransitionEnd={handleLayoutTransitionEnd}
      >
        <div className={styles.hubMain}>
          <div className={styles.searchWrap}>
            <label className={styles.srOnly} htmlFor="vocab-search">
              Search for a word
            </label>
          <div className={styles.searchRow}>
            <input
              id="vocab-search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && canSubmitQuery) submitWord(trimmedQuery);
              }}
              placeholder="Search any English word or phrase"
              autoComplete="off"
              spellCheck={false}
              aria-describedby="vocab-search-hint"
            />
            <button
              type="button"
              className={styles.searchButton}
              onClick={() => submitWord(trimmedQuery)}
              disabled={!canSubmitQuery}
            >
              Look up
            </button>
          </div>
          <p id="vocab-search-hint" className={styles.searchHint}>
            Look up any English word — common, rare, or technical. AI generates the full entry.
          </p>
          {showSuggestions && (
            <div className={styles.suggestions} role="listbox" aria-label="Word suggestions">
              <button
                type="button"
                className={`${styles.suggestionItem} ${styles.suggestionWord}`}
                role="option"
                onClick={() => submitWord(trimmedQuery)}
              >
                <span className={styles.suggestionWordTitle}>{trimmedQuery}</span>
                <span className={styles.suggestionWordMeta}>
                  View definition, examples, synonyms & practice
                </span>
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
                    onClick={() => openWordDetail(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {detailWord && (
          <aside
            className={styles.hubDetailSlot}
            aria-label="Word detail"
            onClick={closeWordDetail}
          >
            <div
              className={styles.hubDetailInner}
              onClick={(event) => event.stopPropagation()}
            >
              <WordDetailExpandCard
                key={detailWord}
                word={detailWord}
                open={detailOpen}
                onClose={closeWordDetail}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
