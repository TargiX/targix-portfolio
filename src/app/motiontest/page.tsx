"use client";

import { AnimatePresence, motion, type Variants } from "motion/react";

const panelVariants = {
  enter: { x: 90, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -90, opacity: 0 },
};

const boxVariants: Variants = {
  rest: { opacity: 0, y: 60 },
  inview: { opacity: 1, y: 0, transition: { duration: 1 } },
};
const hoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.5 },
};
const childUnderline: Variants = {
  rest: { scaleX: 0 },
  hover: { scaleX: 1 },
};

export default function MotionTest() {
  return (
    <div style={{ padding: 40 }}>
      <motion.div
        id="variant-inview-box"
        initial="rest"
        whileInView="inview"
        variants={boxVariants}
        viewport={{ once: false, amount: 0.2 }}
        style={{ width: 100, height: 100, background: "purple" }}
      >
        variant-inview
      </motion.div>
      <motion.div
        id="variant-hover-box"
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={hoverVariants}
        style={{ width: 100, height: 100, background: "orange" }}
      >
        variant-hover
        <motion.span
          id="propagation-underline"
          variants={childUnderline}
          style={{ display: "block", height: 4, background: "black", transformOrigin: "left" }}
        />
      </motion.div>

      {/* Replica of ViewSwitcher: hover card nested inside an AnimatePresence panel with variants */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key="panel"
          variants={panelVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          <motion.div
            id="nested-hover-box"
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={hoverVariants}
            style={{ width: 100, height: 100, background: "magenta", marginTop: 40 }}
          >
            nested-hover
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Replica of ProjectCard: motion.article with a stretched <a> overlay child */}
      <div style={{ position: "relative", marginTop: 40, width: 200 }}>
        <motion.article
          id="overlay-hover-box"
          initial="rest"
          whileHover="hover"
          animate="rest"
          variants={hoverVariants}
          style={{ position: "relative", height: 100, background: "teal", overflow: "hidden" }}
        >
          overlay-hover
          <a
            href="#"
            aria-label="stretched"
            style={{ position: "absolute", inset: 0, zIndex: 10 }}
          />
        </motion.article>
      </div>
      <motion.div
        id="initial-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ width: 100, height: 100, background: "red" }}
      >
        initial
      </motion.div>

      <div style={{ height: "150vh" }} />

      <motion.div
        id="inview-box"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 1 }}
        style={{ width: 100, height: 100, background: "blue" }}
      >
        inview
      </motion.div>

      <div style={{ height: "50vh" }} />

      <motion.div
        id="hover-box"
        whileHover={{ scale: 1.5 }}
        style={{ width: 100, height: 100, background: "green" }}
      >
        hover
      </motion.div>
    </div>
  );
}
