import { UUID } from "crypto";

export interface IUser {
    id: UUID;
    mobile: string;
    email: string;
    authentication?:{
        password: string;
        salt: string;
        sessionToken: string;
    }
    role?: string;
    profile: {
        firstName: string;
        lastName: string;
        avatarUrl: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        zip: string;
        termsAndConditions: boolean;
        privacyPolicy: boolean;
        emailNotifications: boolean;
        smsNotifications: boolean;
        dob: Date;
    }
    companyId: UUID;
    activationToken?: string;
    status: string;
    createAt?: Date;
    updateAt?: Date;
    
}