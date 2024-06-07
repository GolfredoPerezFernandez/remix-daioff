"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "./hero-highlight";

export function HeroHighlightDemo() {
  return (
    <HeroHighlight containerClassName="hero-container h-screen flex items-center justify-center">
      <motion.h1
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: [20, -5, 0],
        }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0.0, 0.2, 1],
        }}
        className="text-4xl px-4 md:text-6xl lg:text-5xl font-bold text-neutral-700 dark:text-white max-w-4xl leading-relaxed lg:leading-snug text-center"
      >
        Asistente Virtual Legal Especializado en derecho laboral en España.{" "}
        <Highlight className="text-black dark:text-white">
          Responde tus consultas laborales.
        </Highlight>
      </motion.h1>
    </HeroHighlight>
  );
}
