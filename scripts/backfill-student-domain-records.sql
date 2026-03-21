INSERT INTO "StudentDomainRecord" (
  "id",
  "studentId",
  "classId",
  "sessionId",
  "termId",
  "punctuality",
  "neatness",
  "politeness",
  "honesty",
  "relationshipWithOthers",
  "handwriting",
  "sportsAndGames",
  "drawingAndPainting",
  "musicalSkills",
  "verbalFluency",
  "createdByTeacherId",
  "createdAt",
  "updatedAt"
)
SELECT
  concat('sdr_', md5(random()::text || clock_timestamp()::text || r."id")) AS "id",
  r."studentId",
  ch."classId",
  ch."sessionId",
  ch."termId",
  CASE lower(coalesce(ads."punctuality", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "punctuality",
  CASE lower(coalesce(ads."neatness", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "neatness",
  CASE lower(coalesce(ads."politeness", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "politeness",
  CASE lower(coalesce(ads."honesty", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "honesty",
  CASE lower(coalesce(ads."relationshipWithOthers", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "relationshipWithOthers",
  CASE lower(coalesce(pds."handwriting", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "handwriting",
  CASE lower(coalesce(pds."sportsAndGames", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "sportsAndGames",
  CASE lower(coalesce(pds."drawingAndPainting", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "drawingAndPainting",
  CASE lower(coalesce(pds."musicalSkills", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "musicalSkills",
  CASE lower(coalesce(pds."verbalFluency", ''))
    WHEN 'excellent' THEN 5
    WHEN 'very good' THEN 4
    WHEN 'good' THEN 3
    WHEN 'fair' THEN 2
    WHEN 'poor' THEN 1
    ELSE NULL
  END AS "verbalFluency",
  ct."teacherId" AS "createdByTeacherId",
  now() AS "createdAt",
  now() AS "updatedAt"
FROM "Result" r
JOIN "StudentClassHistory" ch
  ON ch."id" = r."classHistoryId"
LEFT JOIN "AffectiveDomainScore" ads
  ON ads."resultId" = r."id"
LEFT JOIN "PsychomotorDomainScore" pds
  ON pds."resultId" = r."id"
JOIN "ClassTeacher" ct
  ON ct."classId" = ch."classId"
 AND ct."sessionId" = ch."sessionId"
 AND ct."termId" = ch."termId"
WHERE (ads."id" IS NOT NULL OR pds."id" IS NOT NULL)
  AND NOT EXISTS (
    SELECT 1
    FROM "StudentDomainRecord" sdr
    WHERE sdr."studentId" = r."studentId"
      AND sdr."classId" = ch."classId"
      AND sdr."sessionId" = ch."sessionId"
      AND sdr."termId" = ch."termId"
  );
