# Lab Report: JEMMA Authority Routing Evaluation

> **Document ID**: J-LAB-042  
> **Target Subject**: Active Asteroid Discovery and Comet-Like Activity Classification  
> **Principle Verified**: "The Compass precedes the Telescope. Identify jurisdiction before analyzing raw telemetry."  
> **Status**: APPROVED LAB ARTIFACT  

---

## 1. Hypothesis & Objective

### Hypothesis
Pathfinder Aperture can identify and reject unauthorized or inappropriate data sources (*authority-chain mismatch*) before processing high-frequency spatial telemetry, directing the Operator only to the governing cosmic jurisdictions.

### Objective
Given a candidate Active Asteroid under potential citizen-science study, evaluate whether it exhibits genuine cometary sublimation/activity, or is merely subject to background star-galaxy overlaps, PSF truncation, or photographic noise.

---

## 2. Structural Partitioning Model

Rather than diving headfirst into image processing or raw photometry, Pathfinder's Compass separates the investigation into a strict, five-part cognitive stack:

### A. The Claim
The candidate small body (e.g., a Main-Belt Object) is experiencing active mass loss or sublimation (acting as an *Active Asteroid*), indicating a transition from an inert rocky orbit to comet-like activity.

### B. The Evidence
*   **FITS Image Profiles**: Visual inspections showing tail vectors or a diffuse asymmetric coma.
*   **Photometric PSF (Point Spread Function)**: A comparative measurement where the candidate's Full Width at Half Maximum (**FWHM**) is wider than the stellar background profiles of similar magnitude at the same airmass and exposure time.
*   **Signal-to-Noise Ratio (SNR)**: A clear coma detection exceeding standard $3\sigma$ confidence limits.

### C. The Authority Chain (The Primary Verification Gate)
To confirm the orbit and physical characteristics, we reject general stellar catalogs and declare the official, specialized Small-Body chain:

*   **Primary Positional Authority**: **IAU Minor Planet Center (MPC)**. General databases (such as Simbad or NED) are *explicitly excluded* from primary orbit classification as they lack the high-frequency orbital tracking of active minor planets.
*   **Primary Orbital & Physics Authority**: **NASA JPL Solar System Dynamics (SSD) / Small-Body Database (SBDB)**.
*   **Dynamic Classification Metric**: The **Tisserand Parameter ($T_J$)** relative to Jupiter.
    *   $T_J > 3$: Structurally confirmed Main-Belt Asteroid orbit.
    *   $2 < T_J < 3$: Jupiter-Family Comet transition orbit.
    *   $T_J < 2$: Standard Halley-type comet trajectory.
*   **Grounded Methodology Papers**: Standard astrophysical literature on the Active Asteroids survey (e.g., Chandler et al., Jewitt et al.).

### D. The Data (Live Baseline)
*   Physical elements retrieved from the candidate's JPL SPK-ID.
*   Measured FITS photometry lines comparing target PSF profile to surrounding reference stars (background field calibration).

### E. The Uncertainty
*   **Overlapping Geometries**: Is the apparent coma actually a background faint star or galaxy over which the asteroid passed during the exposure? (Star-galaxy overlaps).
*   **Tracking Drift**: Non-sidereal tracking inaccuracies mimicking a comet tail.
*   **Instrument Artifacts**: Charge-coupled device (CCD) bleeding or flat-fielding residues.

---

## 3. The JEMMA Verification Sequence

```text
       [ TELEMETRY INGESTION ] 
                  ↓
       [ JEMMA AUTHORITY AUDIT ]  <-- REJECTS Simbad/NED as non-specialized
                  ↓
       [ ENFORCE COGNITIVE COMPASS ]
           ├─ 1. Pull MPC Ephemeris
           ├─ 2. Query JPL SBDB for SPK-ID
           └─ 3. Calculate Tisserand Parameter (T_J)
                  ↓
       [ EVALUATE PHOTOMETRIC EVIDENCE ]
           ├─ Verify PSF vs. Stars
           └─ Flag Star-Galaxy overlap risk
                  ↓
       [ OCTAGON GOVERNANCE STAMP ]  
                  ↓
       [ OPERATOR SIGN-OFF ]      <-- Human custody check (Doctrine 1)
```

---

## 4. Findings & Verdicts

1.  **Authority Routing Integrity**: Verified. By enforcing a prior jurisdictional check, the system prevents "observational drift" where raw pixel analytics are confused with legitimate physical classification.
2.  **Sovereign Governance Stamp**: The human operator must not sign off on any Active Asteroid proposal or public submission until JEMMA clears the stellar field for *star-galaxy overlap friction*.
3.  **Active Asteroids Boundary**: Real-time classifications of cometary traits are anchored strictly in the $T_J$ parameter retrieved from the JPL Solar System Dynamics API. Inferences derived from generic vision models on ungrounded JPG screen snippets are blocked under Doctrine 2.

---

## 5. Recommended Next Investigation Step

For any active target query:
1.  **SPK-ID Sweep**: Query the JPL Small-Body Database API using the target's provisional designation or name.
2.  **Calculate $T_J$**: Extract semi-major axis ($a$), eccentricity ($e$), and inclination ($i$) to register the exact Tisserand dynamics.
3.  **Cross-Match Ephemerides**: Query the MPC database to confirm if any historical cometary designations or fragmentations have been cataloged at the target's current orbit interval.
4.  **Airmass Noise Filter**: Calibrate the FWHM boundaries against concurrent ground-based observatory atmospheric data.
