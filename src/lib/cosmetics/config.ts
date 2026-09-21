/**
 * Stardust earn amounts — short-loop motivation layered on soft progression.
 */

export const STARDUST_SESSION = 5;
export const STARDUST_FIRST_OF_DAY_BONUS = 5;
export const STARDUST_ORBIT_COMPLETE = 20;
export const STARDUST_WEEKLY_GOAL = 15;
export const STARDUST_PLANET_EVOLUTION = 10;

export const stardustConfig = {
  session: STARDUST_SESSION,
  firstOfDayBonus: STARDUST_FIRST_OF_DAY_BONUS,
  orbitComplete: STARDUST_ORBIT_COMPLETE,
  weeklyGoal: STARDUST_WEEKLY_GOAL,
  planetEvolution: STARDUST_PLANET_EVOLUTION,
} as const;
