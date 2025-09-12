export interface LoginResponse {
    id:                    string;
    email:                 string;
    fullName:              string;
    isActive:              boolean;
    roles:                 string[];
    allowMultipleSessions: boolean;
    biometricEnabled:      boolean;
    activeDeviceTokens:    string[];
    deviceTokens:          DeviceToken[];
    token:                 string;
}

export interface DeviceToken {
    deviceToken:      string;
    isActive:         boolean;
    sessionId:        string;
    biometricEnabled: boolean;
}
