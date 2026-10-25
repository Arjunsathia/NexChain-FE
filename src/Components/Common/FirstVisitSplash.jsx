import { AnimatePresence } from "framer-motion";
import Preloader from "./Preloader";

// Split out of App so framer-motion isn't part of the initial bundle
const FirstVisitSplash = ({ show }) => (
  <AnimatePresence mode="wait">{show && <Preloader key="preloader" />}</AnimatePresence>
);

export default FirstVisitSplash;
