export interface LoginResponse {
    id:                     string;
    email:                  string;
    fullName:               string;
    isActive:               boolean;
    roles:                  string[];
    biometricEnabled:       boolean;
    deviceToken:            null;
    token:                  string;
    allowMultipleSessions?: boolean; // Opcional con valor por defecto
}
