import type { StudySubjectWithCurriculum } from "@/study/lib/queries";

type Props = {
  subjects: StudySubjectWithCurriculum[];
};

export function SubjectCurriculumPreview({ subjects }: Props) {
  const withTopics = subjects.filter((s) => (s.curricula[0]?.topics.length ?? 0) > 0);

  if (withTopics.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-[var(--study-muted)]">
        Curriculum topics will appear here after the study seed runs on this environment.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {withTopics.map((subject) => {
        const curriculum = subject.curricula[0];
        const topicCount = curriculum?.topics.length ?? 0;
        const subtopicCount =
          curriculum?.topics.reduce((n, t) => n + t.subtopics.length, 0) ?? 0;
        return (
          <li key={subject.id} className="study-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{subject.name}</h3>
                <p className="mt-1 text-xs text-[var(--study-muted)]">
                  {topicCount} topics · {subtopicCount} subtopics
                  {curriculum && !curriculum.isComplete ? " · partial CAPS slice" : ""}
                </p>
              </div>
              <span className="study-pill study-pill--prototype">Ready for testing</span>
            </div>
            {curriculum?.topics[0] ? (
              <p className="mt-3 text-sm text-[var(--study-muted)]">
                Example focus area:{" "}
                <span className="text-[var(--study-text)]">
                  {curriculum.topics[0].name}
                  {curriculum.topics[0].subtopics[0]
                    ? ` — ${curriculum.topics[0].subtopics[0].name}`
                    : ""}
                </span>
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
