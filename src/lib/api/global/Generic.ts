const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_SERVER_BASE_URL;

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
};

export type ApiMeta = {
  total: number;
  currentPage: number;
  limit?: number ;
  totalPages: number;
};

export type ApiResponse<T> = {
  status?: string;
  message?: string;
  data?: {
    items?: T[];
    meta?: ApiMeta;
  };
};

type FetchBySlugOptions = {
  revalidate?: number;
  timeoutMs?: number;
  entityName?: string; // logging only
};

export type CrudResult<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

export type CrudOptions = {
  timeoutMs?: number;
  entityName?: string; // for logging only
  credentials?: RequestCredentials;
  headers?: Record<string, string>;
};


export const DEFAULT_PAGINATED_RESULT: PaginatedResult<never> = {
  data: [],
  total: 0,
  page: 1,
  totalPages: 1,
};

const FETCH_TIMEOUT_MS = 10_000;

export async function fetchWithTimeout( input: RequestInfo, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(input, { ...init, signal: controller.signal, }).finally(() => clearTimeout(timeout));
}


export function isValidPaginatedApiResponse<T>( payload: unknown ): payload is ApiResponse<T> {
  if (!payload || typeof payload !== "object") return false;

  const data = (payload as ApiResponse<T>).data;
  const meta = data?.meta;

  return (
    Array.isArray(data?.items) &&
    typeof meta?.total === "number" &&
    typeof meta?.currentPage === "number" &&
    typeof meta?.totalPages === "number"
  );
}

export async function getPaginatedEntity<T>( query: string, entityUrl: string, options?: { revalidate?: number; timeoutMs?: number; entityName?: string; }): Promise<PaginatedResult<T>> {
  const { revalidate = 3600, timeoutMs = FETCH_TIMEOUT_MS, entityName = "entity",} = options ?? {};

  const url = new URL(entityUrl, backendBaseUrl);
  url.search = query;

  console.debug(`[getPaginatedEntity] Fetching ${entityName}`, { url: url.toString(),});

  try {
    const response = await fetchWithTimeout( url.toString(), { next: { revalidate } }, timeoutMs );

    if (!response.ok) {
      console.error(`[getPaginatedEntity] API error`, { entityName, status: response.status, statusText: response.statusText, });
      return DEFAULT_PAGINATED_RESULT;
    }

    const json: unknown = await response.json();

    if (!isValidPaginatedApiResponse<T>(json)) {
      console.error(`[getPaginatedEntity] Invalid response shape`, json);
      return DEFAULT_PAGINATED_RESULT;
    }

    const { items, meta } = json.data!;

    console.info(`[getPaginatedEntity] Success`, { entityName, count: items!.length, page: meta!.currentPage, });

    return { data: items!, total: meta!.total, page: meta!.currentPage, totalPages: meta!.totalPages, };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(`[getPaginatedEntity] Request timed out`, { entityName, });
    } else {
      console.error(`[getPaginatedEntity] Unexpected error`, { entityName, error, });
    }

    return DEFAULT_PAGINATED_RESULT;
  }
}

export async function getEntityBySlug<T>(entityUrl: string, slug: string, options?: FetchBySlugOptions ): Promise<T | null> {
  const { revalidate = 3600, timeoutMs = FETCH_TIMEOUT_MS, entityName = "entity", } = options ?? {};

  const url = new URL(`${entityUrl}/${slug}`, backendBaseUrl);

  console.debug(`[getEntityBySlug] Fetching ${entityName}`, { slug, url: url.toString(), });

  try {
    const response = await fetchWithTimeout( url.toString(), { next: { revalidate } }, timeoutMs );

    if (response.status === 404) {
      console.info(`[getEntityBySlug] ${entityName} not found`, { slug });
      return null;
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[getEntityBySlug] API error`, { entityName, slug, status: response.status, statusText: response.statusText, body: errorBody, });
      return null;
    }

    const json: unknown = await response.json();

    // Optional runtime guard hook (can be extended later)
    if (!json || typeof json !== "object") {
      console.error(`[getEntityBySlug] Invalid response payload`, { entityName, slug, json, });
      return null;
    }
    const data = (json as any).data;
    console.info(`[getEntityBySlug] Success`, { entityName, slug, });

    return data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(`[getEntityBySlug] Request timed out`, { entityName, slug, });
    } else {
      console.error(`[getEntityBySlug] Unexpected error`, { entityName, slug, error, });
    }
    return null;
  }
}

export async function createEntity<T, R = any>( endpoint: string, data: T, options?: CrudOptions): Promise<CrudResult<R>> {
  const {
    timeoutMs = FETCH_TIMEOUT_MS,
    entityName = "entity",
    credentials = "include",
    headers = { "Content-Type": "application/json" },
  } = options ?? {};

  const url = new URL(endpoint, backendBaseUrl);

  console.debug(`[createEntity] Creating ${entityName}`, { url, data });

  try {
    const response = await fetchWithTimeout(
      url.toString(),
      {
        method: "POST",
        headers,
        body: JSON.stringify(data),
        credentials,
      },
      timeoutMs
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(`[createEntity] API error for ${entityName}`, {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      return { success: false, message: text || "Unknown error" };
    }

    const json = text ? JSON.parse(text) : {};
    return {
      success: true,
      message: `${entityName} created successfully`,
      data: (json as any).data,
    };
  } catch (error: any) {
    console.error(`[createEntity] Unexpected error for ${entityName}`, error);
    return { success: false, message: error.message || "Unknown error" };
  }
}

export async function updateEntity<T, R = any>( endpoint: string, id: string, data: T, options?: CrudOptions ): Promise<CrudResult<R>> {
  const {
    timeoutMs = FETCH_TIMEOUT_MS,
    entityName = "entity",
    credentials = "include",
    headers = { "Content-Type": "application/json" },
  } = options ?? {};

  const url = new URL(`${endpoint}/${encodeURIComponent(id)}`, backendBaseUrl);

  console.debug(`[updateEntity] Updating ${entityName}`, { url, data });

  try {
    const response = await fetchWithTimeout(
      url.toString(),
      {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
        credentials,
      },
      timeoutMs
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(`[updateEntity] API error for ${entityName}`, {
        status: response.status,
        statusText: response.statusText,
        body: text,
      });
      return { success: false, message: text || "Unknown error" };
    }

    const json = text ? JSON.parse(text) : {};
    return {
      success: true,
      message: `${entityName} updated successfully`,
      data: (json as any).data,
    };
  } catch (error: any) {
    console.error(`[updateEntity] Unexpected error for ${entityName}`, error);
    return { success: false, message: error.message || "Unknown error" };
  }
}


// How to use this generic function for fetching jobs in useJobs hook:

// // Jobs
// const jobs = await getPaginatedEntity<Job>(
//   "type=jobs&page=1",
//   GET_JOB_LISTINGS,
//   { entityName: "jobs" }
// );

// const job = await getEntityBySlug<Job>("software-engineer", {
//   entityName: "job",
// });

// const createResult = await createEntity<AdmitCardFormDTO>(
//   "/admitCard",
//   admitCardFormData,
//   { entityName: "Admit Card" }
// );

// const updateResult = await updateEntity<AdmitCardFormDTO>(
//   "/admitCard",
//   admitCardId,
//   admitCardFormData,
//   { entityName: "Admit Card" }
// );
