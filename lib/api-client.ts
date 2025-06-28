/**
 * API client for making HTTP requests with consistent error handling
 * and response parsing
 */

/**
 * Configuration options for API requests
 */
interface ApiOptions {
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
}

/**
 * Standard API response format
 */
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

/**
 * Creates a fully qualified URL from the given path
 */
const getUrl = (path: string): string => {
  // Use environment variable or default to local development
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Generic error handler for API requests
 */
const handleApiError = async (response: Response): Promise<string> => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      return errorData.error || errorData.message || `Error: ${response.status}`;
    } else {
      const textError = await response.text();
      return textError || `Error: ${response.status}`;
    }
  } catch (err) {
    return `Network error: ${response.status}`;
  }
};

/**
 * Makes a GET request to the API
 */
export async function apiGet<T>(
  path: string, 
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(getUrl(path), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: options?.cache,
      next: {
        revalidate: options?.revalidate,
        tags: options?.tags,
      }
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err) {
    console.error('API GET error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      status: 500,
    };
  }
}

/**
 * Makes a POST request to the API
 */
export async function apiPost<T>(
  path: string, 
  body: any, 
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(getUrl(path), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      cache: options?.cache,
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err) {
    console.error('API POST error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      status: 500,
    };
  }
}

/**
 * Makes a PUT request to the API
 */
export async function apiPut<T>(
  path: string, 
  body: any, 
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(getUrl(path), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(body),
      cache: options?.cache,
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err) {
    console.error('API PUT error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      status: 500,
    };
  }
}

/**
 * Makes a DELETE request to the API
 */
export async function apiDelete<T>(
  path: string, 
  options?: ApiOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(getUrl(path), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      cache: options?.cache,
    });

    if (!response.ok) {
      const errorMessage = await handleApiError(response);
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    const data = await response.json();
    
    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (err) {
    console.error('API DELETE error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown error occurred',
      status: 500,
    };
  }
}
