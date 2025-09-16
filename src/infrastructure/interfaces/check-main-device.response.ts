export interface CheckMainDeviceResponse {
    deviceToken:          string;
    isMainDevice:         boolean;
    message:              string;
    requiresConfirmation: boolean;
}
