import { defineOrbit } from "../defineOrbit";
import type { OrbitDefinition } from "../types";

export const FRIENDSHIPS_PEOPLE_ORBITS: readonly OrbitDefinition[] = [
  defineOrbit({
    orbitKey: "friendships_people_something_feels_off",
    title: "Something Feels Off",
    regionKey: "friendships_people",
    shortDescription: "A friendship has changed, but you aren't sure why.",
    situation: "A friendship has changed, but you aren't sure why.",
    openingTitle: "Something Feels Off",
    openingBody: `Sometimes you notice that something has changed before you can explain exactly what it is.

Maybe there was one moment that shifted things. Maybe nothing obvious happened at all.

This Orbit helps you slow the situation down, separate what you've noticed from what you're assuming, and figure out whether there's something you want to say.

You don't need to know the answer yet.`,
    sortOrder: 1,
    questions: [
      {
        planet: "explore",
        prompt: "What has felt different lately?",
        explanation:
          "Start with what you've actually noticed before deciding what it means.",
      },
      {
        planet: "explore",
        prompt:
          "Was there a moment when you first noticed something felt off? What happened?",
        explanation:
          "A specific moment can help turn a vague feeling into something easier to understand.",
      },
      {
        planet: "express",
        prompt: "How has this situation actually made you feel?",
        explanation:
          "Naming the feeling can reveal why the change matters to you.",
      },
      {
        planet: "explore",
        prompt: "What are you most worried this change might mean?",
        explanation:
          "What happened and what you're afraid it means may be two different things.",
      },
      {
        planet: "stand",
        prompt:
          "If you could ask this person one completely honest question, what would you ask?",
        explanation:
          "An honest question can turn uncertainty into something you could actually communicate.",
      },
      {
        planet: "connect",
        prompt:
          "How could you bring it up without assuming you already know what they're thinking?",
        explanation:
          "You can be honest about what you've noticed while leaving room for their experience.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_left_out",
    title: "Left Out",
    regionKey: "friendships_people",
    shortDescription: "You feel excluded, overlooked, or outside the group.",
    situation: "You feel excluded, overlooked, or outside the group.",
    openingTitle: "Left Out",
    openingBody: `Being left out can make your brain start filling in the blanks very quickly.

Before deciding what everyone else thinks about you, this Orbit helps you understand what happened, what hurt about it, and what you actually want next.`,
    sortOrder: 2,
    questions: [
      {
        planet: "explore",
        prompt: "What happened that made you feel left out?",
        explanation:
          "Start with the event itself before attaching a bigger meaning to it.",
      },
      {
        planet: "express",
        prompt: "What did you feel when it happened?",
        explanation:
          "“Left out” can contain sadness, embarrassment, anger, jealousy, disappointment, or several feelings at once.",
      },
      {
        planet: "explore",
        prompt:
          "What explanation did your mind immediately give you for why it happened?",
        explanation:
          "Your first explanation may feel true even when you don't actually know yet.",
      },
      {
        planet: "stand",
        prompt: "What do you wish had happened instead?",
        explanation:
          "Knowing what you wanted can reveal what you need from the people around you.",
      },
      {
        planet: "connect",
        prompt:
          "Is there someone involved you would actually want to talk to? What would you want them to understand?",
        explanation:
          "Sometimes being understood matters more than proving someone wrong.",
      },
      {
        planet: "connect",
        prompt:
          "What is one thing you could do that might help you feel more connected now?",
        explanation:
          "Your next step does not have to depend completely on what everyone else does.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_i_need_to_fix_this",
    title: "I Need to Fix This",
    regionKey: "friendships_people",
    shortDescription: "You wish you had handled something differently.",
    situation: "You wish you had handled something differently.",
    openingTitle: "I Need to Fix This",
    openingBody: `Sometimes you replay a conversation and know you wish part of it had gone differently.

Repairing something doesn't mean taking responsibility for everything.

It means understanding your part clearly enough to decide what you want to do next.`,
    sortOrder: 3,
    questions: [
      {
        planet: "explore",
        prompt: "What happened, from your point of view?",
        explanation: "Start by understanding your own version of the situation.",
      },
      {
        planet: "explore",
        prompt: "What part do you genuinely wish you had handled differently?",
        explanation: "A meaningful repair begins with something specific.",
      },
      {
        planet: "express",
        prompt: "How do you think the other person may have felt?",
        explanation:
          "Considering their experience can make your response more thoughtful.",
      },
      {
        planet: "connect",
        prompt: "What do you most want them to understand about your side?",
        explanation:
          "Repairing something doesn't require erasing your perspective.",
      },
      {
        planet: "stand",
        prompt:
          "What are you willing to apologize for, and what aren't you apologizing for?",
        explanation:
          "An honest apology is different from taking responsibility just to end a conflict.",
      },
      {
        planet: "connect",
        prompt: "If you talked to them now, what would you actually say?",
        explanation:
          "This turns reflection into something you could use in real life.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_we_keep_having_the_same_fight",
    title: "We Keep Having the Same Fight",
    regionKey: "friendships_people",
    shortDescription: "The same conflict keeps coming back with someone you care about.",
    situation: "The same conflict keeps coming back with someone you care about.",
    openingTitle: "We Keep Having the Same Fight",
    openingBody: `Some arguments end.

Others disappear for a while and then somehow come back looking almost exactly the same.

This Orbit helps you look underneath the latest fight and figure out what keeps repeating.`,
    sortOrder: 4,
    questions: [
      {
        planet: "explore",
        prompt: "What do you usually end up fighting about?",
        explanation: "Start by naming the repeating surface-level issue.",
      },
      {
        planet: "explore",
        prompt: "What usually happens right before the argument gets worse?",
        explanation:
          "Patterns often become clearer when you notice the turning point.",
      },
      {
        planet: "express",
        prompt:
          "What do you feel like the other person doesn't understand about you?",
        explanation:
          "Repeated conflict often contains an unmet need to be understood.",
      },
      {
        planet: "connect",
        prompt:
          "What do you think they might feel like you don't understand about them?",
        explanation:
          "Recurring arguments usually contain two experiences, not one.",
      },
      {
        planet: "stand",
        prompt:
          "What would actually need to change for this fight not to keep happening?",
        explanation:
          "Naming the change you need is different from simply wishing the conflict would stop.",
      },
      {
        planet: "connect",
        prompt:
          "How could you talk about the pattern itself instead of waiting for the next argument?",
        explanation:
          "Sometimes the most useful conversation happens outside the fight.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_growing_apart",
    title: "Growing Apart",
    regionKey: "friendships_people",
    shortDescription: "A friendship is changing or becoming less close.",
    situation: "A friendship is changing or becoming less close.",
    openingTitle: "Growing Apart",
    openingBody: `Not every friendship ends because someone did something wrong.

Sometimes two people simply start changing.

That can still hurt.

This Orbit gives you space to understand what the friendship has meant, what's different now, and what you want to do with that change.`,
    sortOrder: 5,
    questions: [
      {
        planet: "explore",
        prompt: "What feels different about the friendship now?",
        explanation:
          "Naming the change helps you understand what you're responding to.",
      },
      {
        planet: "express",
        prompt: "What do you miss most about how things used to be?",
        explanation:
          "What you miss often reveals what the friendship gave you.",
      },
      {
        planet: "explore",
        prompt:
          "Do you want the friendship to become close again, or do you mostly wish the change didn't hurt?",
        explanation:
          "Those two feelings can seem similar but lead to very different choices.",
      },
      {
        planet: "connect",
        prompt: "What do you think may have changed for the other person?",
        explanation:
          "There may be reasons for the distance that aren't about rejection.",
      },
      {
        planet: "stand",
        prompt:
          "What would you need from this friendship for it to still feel good to you?",
        explanation:
          "History alone doesn't mean a relationship has to work in exactly the same way forever.",
      },
      {
        planet: "explore",
        prompt:
          "What do you want to carry forward from this friendship, even if it keeps changing?",
        explanation:
          "Something can matter without needing to stay exactly as it was.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_the_third_wheel",
    title: "The Third Wheel",
    regionKey: "friendships_people",
    shortDescription: "You feel pushed aside as two friends get closer.",
    situation: "You feel pushed aside as two friends get closer.",
    openingTitle: "The Third Wheel",
    openingBody: `Three-person friendships can get complicated fast.

Two people being close doesn't automatically mean you're being rejected — but feeling pushed to the side still matters.

This Orbit helps you understand what's actually happening and what you need.`,
    sortOrder: 6,
    questions: [
      {
        planet: "explore",
        prompt:
          "When do you notice yourself feeling like the third wheel most?",
        explanation:
          "Specific situations can reveal whether the feeling is occasional or part of a larger pattern.",
      },
      {
        planet: "express",
        prompt: "What does it feel like when that happens?",
        explanation:
          "Naming the feeling helps separate hurt from the assumptions that may follow it.",
      },
      {
        planet: "explore",
        prompt:
          "What do you find yourself assuming about their friendship and your place in it?",
        explanation:
          "Your fear and the actual situation may not be identical.",
      },
      {
        planet: "stand",
        prompt: "What would make the friendship feel more balanced to you?",
        explanation:
          "Knowing what you want gives you something concrete to respond to.",
      },
      {
        planet: "connect",
        prompt:
          "What could you say to one or both of them without asking them to be less close?",
        explanation:
          "You can advocate for your place without treating someone else's closeness as the problem.",
      },
      {
        planet: "connect",
        prompt:
          "What other relationships or connections do you want to invest in too?",
        explanation:
          "Your sense of belonging doesn't have to rest on one friendship dynamic.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_they_hurt_me_but_i_still_care",
    title: "They Hurt Me, But I Still Care",
    regionKey: "friendships_people",
    shortDescription: "Someone you care about hurt you, and you're still figuring out what that means.",
    situation: "Someone you care about hurt you, and you're still figuring out what that means.",
    openingTitle: "They Hurt Me, But I Still Care",
    openingBody: `You can be angry with someone and still care about them.

You can miss someone and still know they crossed a line.

Two things can be true at the same time.`,
    sortOrder: 7,
    questions: [
      {
        planet: "express",
        prompt: "What did they do that hurt you?",
        explanation: "Start by putting the experience into clear words.",
      },
      {
        planet: "explore",
        prompt: "Why did this particular thing hurt as much as it did?",
        explanation:
          "The deeper reason may tell you what mattered most.",
      },
      {
        planet: "explore",
        prompt: "What part of you still wants the relationship?",
        explanation: "Caring about someone doesn't cancel what happened.",
      },
      {
        planet: "stand",
        prompt:
          "What would have to change for you to feel okay moving forward?",
        explanation:
          "Forgiveness and trust don't necessarily require the same things.",
      },
      {
        planet: "connect",
        prompt:
          "What would you want them to understand about the impact of what happened?",
        explanation:
          "Being understood may be part of what you need before moving forward.",
      },
      {
        planet: "connect",
        prompt:
          "What would a healthy next step look like for you right now?",
        explanation:
          "The next step could be talking, creating distance, rebuilding slowly, or simply waiting.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_new_friend_now_what",
    title: "New Friend, Now What?",
    regionKey: "friendships_people",
    shortDescription: "A new friendship is starting, and you're not sure how to move into it.",
    situation: "A new friendship is starting, and you're not sure how to move into it.",
    openingTitle: "New Friend, Now What?",
    openingBody: `Sometimes meeting someone is easy.

Figuring out how a new friendship actually becomes a real friendship can feel less obvious.

This Orbit helps you notice what you like about the connection and how you might keep building it naturally.`,
    sortOrder: 8,
    questions: [
      {
        planet: "explore",
        prompt: "What do you like about being around this person?",
        explanation:
          "Knowing what draws you toward someone helps you understand the connection.",
      },
      {
        planet: "connect",
        prompt: "What have you already connected over?",
        explanation:
          "Shared interests or experiences can give a friendship somewhere to grow.",
      },
      {
        planet: "express",
        prompt:
          "What is something about yourself you'd actually enjoy sharing with them?",
        explanation:
          "Closeness usually grows when people slowly reveal more of themselves.",
      },
      {
        planet: "connect",
        prompt: "What could you invite them to do or talk about next?",
        explanation:
          "Friendships often grow through small repeated moments.",
      },
      {
        planet: "explore",
        prompt: "What are you worried might make things awkward?",
        explanation:
          "Naming the fear can stop it from quietly controlling your behavior.",
      },
      {
        planet: "connect",
        prompt:
          "How could you show interest in the friendship without trying to force it?",
        explanation:
          "Connection grows best when there is room for both people to choose it.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_friend_group_drama",
    title: "Friend Group Drama",
    regionKey: "friendships_people",
    shortDescription: "Tension or conflict is stirring inside your friend group.",
    situation: "Tension or conflict is stirring inside your friend group.",
    openingTitle: "Friend Group Drama",
    openingBody: `When a whole group gets involved, it can become hard to tell what you actually think from what everyone else is saying.

This Orbit helps you step outside the noise and figure out your own position.`,
    sortOrder: 9,
    questions: [
      {
        planet: "explore",
        prompt: "What actually happened, as far as you know?",
        explanation:
          "Group drama grows quickly when facts and retellings start blending together.",
      },
      {
        planet: "explore",
        prompt:
          "Which parts do you know firsthand, and which parts did someone tell you?",
        explanation:
          "Separating those two things can stop you from reacting to something you don't actually know.",
      },
      {
        planet: "express",
        prompt: "How is being caught in this affecting you?",
        explanation:
          "You are allowed to notice the impact of the situation on you too.",
      },
      {
        planet: "stand",
        prompt: "What do you personally think is fair here?",
        explanation:
          "Your position doesn't have to match whichever friend is speaking the loudest.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anyone involved whose perspective you want to understand better?",
        explanation:
          "Understanding does not automatically mean taking their side.",
      },
      {
        planet: "stand",
        prompt: "What role do you actually want to play in this situation?",
        explanation:
          "You can choose whether to mediate, support someone, step away, or refuse to participate in gossip.",
      },
    ],
  }),

  defineOrbit({
    orbitKey: "friendships_people_i_dont_feel_like_myself_around_them",
    title: "I Don't Feel Like Myself Around Them",
    regionKey: "friendships_people",
    shortDescription: "You act differently around them, and it doesn't feel like you.",
    situation: "You act differently around them, and it doesn't feel like you.",
    openingTitle: "I Don't Feel Like Myself Around Them",
    openingBody: `Sometimes you can like people and still notice that you become a different version of yourself around them.

This Orbit helps you notice what you're changing and whether that change actually feels okay to you.`,
    sortOrder: 10,
    questions: [
      {
        planet: "explore",
        prompt:
          "What feels different about you when you're around these people?",
        explanation: "Notice the change before deciding what it means.",
      },
      {
        planet: "express",
        prompt: "What parts of yourself do you hold back?",
        explanation:
          "What you hide can reveal where you don't feel fully comfortable.",
      },
      {
        planet: "explore",
        prompt:
          "What are you worried would happen if you acted more like yourself?",
        explanation:
          "The fear underneath the performance may matter more than the performance itself.",
      },
      {
        planet: "stand",
        prompt: "What part of yourself do you not want to keep shrinking?",
        explanation:
          "Belonging shouldn't always require becoming smaller.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anyone in the group you feel more yourself around? Why?",
        explanation:
          "That relationship may show you what safer connection feels like.",
      },
      {
        planet: "explore",
        prompt:
          "What would feeling more like yourself in this friendship actually look like?",
        explanation:
          "You don't need to become completely unfiltered to become more authentic.",
      },
    ],
  }),
];
