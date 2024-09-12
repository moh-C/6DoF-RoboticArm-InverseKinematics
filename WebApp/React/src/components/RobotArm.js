import * as math from 'mathjs';

class RobotArm {
    constructor(dhParams) {
        if (!Array.isArray(dhParams) || dhParams.length !== 6 || !dhParams.every(joint => joint.length === 4)) {
            throw new Error("dhParams must be a list of 6 joints, each with 4 parameters");
        }

        this.dhParams = dhParams;
        this.jointAngles = new Array(6).fill(0);
        this.jointPositions = new Array(6).fill(null).map(() => [0, 0, 0]);
        this.T = math.identity(4);
        this.initializePose();
    }

    initializePose() {
        this.setPose(this.jointAngles);
    }

    setDhParams(dhParams) {
        if (!Array.isArray(dhParams) || dhParams.length !== 6 || !dhParams.every(joint => joint.length === 4)) {
            throw new Error("dhParams must be a list of 6 joints, each with 4 parameters");
        }
        this.dhParams = dhParams;
        this.initializePose();
    }

    getDhParams() {
        return Object.fromEntries(
            this.dhParams.map((params, i) => [
                `joint_${i}`,
                {
                    theta_home: Number(params[0].toFixed(4)),
                    d: Number(params[1].toFixed(4)),
                    a: Number(params[2].toFixed(4)),
                    alpha: Number(params[3].toFixed(4))
                }
            ])
        );
    }

    dhTransform(theta, d, a, alpha) {
        return math.matrix([
            [Math.cos(theta), -Math.sin(theta) * Math.cos(alpha), Math.sin(theta) * Math.sin(alpha), a * Math.cos(theta)],
            [Math.sin(theta), Math.cos(theta) * Math.cos(alpha), -Math.cos(theta) * Math.sin(alpha), a * Math.sin(theta)],
            [0, Math.sin(alpha), Math.cos(alpha), d],
            [0, 0, 0, 1]
        ]);
    }

    setPose(jointAngles) {
        if (!Array.isArray(jointAngles) || jointAngles.length !== 6) {
            throw new Error("jointAngles must be an array of 6 floats");
        }

        this.jointAngles = jointAngles.map(Number);
        const jointAnglesRad = this.jointAngles.map(angle => angle * Math.PI / 180);
        this.T = math.identity(4);
        this.jointPositions = new Array(6).fill(null).map(() => [0, 0, 0]);

        for (let i = 0; i < 6; i++) {
            const [thetaHome, d, a, alpha] = this.dhParams[i];
            const theta = thetaHome + jointAnglesRad[i];
            this.T = math.multiply(this.T, this.dhTransform(theta, d, a, alpha));
            this.jointPositions[i] = math.subset(this.T, math.index([0, 1, 2], 3)).toArray().map(Number);
        }

        return this.extractPose();
    }

    getPose() {
        return this.extractPose();
    }

    extractPose() {
        const pos = math.subset(this.T, math.index([0, 1, 2], 3)).toArray().map(Number);
        const rpy = this.rotationMatrixToEulerAngles(math.subset(this.T, math.index([0, 1, 2], [0, 1, 2])));

        return {
            x: Number(pos[0].toFixed(4)),
            y: Number(pos[1].toFixed(4)),
            z: Number(pos[2].toFixed(4)),
            roll: Number((rpy[0] * 180 / Math.PI).toFixed(2)),
            pitch: Number((rpy[1] * 180 / Math.PI).toFixed(2)),
            yaw: Number((rpy[2] * 180 / Math.PI).toFixed(2))
        };
    }

    rotationMatrixToEulerAngles(R) {
        let sy = Math.sqrt(R.get([0, 0]) * R.get([0, 0]) + R.get([1, 0]) * R.get([1, 0]));
        let singular = sy < 1e-6;

        let x, y, z;
        if (!singular) {
            x = Math.atan2(R.get([2, 1]), R.get([2, 2]));
            y = Math.atan2(-R.get([2, 0]), sy);
            z = Math.atan2(R.get([1, 0]), R.get([0, 0]));
        } else {
            x = Math.atan2(-R.get([1, 2]), R.get([1, 1]));
            y = Math.atan2(-R.get([2, 0]), sy);
            z = 0;
        }
        return [x, y, z];
    }

    getJointPositions() {
        return this.jointPositions.map(pos => ({
            x: Number(pos[0].toFixed(4)),
            y: Number(pos[1].toFixed(4)),
            z: Number(pos[2].toFixed(4))
        }));
    }
}

export default RobotArm;