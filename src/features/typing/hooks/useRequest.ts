import useSWR, { SWRConfiguration, SWRResponse } from 'swr';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { api } from '@/lib/axios';
import qs from 'qs';

export type GetRequest = AxiosRequestConfig | null;

interface Return<Data, Error> extends Pick<
  SWRResponse<AxiosResponse<Data>, AxiosError<Error>>,
  'isValidating' | 'error' | 'mutate'
> {
  data: Data | undefined;
  response: AxiosResponse<Data> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pagination: any;
}

export interface Config<Data = unknown, Error = unknown> extends Omit<
  SWRConfiguration<AxiosResponse<Data>, AxiosError<Error>>,
  'fallbackData'
> {
  fallbackData?: Data;
}

const getRequestKey = (request: GetRequest) => {
  if (!request) return null;
  const query = request.params ? `?${qs.stringify(request.params)}` : '';
  return `${request.method || 'GET'} ${request.url}${query}`;
};

export default function useRequest<Data = unknown, Error = unknown>(
  request: GetRequest,
  { fallbackData, ...config }: Config<Data, Error> = {}
): Return<Data, Error> {
  const key = getRequestKey(request);

  const {
    data: response,
    error,
    isValidating,
    mutate,
  } = useSWR<AxiosResponse<Data>, AxiosError<Error>>(
    key,
    request ? () => api.request<Data>(request) : null,
    {
      ...config,
      revalidateOnFocus: false,
      fallbackData:
        fallbackData &&
        ({
          status: 200,
          statusText: 'InitialData',
          config: request!,
          headers: {},
          data: fallbackData,
        } as AxiosResponse<Data>),
    }
  );

  const responseData = response?.data as Data | undefined;

  return {
    data: responseData,
    response,
    error,
    isValidating,
    mutate,
    pagination: response?.data,
  };
}
