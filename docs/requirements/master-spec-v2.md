BAYSE — MASTER PRODUCT & DEVELOPMENT SPECIFICATION

Version 2.0 — Consolidated Master Brief
Platform: BAYSE Women’s Fitness, Pilates, Nutrition & Community
Development: Claude Code + Private GitHub Repository
Build approach: Mobile-first, integrated, scalable and production-ready

⸻

1. BUSINESS VISION

Build BAYSE as a premium women’s fitness, nutrition, coaching and community platform, connected to BAYSE’s existing physical Pilates studios.

The goal is to create something significantly more valuable than a workout video library.

Members should feel that BAYSE provides:

* Personalised fitness and Pilates programmes
* Live, interactive classes with real instructors
* An extensive on-demand workout library
* Practical nutrition guidance and meal planning
* Coaching and accountability
* Women’s wellness education
* Meaningful friendships and local communities
* Member-organised padel, walking and social clubs
* Progress tracking and positive encouragement
* A seamless connection between online workouts and physical studios

Brand proposition:

YOUR PROGRAMME. YOUR COACH. YOUR PEOPLE.

The platform must work both as a standalone digital subscription business and as a membership benefit and retention system for existing BAYSE studio members.

Commercial objectives

1. Improve retention across existing BAYSE studios.
2. Increase customer engagement and class attendance.
3. Create recurring digital subscription revenue.
4. Build a scalable community of women.
5. Increase long-term member value.
6. Generate new leads for BAYSE’s physical studios.
7. Create a platform that could eventually serve an international audience.

Design and product benchmarks

* Marchon Training: structured programmes, onboarding, progress, coaching
* Peloton: premium live class experience and instructor personalities
* Pilates Anytime: extensive on-demand Pilates content
* Sweat: broader women’s fitness membership
* Noom: behavioural support and sustainable healthy habits

Use these as functional and quality references, not designs to reproduce.

2. NON-NEGOTIABLE PRODUCT PRINCIPLES

Personalisation: Every member gets an experience relevant to their goals, preferences and training history.

Community-first: Real connection is a central product function, not an afterthought.

Low operating workload: Automate repetitive tasks. Let members coordinate their own activities.

Hybrid membership: Digital and in-person experiences should reinforce each other.

Scalable infrastructure: The platform should work for hundreds or tens of thousands of members without architectural redesign.

Simple member experience: Make a powerful product feel effortless to use.

Safe and respectful: Protect sensitive information, provide accessible wellness guidance and moderate member interactions.

Real functionality: Do not present fake features, simulated integrations or decorative buttons as finished functionality.

3. BRAND AND DESIGN DIRECTION

Build a sophisticated women’s wellness application.

The experience should feel like an exclusive boutique wellness club rather than a traditional gym app.

Visual identity

* Premium, minimal and modern
* Soft ivory, cream, stone, taupe and warm neutral colours
* Dark charcoal accents
* Beautiful editorial fitness photography
* Refined typography
* Generous spacing
* Elegant rounded cards
* Subtle animation and transitions
* Clean icons and strong visual hierarchy

Use existing official BAYSE brand assets where provided. Do not invent a replacement logo and present it as approved.

Interface requirements

* Mobile-first
* iPhone and Android responsive
* Tablet and desktop compatible
* Consistent design system
* Light and dark theme support where feasible
* Accessible contrast and controls
* Smooth navigation
* Loading, empty and error states
* Polished video playback

Initial delivery should be a responsive web app, capable of becoming a progressive web app.

Keep the backend suitable for later native mobile applications.

4. PRIMARY NAVIGATION

Keep the main mobile navigation simple.

Recommended bottom navigation:

1. Today
2. Train
3. Live
4. Community
5. You

Nutrition, Coaching, Wellness, Progress and My Clubs should be prominent destinations accessible through the home dashboard, contextual navigation and profile.

Do not overcrowd the bottom navigation with eight or more tabs.

Today

Personal daily dashboard.

Train

On-demand workouts and training programmes.

Live

Interactive classes, schedule and bookings.

Community

Local studio groups, BAYSE Clubs, challenges and member discussions.

You

Profile, nutrition, coaching, wellness, progress, preferences and account management.

5. USER TYPES AND ACCESS

Implement secure role-based access.

Visitor: Browse public website, programmes, testimonials and pricing.

Trial Member: Access selected introductory content, trial live sessions and a welcome community.

Digital Member: Access content and features included in their digital subscription.

Studio Member: Access studio-linked benefits and local community, according to their existing membership entitlements.

Hybrid Member: Has both physical studio and applicable digital access.

Instructor / Coach: Manage teaching, assigned members and authorised communications.

Community Moderator: Handle member reports and safety concerns.

Studio Manager: Manage relevant studio-linked membership and community information, with minimal routine workload.

Administrator: Manage the full digital business.

Super Administrator: Manage permissions, critical settings and system-wide operations.

Enforce permissions on the server and database, not only in frontend screens.

6. COMPLETE PERSONALISED ONBOARDING

Create a premium, Marchon-inspired onboarding experience.

Use one main question per screen, a progress indicator and clear navigation.

Persist progress and allow users to return later.

Screen-by-screen flow

1. Welcome

Introduce BAYSE as a personal women’s fitness and wellness club.

Call to action: Build My Plan.

2. Name

Collect preferred name and public community display name.

3. Main Goals

Allow multiple selections:

* Build strength and tone
* Improve general fitness
* Develop core strength
* Improve posture
* Improve mobility
* Build confidence
* Develop healthier eating habits
* Support a healthy weight
* Become more consistent
* Feel better day to day

4. Training Experience

New, beginner, intermediate or advanced.

5. Preferred Training

Mat Pilates, reformer, strength, sculpt, mobility, walking or a combination.

6. Available Equipment

Mat, weights, resistance bands, Pilates accessories, reformer or none.

7. Weekly Availability

Ask how many sessions the member can realistically complete.

8. Workout Duration

10–15, 20–30, 30–45, 45–60 minutes or flexible.

9. Preferred Coaching

Live group classes, on-demand sessions, structured plans, instructor messaging or a mixture.

10. Nutrition Goals

Optional selections:

* Eat more balanced meals
* Increase protein intake
* Learn how to cook healthy meals
* Plan meals more easily
* Improve eating habits
* Seek professionally guided weight management
* Not interested right now

11. Dietary Preferences

Optional dietary pattern, allergies, foods to avoid, budget, household size and cooking time.

Clearly distinguish preferences from health conditions.

12. Women’s Wellness

Optional interests:

* General wellbeing
* Stress and sleep
* Menstrual health education
* Perimenopause
* Menopause
* Pregnancy or postpartum guidance
* Mobility and recovery
* Prefer not to answer

13. Community Interests

Padel, walking, Pilates friendships, coffee socials, accountability and local meetups.

14. Home Studio

Allow existing members to select their BAYSE studio.

Digital-only members can choose a general community or nearby participating location.

15. Personalised Programme

Use onboarding answers to produce a recommended training journey with an explanation.

16. Account Creation

Secure login and member profile.

17. Membership Selection

Display eligible plans, studio benefits, trial details and pricing.

18. Payment

Stripe checkout where required.

19. Welcome Dashboard

Show an actionable first workout, coach introduction and community invitation.

Members must be able to skip sensitive questions and edit their answers later.

7. PERSONALISED TODAY DASHBOARD

This is the centre of the app.

A member opening BAYSE should immediately know what they should do.

Required elements

* Personal greeting
* Active training programme
* Today’s recommended workout
* Upcoming live class
* Weekly completion progress
* Consistency indicator
* Coach message
* Nutrition inspiration
* Community updates
* Local BAYSE Club activities
* Upcoming studio booking, if integrated
* Optional wellness check-in

Example

Good morning, Sophie.

Week 2 — Strong & Sculpt.

Today’s workout: Full Body Pilates, 30 minutes.

Next live class: Tomorrow at 9 AM.

Your community: A padel match near your studio needs one more player.

Nutrition: Your suggested dinner recipe is ready.

Weekly progress: Two of three planned sessions completed.

All information must reflect real member data.

8. ON-DEMAND WORKOUT LIBRARY

On-demand is mandatory for the first working release.

It is not a later optional feature.

Categories

* Mat Pilates
* Reformer Pilates
* Beginner Pilates
* Full Body Sculpt
* Strength Training
* Core and Abs
* Glutes and Lower Body
* Upper Body
* Mobility
* Recovery
* Stretching
* Express Workouts
* Walking Support
* Women’s Wellness Movement
* Programme Workouts
* Replays of approved live classes

Required capabilities

Search and filter by:

* Duration
* Difficulty
* Instructor
* Equipment
* Workout type
* Body area
* Goal
* Programme

Support:

* Secure streaming
* Adaptive video playback
* Full-screen mode
* Captions where provided
* Playback speed
* Watch history
* Resume playback
* Favourites
* Saved workouts
* Add to plan
* Completion tracking
* Suggested next workout

Initial content target: 30–50 high-quality classes.

Build a content management system that can grow to hundreds or thousands.

Use secure professional video infrastructure such as Mux or another suitable provider.

9. LIVE INTERACTIVE CLASSES

The live experience should feel closer to personal coaching than passive video streaming.

Initial solution

Integrate Zoom into the member booking process.

The member should book directly through BAYSE.

Required features

* Live timetable
* Class descriptions
* Instructor profiles
* Date and time filters
* Local timezone display
* Class capacity
* Book and cancel
* Waiting lists
* Automatic reminders
* Secure class joining
* Attendance tracking
* Post-class feedback
* Progress integration

Class formats

* Live Mat Pilates
* Live Reformer Pilates
* Strength and Sculpt
* Beginner Foundations
* Mobility and Recovery
* Specialist sessions subject to professional oversight

Interactive features

Members may choose to use cameras and interact with instructors.

Instructors can provide verbal cues and modifications.

Explain that remote instruction cannot provide the same physical assessment as in-person coaching.

Recordings

Support publishing approved instructor-focused live recordings into the on-demand library.

Recordings must not expose participants without appropriate consent.

10. PERSONALISED PROGRAMMES

Provide structured programmes instead of leaving members to choose random workouts.

Launch pathways

Pilates Foundations

Beginner-focused progression.

Strong & Sculpt

Pilates combined with appropriate strength work.

Reformer Progression

Progressive reformer training for members with equipment access.

Core & Posture

Core strength and general posture education.

Mobility & Restore

Mobility and recovery.

Healthy Habits

Movement, practical nutrition education and habit consistency.

Move More

Gentle movement and walking consistency.

Additional professionally reviewed women’s wellness pathways may follow.

Programme functionality

* Four-, six-, eight- or twelve-week plans
* Weekly training calendar
* Assigned on-demand workouts
* Optional live sessions
* Recovery days
* Workout substitutions
* Progression tracking
* Instructor notes
* Weekly check-ins
* Programme changes

Use sensible training recommendations based on member preferences and capabilities.

Do not claim AI personalisation is medically validated.

11. NUTRITION

Nutrition is a major product pillar.

Do not turn BAYSE into a restrictive dieting app.

Provide practical tools for helping members build sustainable eating habits.

Nutrition homepage

Display:

* Suggested meals
* Weekly meal plan
* Recipe recommendations
* Shopping list
* Nutrition education
* Habit check-ins
* Access to relevant coaching

Recipe library

Each recipe contains:

* Ingredients
* Portions
* Preparation time
* Cooking time
* Cooking instructions
* Approximate nutrition information where validated
* Dietary tags
* Allergens
* Save and favourite actions

Meal planning

Members can create flexible meal plans using:

* Dietary preferences
* Available cooking time
* Budget
* Household size
* Preferred foods
* Optional goals

Shopping lists

Automatically generate shopping lists from selected recipes.

Allow edits, quantities and completed-item tracking.

Weight-management support

Allow members to opt into appropriate healthy weight-management programmes.

Include:

* Balanced meal planning
* Nutrition education
* Sustainable routines
* Activity consistency
* Habit coaching
* Optional private progress tracking
* Access to appropriately qualified nutrition professionals

Avoid crash diets, extreme calorie restrictions, body-shaming language and public weight comparisons.

Personalised medical nutrition advice requires appropriate professional involvement.

Future enhancements

* Food-photo logging
* Food diary
* Barcode scanning
* Dietary pattern insights
* Dietitian consultations
* More sophisticated nutrition coaching

Do not launch medical nutrition functionality without appropriate professional and legal review.

12. WOMEN’S WELLNESS

Build an education and wellness hub.

Areas may include:

* Menstrual health education
* Perimenopause and menopause
* General strength and mobility
* Pregnancy and postpartum education
* Sleep
* Stress management
* Recovery
* Healthy routines

Optional check-ins can record self-reported energy, sleep quality and wellbeing.

Sensitive answers must be private, minimised and appropriately consented to.

Specialist content must be professionally reviewed.

Do not infer diagnoses or provide unsupported treatment recommendations.

13. COACHING

Give members the feeling of having a real coach.

Coaching profiles

Show:

* Instructor photo
* Biography
* Qualifications
* Areas of expertise
* Classes and programmes taught

Group coaching

* Programme-specific coaching groups
* Instructor announcements
* Group questions
* Weekly guidance
* Encouragement and accountability

Individual coaching

Available to eligible higher-tier memberships.

Features:

* Secure messages
* Defined check-in cadence
* Progress feedback
* Programme questions
* Optional scheduled consultations

Coach availability and response expectations must be clearly stated.

Do not promise unlimited individual coaching.

Coach administration

Allow authorised coaches to:

* View assigned members
* Respond to messages
* Manage programme groups
* Publish coaching notes
* See relevant training progress
* Manage teaching schedules

Apply strict member privacy permissions.

14. COMMUNITY — A CORE RETENTION ENGINE

BAYSE Community is a fundamental business feature.

The objective is to create real relationships among members, particularly those attending physical BAYSE studios.

A member who enjoys classes, knows other members and participates in friendships or shared activities may have more reasons to remain part of BAYSE.

This is a retention hypothesis that must be measured.

Community structure

Global BAYSE Community

A broader digital group for online members.

Local Studio Communities

A dedicated community for each BAYSE studio.

Programme Communities

Members following the same training pathway.

BAYSE Circles

Smaller groups based on interests and preferences.

BAYSE Clubs

Member-organised activities outside normal Pilates classes.

Core community functionality

* Member profiles
* Posts
* Comments
* Reactions
* Photos
* Group conversations
* Club discovery
* Challenges
* Member introductions
* Reporting
* Blocking
* Moderation

Do not share personal health data in community profiles.

15. BAYSE CLUBS — SELF-ORGANISED MEMBER ACTIVITIES

This is a major feature.

The operating principle is that members organise activities themselves.

BAYSE should not need employees managing every walk, padel match or coffee gathering.

BAYSE Padel Club

Members can:

* Create padel matches
* Specify ability level
* Select a public court or venue
* Choose time and date
* Set number of available places
* Invite interested members
* Join matches
* Leave matches
* Join waiting lists
* Organise doubles
* Discuss details in a group conversation

Where external court booking is required, members arrange it directly unless a supported integration is added.

BAYSE is not responsible for booking every court.

BAYSE Walk Club

Members can:

* Suggest group walks
* Set public meeting locations
* Select times
* Indicate approximate walking difficulty
* Join or leave
* Message participants
* Suggest recurring walks

BAYSE Social Club

Members can organise:

* Coffee meetups
* Brunches
* Social gatherings
* Other appropriate public activities

Members select the venue, time, capacity and details.

BAYSE does not act as a central event organiser.

BAYSE Circles

Create smaller member groups focused on:

* Home studio
* Shared interests
* Similar class schedules
* Beginner support
* Accountability
* Training goals

Allow introductions, group messaging and optional connections.

Automatic activity discovery

Members should see relevant activities based on:

* Home studio
* Chosen location or radius
* Interests
* Optional ability level
* Availability

Do not expose precise home locations.

Automated coordination

The app must manage:

* RSVPs
* Capacity
* Waiting lists
* Cancellation updates
* Notifications
* Reminders
* Group discussions
* Participant lists
* Event expiration
* Optional recurring activities

Member-created activity workflow

1. Member taps Create Activity.
2. Selects Padel, Walk or Social.
3. Adds public venue, time, description and capacity.
4. Publishes activity.
5. Interested members receive relevant notifications.
6. Members join.
7. App manages places and waiting list.
8. Group conversation opens.
9. Automated reminders are delivered.
10. Activity ends and can be repeated.

Safety and moderation

Implement:

* Adults-only participation for the initial community
* Reporting and blocking
* Venue safety guidance
* Member privacy controls
* Content moderation
* Activity removal
* Account restrictions
* Optional event host verification
* Appropriate escalation of serious reports

User-generated events should not require routine manual approval, unless risk controls flag a concern.

BAYSE still needs clear terms, safeguarding processes, and human oversight for reports and serious issues.

Removed feature

Do not build BAYSE Wellness Club.

Do not introduce centrally organised nutrition workshops, cooking workshops, guest-speaker programmes or BAYSE-managed wellness events as a club category.

Nutrition and women’s wellness remain digital content and coaching features, not staff-organised social events.

16. COMMUNITY CHALLENGES

Create positive group challenges.

Examples:

* Three sessions each week
* A month of Pilates consistency
* Daily movement
* Group walking goals
* Mobility routines
* Recipe sharing
* Community participation

Members may join voluntarily.

Track participation and celebrate completions.

Avoid punitive streaks, weight-loss leaderboards and body comparisons.

17. EXISTING BAYSE STUDIO INTEGRATION

This section is essential.

The app must support the physical BAYSE business, not compete with it.

Member recognition

Allow existing studio members to link their studio membership.

Where a supported integration exists, synchronise verified member status, bookings and attendance.

Do not assume the current studio booking provider has an accessible API. First verify its capabilities.

Local community

Members should automatically be offered access to their home studio community when eligibility is verified.

Studio-to-digital connection

Studio members can:

* Train at home
* Access selected on-demand sessions
* Join local clubs
* Participate in challenges
* Connect with fellow members
* See studio-related updates
* Continue their routine while travelling

Digital-to-studio connection

Digital subscribers near BAYSE locations can discover available physical studios and relevant offers.

Do not merge customer memberships without permission.

Retention opportunities

Use engagement data to identify opportunities for appropriate support.

Examples:

* Member hasn’t attended recently
* Member has stopped booking
* Member is struggling with consistency
* Member requests help
* Member is considering cancellation

Avoid treating a preference not to socialise as a churn risk by itself.

18. RETENTION AUTOMATIONS

Connect this system with BAYSE’s existing attendance-based retention approach where technically feasible.

Preserve existing operational thresholds unless explicitly changed.

Existing retention reference

The existing system includes an amber monitoring stage and a red intervention at approximately 16 days without attendance.

Verify the actual live business rules and data before connecting automations.

Digital engagement signals

Track:

* Programme participation
* Workout completions
* Live bookings
* Class attendance
* Inactivity
* Member feedback
* Cancellation requests

Community participation may provide additional context but should not be mandatory or treated as a measure of member loyalty.

Automated member journeys

New member: Welcome, onboarding completion and first-session encouragement.

First week: Offer relevant classes and local community introductions.

First month: Celebrate progress and invite optional activities.

Declining attendance: Supportive reminder and suggested classes.

Sustained inactivity: Trigger the existing appropriate retention workflow.

Cancellation requested: Provide clear cancellation access and optional support, pause or alternative plan.

Do not obstruct or manipulate cancellation.

Staff workload

Automate routine member invitations, reminders, recommendations and follow-ups.

Send staff only meaningful exceptions and tasks requiring human intervention.

Target fewer than 30 minutes of routine community administration per studio per week, excluding exceptional moderation and support situations.

This is an operating target to validate, not a guaranteed result.

19. MEMBERSHIP AND PRICING MODEL

Build flexible subscription infrastructure.

Proposed packages for testing:

BAYSE Essential — £19.99/month

* On-demand classes
* Training programmes
* Recipe library
* Basic meal planning
* Progress tracking
* Eligible community access

BAYSE Club — £39.99/month

* Everything in Essential
* Selected or defined live class access
* Group coaching
* Full eligible community features
* Challenges
* Expanded programme support

BAYSE Coaching — £79.99/month

* Everything in Club
* Defined individual coach contact
* Structured personal check-ins
* Additional appropriate nutrition coaching support

These prices are hypotheses.

Do not treat them as confirmed live subscription prices until approved.

Existing studio members

Support configurable digital access linked to the studio membership.

Options to test:

* Basic digital access included
* Full digital upgrade
* Premium coaching upgrade

Avoid charging members twice for benefits already included in their studio agreement.

Stripe

Implement:

* Monthly and annual subscriptions
* Trials
* Upgrades
* Downgrades
* Cancellations
* Billing history
* Payment failures
* Customer billing portal
* Refund administration
* Discount codes
* Subscription entitlements

Use secure server-side verification and webhooks.

20. PROGRESS AND ACCOUNTABILITY

Build an attractive personal progress dashboard.

Track:

* Classes completed
* Minutes trained
* Consistency over time
* Programme milestones
* Live class attendance
* Strength and mobility goals where appropriate
* Optional wellness check-ins
* Community challenge participation

Allow members to set personal objectives.

Optional body-weight tracking must remain private and should not be the primary measure of success.

Do not present engagement scores as clinical health indicators.

21. NOTIFICATIONS

Build notifications around important events.

Examples:

* New programme week
* Live class reminder
* Upcoming class booking
* Coach response
* New message in joined community group
* Padel match needs another player
* Walking activity nearby
* Event cancelled
* Activity reminder
* Trial ending
* Subscription issue

Email notifications first.

Prepare architecture for later mobile push notifications.

Allow fine-grained opt-in and opt-out preferences.

22. INSTRUCTOR DASHBOARD

Instructors need a separate secure dashboard.

Required features:

* Their upcoming live classes
* Class attendance
* Assigned coaching groups
* Member questions
* Programme notes
* Content management where authorised
* Class feedback
* Personal schedule

The interface should minimise administrative work.

23. STUDIO MANAGER DASHBOARD

Studio managers need a lightweight view.

Show:

* Studio membership summary
* Relevant attendance and engagement indicators
* Outstanding retention tasks
* Local community activity
* Safety reports requiring attention
* Important member support issues

Managers should not have to:

* Manually organise every padel game
* Arrange every walking group
* Approve every ordinary member event
* Manually send every reminder
* Manage routine waiting lists
* Act as full-time community hosts

Use automation wherever reasonable.

24. CENTRAL ADMINISTRATION

Build a full administrative dashboard for BAYSE headquarters.

Member administration

Search and manage users, profiles, membership access and support issues.

Content management

Manage:

* Videos
* Classes
* Categories
* Instructors
* Programmes
* Recipes
* Nutrition content
* Wellness articles

Live classes

Manage schedules, capacities, instructors, cancellations and approved recordings.

Community

Manage clubs, groups, reports, moderation and member restrictions.

Subscriptions

View Stripe-backed subscription status, revenue metrics and payment issues.

Retention

View churn, attendance trends, member engagement and intervention workflows.

Business analytics

Track:

* Active digital members
* Linked studio members
* Monthly recurring revenue
* Subscription conversion
* Cancellations
* Churn
* Trial conversion
* On-demand usage
* Live class attendance
* Community participation
* Club activity
* Studio retention

Administration controls

Provide:

* User permissions
* Settings
* Notification templates
* Audit logs
* Feature flags
* Content publication controls

25. DATA AND TECHNICAL ARCHITECTURE

Recommended stack:

Frontend: Next.js, React, TypeScript.

Design: Tailwind CSS and reusable BAYSE components.

Backend / Database: Supabase and PostgreSQL, with row-level security.

Authentication: Supabase Auth or an equivalent validated solution.

Payments: Stripe Billing.

Video Streaming: Mux or a comparable secure streaming provider.

Live Sessions: Zoom integration.

Email: Transactional email provider.

Hosting: Production hosting with staging and deployment pipelines.

Analytics: Privacy-conscious product analytics plus billing and engagement events.

Claude should validate technical suitability before committing to implementation.

Data model

Create entities covering:

* Users and profiles
* Roles and permissions
* Studio locations
* Studio membership links
* Subscription plans
* Subscriptions and entitlements
* Coaches and instructors
* Training preferences
* Onboarding answers
* Workout videos
* On-demand classes
* Live classes
* Bookings and attendance
* Training programmes
* Programme enrolments
* Completed workouts
* Progress metrics
* Coaching conversations
* Recipes
* Meal plans
* Shopping lists
* Nutrition preferences
* Wellness preferences
* Consent records
* Community groups
* Group membership
* Posts and comments
* Club activities
* Activity RSVPs
* Waiting lists
* Group conversations
* Community challenges
* Notifications
* Moderation reports
* Retention events
* Audit logs

Ensure all systems use one coherent user identity and permissions model.

26. SECURITY AND PRIVACY

Treat security as a release requirement.

Implement:

* Secure authentication
* Server-side authorisation
* Role-based access
* Database row-level security
* Verified Stripe webhooks
* Secure API integrations
* Rate limiting
* Moderation controls
* Appropriate backups
* Audit logs
* Secure file handling
* Privacy settings
* User deletion and data export mechanisms
* Confidentiality of member information
* Data minimisation

Protect sensitive wellness and health information.

Where UK GDPR or EU GDPR applies, implement appropriate lawful bases, explicit consent for special-category data where needed, and user rights processes.

Do not share private health information with coaches, advertisers or community members without an appropriate basis and necessary authorisation.

Require professional review before releasing specialist health advice.

27. DEVELOPMENT ROADMAP

Phase 1 — Platform Foundation

* Architecture
* Database
* Authentication
* Role permissions
* Design system
* Member profiles
* Onboarding
* Subscription infrastructure
* Core admin framework

Phase 2 — Training and On-Demand

* Video library
* Video player
* Filters and search
* Training programmes
* Daily dashboard
* Progress tracking

Phase 3 — Live and Coaching

* Zoom integration
* Timetable
* Booking
* Attendance
* Instructor tools
* Coaching conversations

Phase 4 — Nutrition and Wellness

* Recipes
* Meal planning
* Shopping lists
* Educational content
* Optional wellness check-ins

Phase 5 — Community and BAYSE Clubs

* Member groups
* Local studio communities
* Padel Club
* Walk Club
* Social Club
* BAYSE Circles
* Member-created activities
* RSVPs and waiting lists
* Automated reminders
* Moderation

Phase 6 — Studio Retention Integration

* Studio membership linking
* Attendance data integration where supported
* Existing retention workflows
* Local community activation
* Studio manager dashboard
* Central reporting

Phase 7 — Production Readiness

* Payment testing
* Booking testing
* Video testing
* Security review
* Privacy review
* Mobile QA
* Accessibility testing
* Performance optimisation
* Deployment and monitoring
* Production launch checklist

All seven phases describe the core target release. Do not silently move required capabilities into an indefinite future backlog.

Build each phase in small, testable increments.

28. ACCEPTANCE CRITERIA

The product is not considered complete until these flows work:

1. New member completes onboarding.
2. Member receives a relevant personalised programme.
3. Member purchases or activates an appropriate subscription.
4. Member watches an on-demand class.
5. Completed class updates progress.
6. Member books and joins a live Zoom class.
7. Attendance is recorded.
8. Member can view recipes and generate a shopping list.
9. Member can ask an authorised coach a question.
10. Coach can respond through the platform.
11. Member can join their eligible studio community.
12. Member creates a padel game.
13. Other members join and capacity updates correctly.
14. Waiting lists work.
15. Automated activity reminders work.
16. Member creates or joins a walk or social event.
17. Member can report problematic content or another member.
18. Moderators can resolve reports.
19. Studio managers see appropriate limited local information.
20. Administrators can manage content, subscriptions and relevant activity.
21. Member cancellation correctly updates entitlements.
22. Unauthorized access to private member information is prevented.
23. The main workflows operate properly on mobile devices.
24. Integration failures produce useful errors and can be recovered from.

Use test accounts and test payment infrastructure before live release.

29. GITHUB AND DEVELOPMENT MANAGEMENT

Use a private repository, provisionally named:

bayse-live

Maintain:

* README
* Product requirements
* Architecture diagrams
* Database documentation
* Environment variable example
* API and integration documentation
* Development milestones
* Known issues
* Test coverage and instructions
* Deployment documentation

Never commit credentials, API secrets or sensitive member data.

Use version control, feature branches and clear commits.

Track implementation status honestly.

Differentiate between:

* Complete and tested
* Built but not tested
* Mocked
* Not yet implemented

30. DIRECT INSTRUCTIONS TO CLAUDE

Act as the lead product engineer and technical architect for BAYSE.

You have been provided with the complete business vision and product requirements.

Your job is to build a cohesive, high-quality working application rather than a set of unrelated demonstrations.

Work systematically.

First deliverables:

1. Proposed final technical architecture
2. Database schema and relationships
3. Access-control design
4. Complete screen map
5. Design system and reusable components
6. GitHub project structure
7. Phased engineering plan with dependencies
8. Acceptance tests for each milestone

Then begin Phase 1 implementation.

Before claiming a feature is complete, ensure the necessary database, backend, user interface, permissions and testing are connected.

Do not use fake integrations and claim they work.

Do not expose secrets.

Do not launch publicly, start real billing or message real members without explicit approval.

Retain product consistency between every phase.

Crucial priorities:

* On-demand Pilates must be included.
* Live interactive classes must be included.
* Nutrition must be included.
* Coaching must be included.
* Women’s wellness must be included.
* Community must be central.
* BAYSE Padel, Walk and Social Clubs must be self-organised.
* BAYSE Circles must encourage authentic connections.
* Studio retention must be a core business goal.
* Staff administration must remain minimal.
* BAYSE Wellness Club has been removed.
* Physical studios and online memberships must work together.

Overall objective:

Create a beautiful, premium women’s fitness and wellness ecosystem that makes members feel supported, connected and motivated—whether they train online, attend BAYSE studios or simply want to belong to a supportive community.

Begin by presenting the architecture and milestone plan, then build the initial project foundation.