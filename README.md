# PV293: Modern Software Architecture with TypeScript

## Overview

This repository contains seminar materials for the PV293 course at Masaryk University, focusing on modern software architecture patterns and principles implemented in TypeScript with NestJS.

The seminars offer a learning path through various architectural paradigms, starting with basic project organization and gradually introducing more patterns, including:

- Clean Architecture
- Vertical Slice Architecture
- Command Query Responsibility Segregation (CQRS)
- Event-Driven Architecture (EDA)
- Microservices Architecture

Throughout the seminars, students will develop an application, applying these architectural patterns to solve real-world problems and understand the advantages and trade-offs of each approach.

## Repository Structure

Each seminar is contained in its own branch, allowing students to progress through the architectural evolution step by step:

- **Seminar 1**: Project initialization with NestJS and TurboRepo
- **Seminar 2**: NestJS fundamentals and basic application structure
- **Seminar 3**: Integrating Postgres/Kysely with our NestJS app
- **Seminar 4-6**: Event Storming sessions
- **Seminar 7**: Modular monolith with Vertical Slices and Clean Architecture
- **Seminar 8**: Implementing CQRS and Event-Driven Architecture
- **Seminar 9**: Implementing Aggregate Root Pattern
- **Seminar 10**: Implementing Message Queues with RabbitMQ
- **Seminar 11**: Converting Modulith to Microservices

## Learning Objectives

These seminar materials aim to:

1. Provide hands-on experience with modern architectural patterns
2. Develop critical thinking about architectural decisions and their implications
3. Build skills for creating maintainable, scalable, and robust applications

## Possible Architectural Enhancements
- Integration of AutoMapper to reduce boilerplate
- Refactor the shared kernel into a proper package within the monorepo
- Enhanced observability with Loki and OpenTelemetry
- Thinking about ditching Kysely module in favor of Drizzle
- The modular monulith solution with RabbitMQ integration is going to be placed in a separate repository as a template, maybe link as a submodule?
- Configuration of separate modules is still suboptimal

## Possible Seminar Enhancements
- Add content on database migration patterns
- Exercises on refactoring a legacy "big ball of mud" application to a more modular structure
- Implement patterns for safely extracting microservices from a monolith using, e.g., the Strangler Fig pattern
- Implement dead letter queues and retry strategies in the RabbitMQ setup
- Add circuit breakers to prevent cascading failures in distributed systems
- Implement rate limiters to protect services from excessive load

## Contributing

Contributions to improve these seminar materials are welcome.

## License

[MIT License](LICENSE)

## Acknowledgments

These materials were developed as part of a Master's thesis at Masaryk University, focused on creating comprehensive learning resources for teaching modern software architecture with TypeScript.
