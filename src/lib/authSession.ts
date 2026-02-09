import axios from "axios";

import apiClient from "@/lib/apiClient";
import { refreshAccessToken } from "@/lib/authClient";
import type { AuthProvider, StoredUser } from "@/lib/authStorage";
import { useStore } from "@/store/useStore";

export const POST_LOGIN_REDIRECT_KEY = "gomguk_post_login_redirect";

export interface MeResponse {
  id: number;
  provider: string;
  email: string;
  name: string;
  profile_image?: string | null;
  meta: Record<string, unknown>;
}

export const mapMeToStoredUser = (me: MeResponse): StoredUser => ({
  id: String(me.id),
  name: me.name,
  provider: me.provider as AuthProvider,
  createdAt: new Date().toISOString(),
  avatarUrl: me.profile_image ?? undefined,
});

const setAccessToken = (token: string | null) => useStore.getState().setAccessToken(token);

const fetchMe = async () => {
  return apiClient.get<MeResponse>("/me");
};

const isUnauthorized = (error: unknown) => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

export const bootstrapSession = async (): Promise<{
  accessToken: string;
  user: StoredUser;
}> => {
  let accessToken = await refreshAccessToken();
  setAccessToken(accessToken);
  let meResponse;
  try {
    meResponse = await fetchMe();
  } catch (error) {
    if (isUnauthorized(error)) {
      accessToken = await refreshAccessToken();
      setAccessToken(accessToken);
      meResponse = await fetchMe();
    } else {
      throw error;
    }
  }
  return {
    accessToken,
    user: mapMeToStoredUser(meResponse.data),
  };
};
