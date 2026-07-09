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

function getSkillStatus(record: PracticedSkill | undefined): "completed" | "in-progress" | "not-started" {
  if (!record || record.exercisesCompleted === 0) return "not-started";
  if (isSkillPracticed(record)) return "completed";
  return "in-progress";
}

const STATUS_LABELS: Record<ReturnType<typeof getSkillStatus>, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  "not-started": "Not started",
};

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
  const completedCount = CURRICULUM_SKILLS.filter((skill) =>
    isSkillPracticed(practicedMap.get(skill.id)),
  ).length;

  return (
    <div className={styles.overview}>
      <div className={styles.summaryBar}>
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{completedCount}</span>
          <span className={styles.summaryLabel}>Skills completed</span>
        </div>
        <div className={styles.summaryDivider} aria-hidden="true" />
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{CURRICULUM_SKILLS.length}</span>
          <span className={styles.summaryLabel}>Total in curriculum</span>
        </div>
        <div className={styles.summaryDivider} aria-hidden="true" />
        <div className={styles.summaryMetric}>
          <span className={styles.summaryValue}>{tier1Complete ? "Done" : "Active"}</span>
          <span className={styles.summaryLabel}>Tier 1 foundations</span>
        </div>
      </div>

      <section className={styles.recommendation} aria-labelledby="recommendation-heading">
        <div className={styles.recommendationAccent} aria-hidden="true" />
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

      <div className={styles.curriculumPanel}>
        {!tier1Complete && (
          <div className={styles.infoBanner} role="note">
            <span className={styles.infoBannerIcon} aria-hidden="true">i</span>
            <p className={styles.infoBannerText}>
              Complete Tier 1 skills first for best results.
            </p>
          </div>
        )}

        {TIER_INFO.map((tier) => {
          const skills = CURRICULUM_SKILLS.filter((s) => s.tier === tier.tier);
          const muted = tier.tier > 1 && !tier1Complete;
          const tierCompleted = skills.filter((skill) =>
            isSkillPracticed(practicedMap.get(skill.id)),
          ).length;

          return (
            <section
              key={tier.tier}
              className={`${styles.tierSection} ${muted ? styles.tierMuted : ""}`}
              aria-labelledby={`tier-${tier.tier}-heading`}
            >
              <header className={styles.tierHeader}>
                <div className={styles.tierHeaderMain}>
                  <span className={`${styles.tierPill} ${styles[`tierPill${tier.tier}`]}`}>
                    Tier {tier.tier}
                  </span>
                  <div className={styles.tierHeadingGroup}>
                    <h3 id={`tier-${tier.tier}-heading`} className={styles.tierName}>
                      {tier.name}
                    </h3>
                    <p className={styles.tierDescription}>{tier.description}</p>
                  </div>
                </div>
                <span className={styles.tierProgress}>
                  {tierCompleted}/{skills.length} complete
                </span>
              </header>

              <div className={styles.skillTable}>
                <div className={styles.skillTableHeader} aria-hidden="true">
                  <span>Skill</span>
                  <span>Progress</span>
                  <span>Action</span>
                </div>

                <ul className={styles.skillList}>
                  {skills.map((skill) => {
                    const record = practicedMap.get(skill.id);
                    const status = getSkillStatus(record);

                    return (
                      <li key={skill.id} className={styles.skillRow}>
                        <div className={styles.skillInfo}>
                          <span className={styles.skillName}>{skill.name}</span>
                          <span className={styles.skillDescription}>{skill.description}</span>
                        </div>

                        <div className={styles.skillMeta}>
                          <span
                            className={`${styles.statusBadge} ${styles[`status${status.replace("-", "")}`]}`}
                          >
                            {STATUS_LABELS[status]}
                          </span>
                          {record && record.exercisesCompleted > 0 && (
                            <span className={styles.scoreHint}>
                              {record.exercisesCompleted} exercises · {Math.round(record.averageScore)}% avg
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={styles.practiceButton}
                          onClick={() => onStartSkill(skill.id)}
                        >
                          {status === "completed" ? "Review" : "Practice"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
