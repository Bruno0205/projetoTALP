Feature: Class Management (CRUD) and class-scoped evaluations
  In order to manage teaching groups and keep evaluations scoped per class
  As an instructor or administrator
  I want to create classes, enroll students, and view class-specific evaluations

  Background:
    Given persistent class storage is cleared for this scenario

  Scenario: Create a class and enroll students - happy path
    Given the following students exist:
      | Full Name      | CPF            | Email                |
      | Lucia Martins  | 707.707.707-07 | lucia@example.com    |
      | Rodrigo Alves  | 808.808.808-08 | rodrigo@example.com  |
    When I create a class "Introduction to Programming - 2026 S1" and enroll the students:
      | CPF            |
      | 707.707.707-07 |
      | 808.808.808-08 |
    Then the class "Introduction to Programming - 2026 S1" exists and lists the two enrolled students by CPF

  Scenario: View a class independently shows only its enrollments and evaluations
    Given class "Introduction to Programming - 2026 S1" exists with enrolled student CPF "707.707.707-07"
    And class "Data Structures - 2026 S1" exists with enrolled student CPF "909.909.909-09"
    When I open the class view for "Introduction to Programming - 2026 S1"
    Then only student CPF "707.707.707-07" is displayed
    And evaluations visible are only those recorded for "Introduction to Programming - 2026 S1"

  Scenario Outline: Reject class creation with invalid boundary data
    When I attempt to create a class with Topic "<topic>" and Year <year> and Semester "<sem>"
    Then the creation is accepted "<accepted>" with message "<message>"

    Examples:
      | topic                       | year  | sem | accepted | message                           |
      | Introduction to Programming | 2026  | 1   | true     | "Class created"                   |
      |                             | 2026  | 1   | false    | "Topic is required"               |
      | Algorithms                  | 1800  | 2   | false    | "Year must be within valid range" |
      | Advanced Topics             | 2026  | X   | false    | "Semester must be numeric/valid"  |

  Scenario: Deleting a class removes its evaluations but not global student records
    Given class "Temporary Class - 2026 S1" exists with enrolled student CPF "707.707.707-07" and an evaluation recorded
    When I delete class "Temporary Class - 2026 S1"
    Then the class "Temporary Class - 2026 S1" no longer exists
    And the student with CPF "707.707.707-07" still exists in the global student list
    And evaluations that were scoped to "Temporary Class - 2026 S1" are no longer visible in any class view

  Scenario: Create class with non-existent student fails validation
    Given no student exists with CPF "999.000.111-22"
    When I create a class "Nonexistent Enrollment Test - 2026 S1" and attempt to enroll CPF "999.000.111-22"
    Then the enrollment is rejected with error "Student with CPF 999.000.111-22 does not exist"

  Scenario: Class persistence after reload
    Given I create class "Persistence Test - 2026 S1" and enroll student CPF "707.707.707-07"
    When I reload the class listing
    Then class "Persistence Test - 2026 S1" exists and lists CPF "707.707.707-07" as enrolled

  Scenario: Student-class link persists after restart
    Given student with CPF "808.808.808-08" exists
    And I enroll CPF "808.808.808-08" into class "Link Test - 2026 S1"
    When the system restarts and I open class "Link Test - 2026 S1"
    Then the class lists CPF "808.808.808-08" as enrolled

