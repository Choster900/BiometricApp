export interface User {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    biometricEnabled: boolean;
    deviceToken: null | string;
    allDeviceSessions: DeviceSession[];
    allowMultipleSessions: boolean;
}

interface DeviceSession {
    deviceToken: string;
    isActive: boolean;
    sessionId: string;
}
