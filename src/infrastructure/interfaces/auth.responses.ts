export interface LoginResponse {
    id:                    string;
    email:                 string;
    fullName:              string;
    isActive:              boolean;
    roles:                 string[];
    biometricEnabled:      boolean;
    allowMultipleSessions: boolean;
    activeDeviceTokens:    string[];
    deviceTokens:          DeviceToken[];
    token:                 string;
}

export interface DeviceToken {
    deviceToken: string;
    isActive:    boolean;
    sessionId:   string;
}
