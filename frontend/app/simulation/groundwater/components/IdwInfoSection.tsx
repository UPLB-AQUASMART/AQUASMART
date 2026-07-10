import styles from "./IdwInfoSection.module.css";

export function IdwInfoSection() {
  return (
    <article className={styles.section}>
      <div className={styles.sectionTitle}>
        <h3>Inverse Weight Distancing</h3>
        <p>
          IDW estimates unsampled groundwater values from surrounding monitoring
          wells, helping visualize parameter distribution.
        </p>
      </div>
      <div className={styles.content}>
        <div className={styles.diagram}>
          <span className={styles.wellOne}>
            Well-1
            <br />
            Value: 7.5
          </span>
          <span className={styles.wellTwo}>
            Well-2
            <br />
            Value: 6.8
          </span>
          <span className={styles.wellThree}>
            Well-3
            <br />
            Value: 7.1
          </span>
          <strong>
            Estimated Value
            <br />
            7.2
          </strong>
        </div>
        <div className={styles.scale}>
          <span>High</span>
          <i />
          <span>Low</span>
        </div>
        <div className={styles.notes}>
          {[
            [
              "Spatial Interpolation",
              "Estimates groundwater parameters at unsampled locations using surrounding well data.",
            ],
            [
              "Inverse Distance Weighting",
              "Nearby wells have greater influence; influence decreases with distance.",
            ],
            [
              "Better Decision Making",
              "Improves understanding of subsurface conditions and optimized well placement.",
            ],
          ].map(([title, body]) => (
            <div key={title}>
              <b>{title}</b>
              <span>{body}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.infoStrip}>
        IDW provides smooth, continuous surfaces that help visualize parameter
        distribution and identify potential areas of concern.
      </p>
    </article>
  );
}
