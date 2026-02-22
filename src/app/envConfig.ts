// import "server-only";

export const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;
export const DEFAULT_LOG_LEVEL = process.env.NEXT_PUBLIC_LOG_LEVEL || "info";

/* ------------------------ JOB API Endpoints ------------------------ */
export const JOBS_API = `${BACKEND_BASE_URL}/jobs`;
export const GET_JOB_BY_SLUG_API = `${BACKEND_BASE_URL}/job/slug`;


/* ------------------------ RESULT API Endpoints ------------------------ */
export const RESULTS_API = `${BACKEND_BASE_URL}/results`;


/* ------------------------ ADMIT_CARD API Endpoints ------------------------ */
export const ADMIT_CARDS_API = `${BACKEND_BASE_URL}/admit-cards`;


/* ------------------------ ANSWER_KEYS API Endpoints ------------------------ */
export const ANSWER_KEYS_API = `${BACKEND_BASE_URL}/answer-keys`;


/* ------------------------ NEWS_AND_NTFN API Endpoints ------------------------ */
export const NEWS_AND_NTFN_API = `${BACKEND_BASE_URL}/news-and-notifications`;
export const GET_NEWS_AND_NTFN_FOR_FORMS_API = `${BACKEND_BASE_URL}/news-and-notifications/forFormBySlug`;


/* ------------------------ CATEGORY API Endpoints ------------------------ */
export const CATEGORY_API = `${BACKEND_BASE_URL}/categories`;


/* ------------------------ STATE API Endpoints ------------------------ */
export const STATE_API = `${BACKEND_BASE_URL}/states`;


/* ------------------------ ORGANIZATION API Endpoints ------------------------ */
export const ORGANIZATION_API = `${BACKEND_BASE_URL}/organizations`;


/* ------------------------ QUALIFICATION API Endpoints ------------------------ */
export const QUALIFICATIONS_API = `${BACKEND_BASE_URL}/qualifications`;


/* ------------------------ TAG API Endpoints ------------------------ */
export const TAGS_API = `${BACKEND_BASE_URL}/tags`;


// export const LOGIN_API = `${BACKEND_BASE_URL}/auth/login`;
// export const REGISTER_API = `${BACKEND_BASE_URL}/auth/register`;
