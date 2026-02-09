import axios from "axios";

import { authClient, refreshAccessToken } from "@/lib/authClient";
import type { AuthProvider, StoredUser } from "@/lib/authStorage";

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

const fetchMe = async (accessToken: string) => {
  return authClient.get<MeResponse>("/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

const isUnauthorized = (error: unknown) => {
  return axios.isAxiosError(error) && error.response?.status === 401;
};

export const bootstrapSession = async (): Promise<{
  accessToken: string;
  user: StoredUser;
}> => {
  let accessToken = await refreshAccessToken();
  let meResponse;
  try {
    meResponse = await fetchMe(accessToken);
  } catch (error) {
    if (isUnauthorized(error)) {
      accessToken = await refreshAccessToken();
      meResponse = await fetchMe(accessToken);
    } else {
      throw error;
    }
  }
  return {
    accessToken,
    user: mapMeToStoredUser(meResponse.data),
  };
};
