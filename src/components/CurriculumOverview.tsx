import {
  CURRICULUM_SKILLS,
  getSkillById,
  TIER_INFO,
} from "../constants/curriculum";
import { getAdaptiveRecommendation, hasCompletedTier, isSkillPracticed } from "../lib/adaptiveEngine";
import type { AdaptiveRecommendation, PracticedSkill, SkillPatternRow } from "../types";
import styles from "./CurriculumOverview.module.css";

interface CurriculumOverviewProps {
  skillPatterns: SkillPatternRow[];
  practiced: PracticedSkill[];
  onStartSkill: (skillId: string) => void;
}

export function CurriculumOverview({
  skillPatterns,
  practiced,
  onStartSkill,
}: CurriculumOverviewProps) {
  const recommendation: AdaptiveRecommendation = getAdaptiveRecommendation(
    skillPatterns,
    practiced,
  );
  const recommendedSkill = getSkillById(recommendation.skillId);
  const practicedMap = new Map(practiced.map((p) => [p.skillId, p]));
  const tier1Complete = hasCompletedTier(practiced, 1);

  return (
    <div className={styles.overview}>
      <section className={styles.recommendation} aria-labelledby="recommendation-heading">
        <div className={styles.recommendationBody}>
          <h2 id="recommendation-heading" className={styles.recommendationTitle}>
            Recommended for you
          </h2>
          {recommendedSkill && (
            <>
              <p className={styles.recommendationSkill}>{recommendedSkill.name}</p>
              <p className={styles.recommendationReason}>{recommendation.reason}</p>
            </>
          )}
        </div>
        {recommendedSkill && (
          <button
            type="button"
            className={styles.startButton}
            onClick={() => onStartSkill(recommendation.skillId)}
          >
            Start this skill
          </button>
        )}
      </section>

      <div className={styles.curriculumBody}>
        {!tier1Complete && (
          <p className={styles.tierNote}>Complete Tier 1 skills first for best results.</p>
        )}

        {TIER_INFO.map((tier) => {
        const skills = CURRICULUM_SKILLS.filter((s) => s.tier === tier.tier);
        const muted = tier.tier > 1 && !tier1Complete;

        return (
          <section
            key={tier.tier}
            className={`${styles.tierSection} ${muted ? styles.tierMuted : ""}`}
            aria-labelledby={`tier-${tier.tier}-heading`}
          >
            <div className={styles.tierHeader}>
              <span className={`${styles.tierPill} ${styles[`tierPill${tier.tier}`]}`}>
                Tier {tier.tier}
              </span>
              <div>
                <h3 id={`tier-${tier.tier}-heading`} className={styles.tierName}>
                  {tier.name}
                </h3>
                <p className={styles.tierDescription}>{tier.description}</p>
              </div>
            </div>

            <ul className={styles.skillList}>
              {skills.map((skill) => {
                const record = practicedMap.get(skill.id);
                const practicedFlag = isSkillPracticed(record);

                return (
                  <li key={skill.id} className={styles.skillRow}>
                    <div className={styles.skillInfo}>
                      <span className={styles.skillName}>
                        {skill.name}
                        {practicedFlag && (
                          <span className={styles.practicedDot} aria-label="Practiced" title="Practiced">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className={styles.skillDescription}>{skill.description}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.practiceLink}
                      onClick={() => onStartSkill(skill.id)}
                    >
                      Practice
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      </div>
    </div>
  );
}
