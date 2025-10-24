# Quantum Scrambling Simulator

An interactive web app from Vers3Dynamics that demonstrating the fascinating concepts of Quantum Information Scrambling in Non-Hermitian Systems. This simulator provides a visual and interactive way to explore cutting-edge physics, including Non-Hermitian Out-of-Time-Ordered Correlators (OTOCs), the visualization of Exceptional Points, and mock AI-driven optimization of quantum circuits.

## Core Concepts Explored

This simulator is built around several key concepts from modern quantum physics:

*   **Quantum Information Scrambling:** The process by which local information spreads throughout a complex quantum system, becoming inaccessible locally but preserved globally. It's a key indicator of quantum chaos.
*   **Non-Hermitian Systems:** Quantum systems that exchange energy with their environment (i.e., they have gain or loss). They exhibit unique phenomena not found in closed, energy-conserving (Hermitian) systems.
*   **Out-of-Time-Ordered Correlator (OTOC):** A key measure used to quantify quantum chaos and information scrambling. In this simulator, a faster decrease in the OTOC value signifies more rapid scrambling.
*   **Exceptional Points (EPs):** Special points in the parameter space of a non-Hermitian system where its energy levels (eigenvalues) and corresponding states coalesce. They are singularities with profound physical consequences.

## Features

The application is divided into several interactive tabs, each showcasing a different aspect of the simulated system.

*   **Interactive System Controls:**
    *   Adjust the **Non-Hermitian Strength (γ)** to control the amount of energy gain/loss.
    *   Modify the **Circuit Depth (Time)** to see how the system evolves over longer periods.

*   **NH-OTOC Visualization:**
    *   A real-time plot showing the OTOC value as it evolves over the circuit depth. Observe how scrambling is affected by the system parameters.

*   **Exceptional Point Visualization:**
    *   A scatter plot on the complex plane showing the trajectory of the system's energy levels (eigenvalues) as you vary the non-Hermitian strength `γ`.
    *   Watch as the eigenvalues move, meet, and coalesce at the Exceptional Point.

*   **RL Optimizer (Mock AI):**
    *   Simulates a Reinforcement Learning agent searching for the optimal circuit parameters (`γ` and `depth`) that maximize information scrambling (i.e., achieve the lowest final OTOC value).

*   **Non-Hermitian Parameter Estimator:**
    *   An interactive challenge where you must deduce the hidden `γ` parameter of a mystery system by matching its OTOC data curve with your own.
    *   Includes a mock "Solve with AI" button for an instant solution.
