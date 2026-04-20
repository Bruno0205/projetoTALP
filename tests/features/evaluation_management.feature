Feature: Evaluation Management
  In order to record student progress against learning goals
  As an instructor
  I want to view students and mark each goal with standardized codes (MANA, MPA, MA)

  Background:
    Given the system has persistent evaluation storage cleared for this scenario
    And the class "Algorithms - 2026 S1" exists with learning goals:
      | GoalId | Description  |
      | G1     | Requirements |
      | G2     | Tests        |
    And the following students are enrolled in "Algorithms - 2026 S1":
      | Full Name     | CPF            | Email               |
      | Beatriz Costa | 101.101.101-01 | beatriz@example.com |
      | Daniel Rocha  | 202.202.202-02 | daniel@example.com  |

  Scenario: Record a student's evaluation for a single goal - happy path
    Given I am viewing the Evaluation Management for "Algorithms - 2026 S1"
    When I set evaluation for student with CPF "101.101.101-01" and goal "Requirements" to "MA"
    Then the evaluation table shows "MA" for CPF "101.101.101-01" under "Requirements"

  Scenario Outline: Accept only valid evaluation codes
    Given I am viewing the Evaluation Management for "Algorithms - 2026 S1"
    When I set evaluation for student with CPF "<cpf>" and goal "<goal>" to "<code>"
    Then the system responds with "<result>"

    Examples:
      | cpf            | goal         | code  | result                                                            |
      | 101.101.101-01 | Requirements | MA    | "Evaluation recorded"                                             |
      | 202.202.202-02 | Tests        | MPA   | "Evaluation recorded"                                             |
      | 202.202.202-02 | Tests        | XYZ   | "Invalid evaluation code; accepted: MANA, MPA, MA"                 |

  Scenario: Persist evaluations across sessions
    Given the following evaluation exists for class "Algorithms - 2026 S1":
      | CPF            | GoalId | Code |
      | 101.101.101-01 | G1     | MPA  |
    When I reload the Evaluation Management for "Algorithms - 2026 S1"
    Then the evaluation table shows "MPA" for CPF "101.101.101-01" under "Requirements"

  Scenario: Multiple goal updates for same student on same page
    Given I am viewing the Evaluation Management for "Algorithms - 2026 S1"
    When I set evaluation for CPF "101.101.101-01" for "Requirements" to "MA"
    And I set evaluation for CPF "101.101.101-01" for "Tests" to "MPA"
    Then the table shows "MA" under "Requirements" and "MPA" under "Tests" for CPF "101.101.101-01"

  Scenario: Reject evaluation for student not enrolled in class
    Given class "Algorithms - 2026 S1" exists and student with CPF "303.303.303-03" is not enrolled
    When I attempt to set evaluation for CPF "303.303.303-03" for goal "Requirements" to "MPA"
    Then the system rejects the action with error "Student with CPF 303.303.303-03 is not enrolled in Algorithms - 2026 S1"

  Scenario: Reject evaluation for non-existent goal
    Given I am viewing the Evaluation Management for "Algorithms - 2026 S1"
    When I attempt to set evaluation for CPF "101.101.101-01" for goal "G99" to "MA"
    Then the system rejects the action with error "Goal G99 does not exist for Algorithms - 2026 S1"

  Scenario: Reject update in non-existent class
    Given no class exists with name "Nonexistent - 2026 S1"
    When I attempt to set evaluation for CPF "101.101.101-01" in "Nonexistent - 2026 S1" for goal "Requirements" to "MA"
    Then the system rejects the action with error "Class Nonexistent - 2026 S1 does not exist"
