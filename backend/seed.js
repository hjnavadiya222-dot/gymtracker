const mongoose = require('mongoose');
require('dotenv').config();

const Exercise = require('./models/Exercise');
const Routine = require('./models/Routine');

// The JSON data to use for the exercises and routine
const seedData = [
  { "day": "Day 1 - Mon", "bodyParts": ["Chest", "Triceps", "Shoulders"], "exercises": [
    { "name": "Bench press", "bodyPart": "Chest", "sets": 4, "reps": "6-8" },
    { "name": "Incline dumbbell press", "bodyPart": "Chest", "sets": 3, "reps": "8-10" },
    { "name": "Cable fly", "bodyPart": "Chest", "sets": 3, "reps": "12" },
    { "name": "Tricep pushdown", "bodyPart": "Triceps", "sets": 3, "reps": "10" },
    { "name": "Overhead dumbbell ext.", "bodyPart": "Triceps", "sets": 3, "reps": "12" },
    { "name": "Dumbbell lateral raise", "bodyPart": "Shoulders", "sets": 4, "reps": "15" },
    { "name": "Face pulls", "bodyPart": "Shoulders", "sets": 3, "reps": "15" }
  ]},
  { "day": "Day 2 - Tue", "bodyParts": ["Back", "Biceps"], "exercises": [
    { "name": "Pull-ups", "bodyPart": "Back", "sets": 4, "reps": "6-8" },
    { "name": "Barbell row", "bodyPart": "Back", "sets": 3, "reps": "8-10" },
    { "name": "Lat pulldown", "bodyPart": "Back", "sets": 3, "reps": "10" },
    { "name": "Barbell curl", "bodyPart": "Biceps", "sets": 3, "reps": "10" },
    { "name": "Hammer curl", "bodyPart": "Biceps", "sets": 3, "reps": "12" }
  ]},
  { "day": "Day 3 - Wed", "bodyParts": ["Quads", "Hamstrings", "Calves"], "exercises": [
    { "name": "Barbell squat", "bodyPart": "Quads", "sets": 4, "reps": "6-8" },
    { "name": "Leg press", "bodyPart": "Quads", "sets": 4, "reps": "10" },
    { "name": "Dumbbell lunges", "bodyPart": "Quads", "sets": 3, "reps": "10" },
    { "name": "Leg extension", "bodyPart": "Quads", "sets": 3, "reps": "12" },
    { "name": "Leg curl", "bodyPart": "Hamstrings", "sets": 3, "reps": "12" },
    { "name": "Standing calf raise", "bodyPart": "Calves", "sets": 3, "reps": "15" }
  ]},
  { "day": "Day 4 - Thu", "bodyParts": ["Biceps", "Triceps", "Shoulders"], "exercises": [
    { "name": "Barbell curl", "bodyPart": "Biceps", "sets": 4, "reps": "10" },
    { "name": "Incline dumbbell curl", "bodyPart": "Biceps", "sets": 3, "reps": "12" },
    { "name": "Hammer curl", "bodyPart": "Biceps", "sets": 3, "reps": "12" },
    { "name": "Tricep pushdown", "bodyPart": "Triceps", "sets": 4, "reps": "10" },
    { "name": "Skull crushers", "bodyPart": "Triceps", "sets": 3, "reps": "10" },
    { "name": "Rope extension", "bodyPart": "Triceps", "sets": 3, "reps": "12" },
    { "name": "Rear delt fly", "bodyPart": "Shoulders", "sets": 3, "reps": "15" },
    { "name": "Dumbbell overhead press", "bodyPart": "Shoulders", "sets": 3, "reps": "10" }
  ]},
  { "day": "Day 5 - Fri", "bodyParts": ["Shoulders", "Chest", "Back"], "exercises": [
    { "name": "Lateral raise", "bodyPart": "Shoulders", "sets": 3, "reps": "15" },
    { "name": "Dumbbell bench press", "bodyPart": "Chest", "sets": 4, "reps": "8-10" },
    { "name": "Incline dumbbell press", "bodyPart": "Chest", "sets": 3, "reps": "8-10" },
    { "name": "Cable fly", "bodyPart": "Chest", "sets": 3, "reps": "12" },
    { "name": "Seated cable row", "bodyPart": "Back", "sets": 4, "reps": "10" },
    { "name": "Lat pulldown", "bodyPart": "Back", "sets": 3, "reps": "10" },
    { "name": "Single-arm dumbbell row", "bodyPart": "Back", "sets": 3, "reps": "10" }
  ]},
  { "day": "Day 6 - Sat", "bodyParts": ["Shoulders", "Core", "Abs"], "exercises": [
    { "name": "Barbell overhead press", "bodyPart": "Shoulders", "sets": 3, "reps": "8" },
    { "name": "Plank", "bodyPart": "Core", "sets": 3, "reps": "60s" },
    { "name": "Hanging leg raise", "bodyPart": "Core", "sets": 3, "reps": "15" },
    { "name": "Crunches", "bodyPart": "Core", "sets": 3, "reps": "20" },
    { "name": "Side plank", "bodyPart": "Core", "sets": 3, "reps": "30s" }
  ]}
];

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gym-tracker';

async function seedDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Exercise.deleteMany({});
    await Routine.deleteMany({});
    console.log('Cleared existing Exercises and Routines');

    for (const dayPlan of seedData) {
      const exerciseIds = [];

      for (const exData of dayPlan.exercises) {
        // Check if exercise already exists (some exercises are repeated, like Lat pulldown)
        let exercise = await Exercise.findOne({ name: exData.name, bodyPart: exData.bodyPart });
        if (!exercise) {
          exercise = await Exercise.create({
            name: exData.name,
            bodyPart: exData.bodyPart,
            defaultSets: exData.sets,
            defaultReps: exData.reps
          });
        }
        exerciseIds.push(exercise._id);
      }

      await Routine.create({
        dayOfWeek: dayPlan.day,
        bodyParts: dayPlan.bodyParts,
        exercises: exerciseIds
      });
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();
