import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { errorAtom } from '@/atoms/errors';
import type { ApiResponse } from '@/types/fetch';

type AxiosOptions<T> = {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    data?: Record<string, unknown> | string | null;
    params?: Record<string, string | number | boolean>;
    signal?: AbortSignal;
    customHeaders?: Record<string, string>;
    onSuccess?: (response: ApiResponse<T>) => void;
    onError?: (error: Error | unknown) => void;
    withCredentials?: boolean;
    skipGlobalErrorHandler?: boolean;
};

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function useAxios() {
    const navigate = useNavigate();
    const setError = useSetRecoilState(errorAtom);
    const abortControllerRef = useRef<AbortController | null>(null);

    const axiosInstance = useMemo(() => {
        const instance = axios.create({
            baseURL: apiUrl,
            withCredentials: false,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        instance.interceptors.response.use(
            (response) => response,
            (error) => {
                if (
                    error.response?.status === 401 &&
                    !error.code?.includes('ERR_NETWORK') &&
                    !error.config?.url?.includes('verify-login-otp') &&
                    !error.config?.url?.includes('login')
                ) {
                    navigate('/login');
                }
                return Promise.reject(error);
            }
        );

        return instance;
    }, [navigate]);

    const fetchData = useCallback(
        async <T = unknown>({
            endpoint,
            method = 'GET',
            data = null,
            params = {},
            customHeaders = {},
            onSuccess,
            onError,
            withCredentials = false,
            skipGlobalErrorHandler = false,
        }: AxiosOptions<T>): Promise<ApiResponse<T>> => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            try {
                const config: AxiosRequestConfig = {
                    method,
                    url: endpoint,
                    params,
                    headers: { ...customHeaders },
                    withCredentials,
                    signal: abortControllerRef.current.signal,
                };

                if (data) {
                    config.data = data;
                }

                const response: AxiosResponse = await axiosInstance(config);

                const apiResponse: ApiResponse<T> = {
                    data: response.data as T,
                    statusCode: response.status,
                    message: response.data?.message || 'success',
                };

                if (onSuccess) {
                    onSuccess(apiResponse);
                }

                return apiResponse;
            } catch (error: unknown) {
                if (axios.isCancel(error)) {
                    console.info('Request canceled:', error.message);
                    throw error;
                }

                if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
                    console.info('CORS or Network error detected:', error);
                    const corsError = new Error('CORS error: Please check server configuration');

                    if (onError) {
                        onError(corsError);
                    } else if (!skipGlobalErrorHandler) {
                        setError({
                            title: 'Network Error',
                            message: 'Cannot connect to server. This might be a CORS issue.',
                            record: null,
                        });
                    }
                    throw corsError;
                }

                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : (error as { response?: { data?: { message?: string } } })?.response?.data
                              ?.message || 'An unexpected error occurred';

                if (onError) {
                    onError(error);
                } else if (!skipGlobalErrorHandler) {
                    setError({
                        title: 'API Error',
                        message: `Request to ${endpoint} failed: ${errorMessage}`,
                        record: null,
                    });
                }

                throw error;
            }
        },
        [axiosInstance, setError]
    );

    return fetchData;
}
