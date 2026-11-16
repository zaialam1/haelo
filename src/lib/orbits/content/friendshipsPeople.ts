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
    openingBody: `You can tell something shifted before you can explain what.

Maybe one weird moment did it. Maybe nothing obvious happened and it still feels different.

Separate what you've noticed from what you're guessing. Then decide if there's anything you want to say.`,
    sortOrder: 1,
    questions: [
      {
        planet: "explore",
        prompt: "What has felt different lately?",
        explanation:
          "Stick to what you've actually seen before deciding what it means.",
      },
      {
        planet: "explore",
        prompt:
          "When did you first clock that something was off? What happened?",
        explanation:
          "A specific moment turns a vague gut feeling into something you can talk about.",
      },
      {
        planet: "express",
        prompt: "What's the feeling you keep coming back to about this?",
        explanation:
          "Saying the feeling out loud can show why the change is sticking with you.",
      },
      {
        planet: "explore",
        prompt: "What's the worst story your brain is telling you about this?",
        explanation:
          "What happened and what you're scared it means can be two different things.",
      },
      {
        planet: "stand",
        prompt:
          "If you could ask this person one completely honest question, what would it be?",
        explanation:
          "An honest question can turn uncertainty into something you could actually say.",
      },
      {
        planet: "connect",
        prompt:
          "How could you bring it up without acting like you already know what they're thinking?",
        explanation:
          "You can be straight about what you've noticed and still leave room for their side.",
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
    openingBody: `Being left out makes your brain invent a whole story fast.

Before you decide what everyone thinks of you, look at what happened, what hurt, and what you want next.`,
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
        prompt: "When it hit you that you were left out, what did that feel like?",
        explanation:
          "\"Left out\" can be sad, embarrassing, angry, jealous, disappointed, or a mix.",
      },
      {
        planet: "explore",
        prompt:
          "What explanation did your mind jump to for why it happened?",
        explanation:
          "Your first explanation can feel true even when you don't actually know yet.",
      },
      {
        planet: "stand",
        prompt: "What do you wish had happened instead?",
        explanation:
          "Knowing what you wanted can show what you need from the people around you.",
      },
      {
        planet: "connect",
        prompt:
          "Is there someone involved you'd actually want to talk to? What would you want them to get?",
        explanation:
          "Sometimes being understood matters more than proving someone wrong.",
      },
      {
        planet: "connect",
        prompt:
          "What's one thing you could do that might help you feel less on the outside right now?",
        explanation:
          "Your next step doesn't have to wait on what everyone else does.",
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

Fixing it doesn't mean taking the blame for everything. It means seeing your part so you can decide what to do next.`,
    sortOrder: 3,
    questions: [
      {
        planet: "explore",
        prompt: "What happened, from your point of view?",
        explanation: "Start with your own version of the situation.",
      },
      {
        planet: "explore",
        prompt: "What part do you genuinely wish you'd handled differently?",
        explanation: "A real apology usually starts with something specific.",
      },
      {
        planet: "express",
        prompt: "How do you think the other person may have felt?",
        explanation:
          "Considering their side can make your response sharper, not softer.",
      },
      {
        planet: "connect",
        prompt: "What do you most want them to understand about your side?",
        explanation:
          "Owning your part doesn't mean erasing your perspective.",
      },
      {
        planet: "stand",
        prompt:
          "What are you willing to apologize for, and what aren't you apologizing for?",
        explanation:
          "An honest apology is different from taking the fall just to end the conflict.",
      },
      {
        planet: "connect",
        prompt: "If you talked to them now, what would you actually say?",
        explanation:
          "This turns the thought spiral into something you could use in real life.",
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

Others disappear for a while and then come back looking almost exactly the same.

Look under the latest fight and see what keeps repeating.`,
    sortOrder: 4,
    questions: [
      {
        planet: "explore",
        prompt: "What do you usually end up fighting about?",
        explanation: "Name the surface issue that keeps coming back.",
      },
      {
        planet: "explore",
        prompt: "What usually happens right before the argument gets worse?",
        explanation:
          "Patterns get clearer when you catch the turning point.",
      },
      {
        planet: "express",
        prompt:
          "What do you feel like the other person still doesn't get about you?",
        explanation:
          "Repeated fights often hide something you want understood.",
      },
      {
        planet: "connect",
        prompt:
          "What might they feel like you still don't get about them?",
        explanation:
          "Recurring arguments usually have two versions, not one.",
      },
      {
        planet: "stand",
        prompt:
          "What would actually need to change for this fight to stop looping?",
        explanation:
          "Saying the change you need is different from wishing the conflict would vanish.",
      },
      {
        planet: "connect",
        prompt:
          "How could you talk about the pattern itself instead of waiting for the next blowup?",
        explanation:
          "Sometimes the useful conversation happens outside the fight.",
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
    openingBody: `Not every friendship ends because someone did something wrong. Sometimes two people just start changing. That can still hurt.

Say what the friendship has meant, what's different now, and what you want to do with that.`,
    sortOrder: 5,
    questions: [
      {
        planet: "explore",
        prompt: "What feels different about the friendship now?",
        explanation:
          "Getting specific about the change helps you know what you're reacting to.",
      },
      {
        planet: "express",
        prompt: "What do you miss most about how things used to be?",
        explanation:
          "What you miss often shows what the friendship gave you.",
      },
      {
        planet: "explore",
        prompt:
          "Do you want it to get close again, or do you mostly wish the change didn't sting?",
        explanation:
          "Those can feel similar and still lead to very different choices.",
      },
      {
        planet: "connect",
        prompt: "What do you think may have changed for the other person?",
        explanation:
          "There may be reasons for the distance that aren't about rejecting you.",
      },
      {
        planet: "stand",
        prompt:
          "What would you need from this friendship for it to still feel good to you?",
        explanation:
          "History alone doesn't mean it has to work the same way forever.",
      },
      {
        planet: "explore",
        prompt:
          "What do you want to keep from this friendship, even if it keeps changing?",
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
    openingBody: `Three-person friendships get complicated fast.

Two people getting closer doesn't automatically mean you're being rejected. Feeling pushed aside still counts.

Look at what's actually happening and what you need.`,
    sortOrder: 6,
    questions: [
      {
        planet: "explore",
        prompt:
          "When do you notice yourself feeling like the third wheel most?",
        explanation:
          "Specific situations show whether it's occasional or a pattern.",
      },
      {
        planet: "express",
        prompt: "What does it feel like when that happens?",
        explanation:
          "Say the feeling out loud so it doesn't quietly turn into a whole story about your worth.",
      },
      {
        planet: "explore",
        prompt:
          "What are you assuming about their friendship and your place in it?",
        explanation:
          "Your fear and the actual situation may not match.",
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
          "You can ask for your place without treating their closeness as the problem.",
      },
      {
        planet: "connect",
        prompt:
          "What other friendships do you want to put energy into too?",
        explanation:
          "You don't have to hang your whole social life on one trio.",
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
    openingBody: `You can be angry with someone and still care about them. You can miss someone and still know they crossed a line.

That doesn't make the next step obvious.`,
    sortOrder: 7,
    questions: [
      {
        planet: "express",
        prompt: "What did they do that hurt you?",
        explanation: "Put the experience into clear words first.",
      },
      {
        planet: "explore",
        prompt: "Why did this particular thing hit as hard as it did?",
        explanation:
          "The reason underneath often shows what mattered most.",
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
          "Forgiving someone and trusting them again aren't always the same ask.",
      },
      {
        planet: "connect",
        prompt:
          "What would you want them to understand about the impact of what happened?",
        explanation:
          "Being understood may be part of what you need before anything else.",
      },
      {
        planet: "connect",
        prompt:
          "What would a solid next step look like for you right now?",
        explanation:
          "That could be talking, creating distance, rebuilding slowly, or just waiting.",
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
    openingBody: `Meeting someone can be easy.

Figuring out how a new friendship actually becomes a real one can feel less obvious.

Say what you like about the connection and how you might keep building it without forcing it.`,
    sortOrder: 8,
    questions: [
      {
        planet: "explore",
        prompt: "What do you like about being around this person?",
        explanation:
          "Knowing what pulls you toward someone helps you understand the connection.",
      },
      {
        planet: "connect",
        prompt: "What have you already connected over?",
        explanation:
          "Shared interests or weird inside jokes give a friendship something to build on.",
      },
      {
        planet: "express",
        prompt:
          "What's something about yourself you'd actually enjoy sharing with them?",
        explanation:
          "Closeness usually grows when people slowly show more of themselves.",
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
          "Saying the fear out loud can stop it from quietly running the show.",
      },
      {
        planet: "connect",
        prompt:
          "How could you show interest without trying to force the friendship?",
        explanation:
          "Connection works better when both people get to choose it.",
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
    openingBody: `When a whole group gets involved, it gets hard to tell what you actually think from what everyone else is saying.

Step outside the noise and find your own position.`,
    sortOrder: 9,
    questions: [
      {
        planet: "explore",
        prompt: "What actually happened, as far as you know?",
        explanation:
          "Group drama grows fast when facts and retellings blend together.",
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
          "It's fair to say what this is doing to you too.",
      },
      {
        planet: "stand",
        prompt: "What do you personally think is fair here?",
        explanation:
          "Your take doesn't have to match whichever friend is talking loudest.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anyone involved whose side you want to understand better?",
        explanation:
          "Understanding someone doesn't automatically mean taking their side.",
      },
      {
        planet: "stand",
        prompt: "What role do you actually want to play in this?",
        explanation:
          "You can mediate, support someone, step away, or refuse to pass gossip.",
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
    openingBody: `Sometimes you can like people and still become a different version of yourself around them.

Look at what you're changing, and whether that change actually feels okay to you.`,
    sortOrder: 10,
    questions: [
      {
        planet: "explore",
        prompt:
          "What feels different about you when you're around these people?",
        explanation: "Name the change before deciding what it means.",
      },
      {
        planet: "express",
        prompt: "What parts of yourself do you hold back?",
        explanation:
          "What you hide can show where you don't feel comfortable.",
      },
      {
        planet: "explore",
        prompt:
          "What are you worried would happen if you acted more like yourself?",
        explanation:
          "The worry underneath may matter more than the performance.",
      },
      {
        planet: "stand",
        prompt: "What part of yourself do you not want to keep shrinking?",
        explanation:
          "Fitting in shouldn't always mean getting quieter or smaller.",
      },
      {
        planet: "connect",
        prompt:
          "Is there anyone in the group you feel more yourself around? Why?",
        explanation:
          "That person may show you what easier connection looks like.",
      },
      {
        planet: "explore",
        prompt:
          "What would feeling more like yourself in this friendship actually look like day to day?",
        explanation:
          "You don't need to say every thought out loud to stop performing.",
      },
    ],
  }),
];
