Feature: Cross-feature acceptance checks and boundary validations
  In order to ensure system integrity across features
  As a QA engineer
  I want scenarios that validate integration points and error flows

  Scenario: Creating a class with non-existent student fails validation
    Given no student exists with CPF "999.000.111-22"
    When I attempt to create class "Nonexistent Enrollment Test - 2026 S1" and enroll CPF "999.000.111-22"
    Then the enrollment attempt is rejected with error "Student with CPF 999.000.111-22 does not exist"

  Scenario: Persisted evaluations remain class-scoped after student transfer between classes
    Given student with CPF "888.777.666-55" is enrolled in class "OldClass - 2026 S1" with evaluation for "Requirements" = "MPA"
    When I transfer student with CPF "888.777.666-55" from "OldClass - 2026 S1" to "NewClass - 2026 S1"
    Then the evaluation in "OldClass - 2026 S1" remains recorded and visible only in "OldClass - 2026 S1"
    And "NewClass - 2026 S1" does not inherit old evaluations unless explicitly recorded

  Scenario: Bulk import boundary - large class enrollment completes within target time
    Given 500 students exist in the system with unique CPFs
    When I enroll all 500 students into class "Big Cohort - 2026 S1"
    Then the class lists all 500 enrolled CPFs
    And the enroll operation completes within 2000 milliseconds
