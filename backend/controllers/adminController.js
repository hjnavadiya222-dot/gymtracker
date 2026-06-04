const User = require('../models/User');
const Exercise = require('../models/Exercise');
const WorkoutLog = require('../models/WorkoutLog');
const Routine = require('../models/Routine');

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all logs
const getAllLogs = async (req, res) => {
  try {
    const logs = await WorkoutLog.find({}).populate('userId', 'email').populate('exerciseId', 'name');
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create exercise
const createExercise = async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const seedDatabase = async (req, res) => {
  try {
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
      { "day": "Day 4 - Thu", "bodyParts": ["Chest", "Triceps", "Shoulders"], "exercises": [
        { "name": "Incline dumbbell press", "bodyPart": "Chest", "sets": 4, "reps": "8-10" },
        { "name": "Bench press", "bodyPart": "Chest", "sets": 4, "reps": "8-10" },
        { "name": "Pec deck fly", "bodyPart": "Chest", "sets": 3, "reps": "10-12" },
        { "name": "Cable fly", "bodyPart": "Chest", "sets": 3, "reps": "12" },
        { "name": "Overhead cable extension", "bodyPart": "Triceps", "sets": 3, "reps": "10-12" },
        { "name": "Tricep pushdown", "bodyPart": "Triceps", "sets": 3, "reps": "10-12" },
        { "name": "Reverse-grip pushdown", "bodyPart": "Triceps", "sets": 3, "reps": "10-12" },
        { "name": "Rear delt fly", "bodyPart": "Shoulders", "sets": 3, "reps": "15" },
        { "name": "Dumbbell overhead press", "bodyPart": "Shoulders", "sets": 3, "reps": "10" }
      ]},
      { "day": "Day 5 - Fri", "bodyParts": ["Back", "Biceps", "Shoulders"], "exercises": [
        { "name": "Lat pulldown", "bodyPart": "Back", "sets": 4, "reps": "10" },
        { "name": "Seated cable row", "bodyPart": "Back", "sets": 4, "reps": "10" },
        { "name": "Chest-supported row", "bodyPart": "Back", "sets": 3, "reps": "10-12" },
        { "name": "Barbell curl", "bodyPart": "Biceps", "sets": 3, "reps": "10-12" },
        { "name": "Incline dumbbell curl", "bodyPart": "Biceps", "sets": 3, "reps": "10-12" },
        { "name": "Hammer curl", "bodyPart": "Biceps", "sets": 3, "reps": "10-12" },
        { "name": "Lateral raise", "bodyPart": "Shoulders", "sets": 3, "reps": "15" }
      ]},
      { "day": "Day 6 - Sat", "bodyParts": ["Shoulders", "Core", "Abs"], "exercises": [
        { "name": "Barbell overhead press", "bodyPart": "Shoulders", "sets": 3, "reps": "8" },
        { "name": "Plank", "bodyPart": "Core", "sets": 3, "reps": "60s" },
        { "name": "Hanging leg raise", "bodyPart": "Core", "sets": 3, "reps": "15" },
        { "name": "Crunches", "bodyPart": "Core", "sets": 3, "reps": "20" },
        { "name": "Side plank", "bodyPart": "Core", "sets": 3, "reps": "30s" }
      ]}
    ];

    await Exercise.deleteMany({});
    await Routine.deleteMany({});

    for (const dayPlan of seedData) {
      const exerciseIds = [];
      for (const exData of dayPlan.exercises) {
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

    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, deleteUser, getAllLogs, createExercise, seedDatabase };
