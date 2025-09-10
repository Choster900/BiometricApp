export interface User {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
    biometricEnabled: boolean;
    deviceToken: null | string;
}
