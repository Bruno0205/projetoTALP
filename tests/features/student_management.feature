Feature: Student Management (CRUD)
  In order to manage students for classes and evaluations
  As an instructor or administrator
  I want to create, read, update and delete student records with clear validation and error handling

  Background:
    Given the system has persistent student storage cleared for this scenario

  Scenario: Create a student - happy path
    Given no student exists with CPF "123.456.789-09"
    When I register a student with:
      | Full Name   | CPF            | Email               |
      | Maria Silva | 123.456.789-09 | maria@example.com   |
    Then the student list shows a record with CPF "123.456.789-09" and Full Name "Maria Silva" and Email "maria@example.com"

  Scenario Outline: Reject registration with invalid or missing fields
    Given no student exists with CPF "<cpf>"
    When I attempt to register a student with:
      | Full Name | CPF       | Email         |
      | <name>    | <cpf>     | <email>       |
    Then the registration is rejected with error "<error>"

    Examples:
      | name        | cpf            | email               | error                                 |
      | João Pedro  |                | joao@example.com    | "CPF is required"                    |
      | Ana Souza   | 111.111.111-1  | ana@example.com     | "CPF format is invalid"              |
      | Paulo       | 222.222.222-22 |                    | "Email is required"                  |
      |             | 333.333.333-33 | invalid-email       | "Full Name is required; Email invalid"|

  Scenario: Prevent duplicate CPF
    Given a student exists with CPF "444.555.666-77" and Email "first@example.com"
    When I attempt to register a student with CPF "444.555.666-77" and Email "second@example.com"
    Then the registration is rejected with error "CPF already exists"

  Scenario: Update student contact information - happy path
    Given a student exists with CPF "555.666.777-88" and Full Name "Carlos Lima" and Email "carlos@old.com"
    When I update the student with CPF "555.666.777-88" to set Email "carlos@new.com"
    Then the student record for CPF "555.666.777-88" shows Email "carlos@new.com"

  Scenario: Delete a student and cascade visibility
    Given the class "Introduction to Programming - 2026 S1" exists with enrolled student CPF "666.777.888-99"
    And a student exists with CPF "666.777.888-99"
    When I delete the student with CPF "666.777.888-99"
    Then the student with CPF "666.777.888-99" no longer appears in the global student list
    And the student is no longer listed as enrolled in class "Introduction to Programming - 2026 S1"

  Scenario: Deleting a student removes their class enrollments but preserves other students
    Given class "Introduction to Programming - 2026 S1" exists with enrolled students:
      | CPF            |
      | 666.777.888-99 |
      | 707.707.707-07 |
    And students exist with CPF "666.777.888-99" and CPF "707.707.707-07"
    When I delete the student with CPF "666.777.888-99"
    Then class "Introduction to Programming - 2026 S1" lists only CPF "707.707.707-07" as enrolled

