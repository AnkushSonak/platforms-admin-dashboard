export interface ExamEvent{
    id: string;
    examEventTitle: string;
    examEventDescription: string;
    examEventSlug: string;
    examEventName: string;
    examEventOrganization: string;
    examEventType: string;
    examEventTag: string;
    examEventTagColor: string;
    examEventLocation: string;
    examEventApplicants: string[];
    examEventImage: string;
    examEventDate: Date;
    examEventPattern: any;
    examEventVacancies: any;
    examEventEligibility: any;
    examEventApplicationFee: any;
    examEventImportantDates: any;
    examEventDownloadLink: string;
    examEventOfficialLink: string;
    isExamEventNew: boolean;
    examEventViewCount: number;
}