const WorkoutLog = require('../models/WorkoutLog');
const Exercise = require('../models/Exercise');

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Dates for current week (last 7 days) and last week (7-14 days ago)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const logs = await WorkoutLog.find({ userId, date: { $gte: twoWeeksAgo } }).populate('exerciseId');

    const currentWeekLogs = logs.filter(log => new Date(log.date) >= oneWeekAgo);
    const lastWeekLogs = logs.filter(log => new Date(log.date) >= twoWeeksAgo && new Date(log.date) < oneWeekAgo);

    // Helper: Calculate e1RM
    const calcE1RM = (weight, reps) => weight / (1.0278 - (0.0278 * reps));

    // Helper: Find Top Set e1RM for an exercise from a set of logs
    const findTopE1RM = (weekLogs, exerciseIdStr) => {
      let maxE1RM = 0;
      weekLogs.forEach(log => {
        if (log.exerciseId && log.exerciseId._id.toString() === exerciseIdStr) {
          log.sets.forEach(set => {
            if (set.weight > 0 && set.reps > 0) {
              const e1RM = calcE1RM(set.weight, set.reps);
              if (e1RM > maxE1RM) maxE1RM = e1RM;
            }
          });
        }
      });
      return maxE1RM;
    };

    // Extract all unique exercise IDs from both weeks
    const exerciseMap = new Map();
    logs.forEach(log => {
      if (log.exerciseId) {
        exerciseMap.set(log.exerciseId._id.toString(), log.exerciseId);
      }
    });

    const weekly_summary = [];
    let improvedCount = 0;
    let totalCompared = 0;
    const bodyPartPerformance = {};

    exerciseMap.forEach((exercise, idStr) => {
      const lastWeekMax = findTopE1RM(lastWeekLogs, idStr);
      const currentWeekMax = findTopE1RM(currentWeekLogs, idStr);

      if (lastWeekMax > 0 && currentWeekMax > 0) {
        totalCompared++;
        const change = ((currentWeekMax - lastWeekMax) / lastWeekMax) * 100;
        let status = 'Maintained';
        if (change > 2) {
          status = 'Increased';
          improvedCount++;
        } else if (change < -2) {
          status = 'Decreased';
        }

        weekly_summary.push({
          exerciseName: exercise.name,
          bodyPart: exercise.bodyPart,
          lastWeekE1RM: lastWeekMax.toFixed(2),
          currentWeekE1RM: currentWeekMax.toFixed(2),
          status,
          percentageChange: change.toFixed(1) + '%'
        });

        // Track body part performance
        if (!bodyPartPerformance[exercise.bodyPart]) {
          bodyPartPerformance[exercise.bodyPart] = { improved: 0, total: 0, dropped: 0 };
        }
        bodyPartPerformance[exercise.bodyPart].total++;
        if (status === 'Increased') bodyPartPerformance[exercise.bodyPart].improved++;
        if (status === 'Decreased') bodyPartPerformance[exercise.bodyPart].dropped++;
      }
    });

    let progress_status = 'Not enough data to compare weeks.';
    if (totalCompared > 0) {
      progress_status = `You achieved Progressive Overload on ${improvedCount} out of ${totalCompared} exercises compared to last week!`;
    }

    const coaching_tips = [];
    if (totalCompared === 0) {
      coaching_tips.push("Keep logging your workouts consistently to unlock weekly progress comparisons and AI coaching!");
    } else {
      for (const [bodyPart, stats] of Object.entries(bodyPartPerformance)) {
        if (stats.dropped > 0) {
          coaching_tips.push(`Your ${bodyPart} strength slightly decreased. Make sure you are recovering properly, checking your form, and not overtraining.`);
        } else if (stats.improved === 0 && stats.total > 0) {
          if (bodyPart === 'Chest') {
            coaching_tips.push(`Your Chest exercises plateaued. Try focusing on tricep accessory strength or slowing down the eccentric phase.`);
          } else if (bodyPart === 'Back') {
            coaching_tips.push(`Your Back progress stalled. Focus on mind-muscle connection and pulling with your elbows rather than your biceps.`);
          } else if (bodyPart === 'Legs' || bodyPart === 'Quads' || bodyPart === 'Hamstrings') {
            coaching_tips.push(`Your Leg strength maintained. Consider tweaking your foot placement or adding slight pauses at the bottom of the movement.`);
          } else {
            coaching_tips.push(`No direct progress on ${bodyPart}. Consider changing rep ranges or adding an extra set next week to push past the plateau.`);
          }
        }
      }
      if (improvedCount === totalCompared && totalCompared > 0) {
        coaching_tips.push("Outstanding progress across the board! Keep up the good work and maintain this intensity.");
      }
      if (coaching_tips.length === 0) {
        coaching_tips.push("Great work overall! Make sure to continue prioritizing your protein intake and sleep.");
      }
    }

    res.json({
      weekly_summary,
      progress_status,
      coaching_tips
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalytics };
