Feature: Email Notification and Daily Consolidation
  In order to inform students about changes without spamming them
  As the system
  I must consolidate all evaluation changes for a given student across all classes into a single daily email per student

  Background:
    Given the system has an empty outbound email queue at the start of day "2026-04-20"
    And the system time is "2026-04-20T09:00:00"

  Scenario: Single update triggers a daily consolidated email summary (same day) — happy path
    Given student with CPF "111.222.333-44" and Email "mariana@example.com" is enrolled in classes "A - 2026 S1" and "B - 2026 S1"
    When an instructor updates the evaluation for CPF "111.222.333-44" in class "A - 2026 S1" for goal "Requirements" from "MANA" to "MPA" at "2026-04-20T10:00:00"
    Then no immediate email is sent
    And at "2026-04-20T23:59:59" the system sends exactly one email to "mariana@example.com"
    And the email subject contains "Daily evaluation updates"
    And the email body lists:
      | Class        | Goal         | Old  | New  |
      | A - 2026 S1  | Requirements | MANA | MPA  |

  Scenario: Multiple updates across multiple classes for same student consolidated into one email
    Given student with CPF "222.333.444-55" and Email "felipe@example.com" is enrolled in classes "X - 2026 S1" and "Y - 2026 S1"
    When an instructor updates CPF "222.333.444-55" in "X - 2026 S1" for "Requirements" from "MPA" to "MA" at "2026-04-20T09:30:00"
    And an instructor updates CPF "222.333.444-55" in "Y - 2026 S1" for "Tests" from "MANA" to "MPA" at "2026-04-20T14:15:00"
    Then at "2026-04-20T23:59:59" the system sends exactly one email to "felipe@example.com" summarizing both changes
    And the email body contains both changed rows:
      | Class        | Goal         | Old  | New  |
      | X - 2026 S1  | Requirements | MPA  | MA   |
      | Y - 2026 S1  | Tests        | MANA | MPA  |

  Scenario: Multiple updates to the same goal for the same student in the same day reflect the latest value but show change history
    Given student with CPF "333.444.555-66" and Email "alice@example.com" is enrolled in class "Z - 2026 S1"
    When an instructor sets CPF "333.444.555-66" for goal "Tests" in class "Z - 2026 S1" from "MANA" to "MPA" at "2026-04-20T08:00:00"
    And later updates the same goal from "MPA" to "MA" at "2026-04-20T16:00:00"
    Then the email sent at "2026-04-20T23:59:59" for CPF "333.444.555-66" contains a single line for class "Z - 2026 S1" and goal "Tests" showing Old "MANA" and New "MA"
    And the email body includes a note "Intermediate changes consolidated; only first and latest recorded for the day"

  Scenario: No email sent if no evaluations changed for the student that day
    Given student with CPF "444.555.666-77" and Email "bruno@example.com" has no evaluation changes on "2026-04-20"
    When the system time reaches "2026-04-20T23:59:59"
    Then no email is sent to "bruno@example.com"

  Scenario: Email sent once per student per day even if multiple instructors modify evaluations
    Given student with CPF "555.666.777-88" and Email "camila@example.com" is enrolled in classes "C1 - 2026 S1" and "C2 - 2026 S1"
    When Instructor A updates CPF "555.666.777-88" in "C1 - 2026 S1" at "2026-04-20T09:00:00"
    And Instructor B updates CPF "555.666.777-88" in "C2 - 2026 S1" at "2026-04-20T20:00:00"
    Then at "2026-04-20T23:59:59" the system sends exactly one consolidated email to "camila@example.com" summarizing both updates

  Scenario: Edge case — changes spanning midnight produce separate daily emails
    Given student with CPF "666.777.888-99" and Email "diego@example.com" has no prior changes
    When an instructor updates CPF "666.777.888-99" at "2026-04-20T23:50:00"
    And the instructor updates CPF "666.777.888-99" again at "2026-04-21T00:10:00"
    Then the system sends one consolidated email at "2026-04-20T23:59:59" summarizing the first change for "diego@example.com"
    And the system sends a separate consolidated email at "2026-04-21T23:59:59" summarizing the second change for "diego@example.com"

  Scenario: Email summarization excludes unchanged evaluations
    Given student with CPF "777.888.999-00" and Email "ester@example.com" has evaluations
      | Class        | Goal         | Code |
      | L1 - 2026 S1 | Requirements | MA   |
      | L1 - 2026 S1 | Tests        | MPA  |
    When an instructor updates only "Tests" in class "L1 - 2026 S1" for CPF "777.888.999-00" from "MPA" to "MA" at "2026-04-20T11:00:00"
    Then the email sent at "2026-04-20T23:59:59" lists only the changed goal "Tests" and not the unchanged "Requirements"
