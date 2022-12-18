const Instructions = require("../db/models/Instructions");
const InstructionApprovals = require("../db/models/InstructionApprovals");
const Roles = require("../db/models/Roles");
const Enum = require("../config/Enum");

class Stats {
    constructor() {

    }

    async getInstructionStats(query) {
        let totalCount = await Instructions.count({ where: { ...query } });
        let waitingCount = await Instructions.count({ where: { ...query, approval_level: 0 } });
        let approvedCount = await Instructions.count({ where: { ...query, approval_level: { $gt: 0 } } });
        let rejectedCount = await Instructions.count({ where: { ...query, is_active: false } });
        let completedCount = await Instructions.count({ where: { ...query, is_done: true } });

        return { totalCount, waitingCount, approvedCount, rejectedCount, completedCount };

    }

    async getDepartmentStats(query) {
        let maxLevel = await Roles.getMaxLevel();
        let stats = {};
        for (let i = maxLevel; i > 0; i--) {
            stats["Grup " + i] = {
                waitingCount: await Instructions.count({ where: { ...query, approval_level: i - 1 } }),
                rejectedCount: await InstructionApprovals.count({ where: { ...query, level: i, type: Enum.INSTRUCTION_ACTIONS.REJECT } }),
                approvedCount: await InstructionApprovals.count({ where: { ...query, level: i, type: Enum.INSTRUCTION_ACTIONS.APPROVE } })
            }
        }

        return stats;
    }
}

module.exports = Stats;