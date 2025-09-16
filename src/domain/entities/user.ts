export interface User {
    id:                    string;
    email:                 string;
    fullName:              string;
    isActive:              boolean;
    roles:                 string[];
    foundDeviceToken:      FoundDeviceToken;
    allowMultipleSessions: boolean;
}

export interface FoundDeviceToken {
    deviceToken:      string;
    isActive:         boolean;
    sessionId:        string;
    biometricEnabled: boolean;
    message:          string;
}
